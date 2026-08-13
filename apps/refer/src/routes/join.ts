import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import { z } from "zod";
import { schema } from "@refref/coredb";
import { and, asc, desc, eq } from "drizzle-orm";
import { generateGlobalCode } from "@refref/utils";
import type { ProgramConfigV1Type } from "@refref/types";
import {
  escapeHtml,
  renderJoinPage,
  renderJoinSuccessPage,
} from "../lib/render.js";
import {
  isDisposableEmail,
  looksLikeEmail,
  normalizeEmail,
} from "../lib/abuse.js";
import {
  loadReferConfig,
  verifyTurnstile,
  type ReferConfig,
} from "../lib/config.js";

const { participant, product, program, refcode } = schema;

/**
 * External id namespace for participants who were created from the public
 * form rather than from an authenticated session in the host product. Keeping
 * the prefix makes them trivially distinguishable, and makes the email the
 * stable key so a repeat submit returns the same link.
 */
const ANON_EXTERNAL_ID_PREFIX = "anon:";

const submitSchema = z.object({
  productId: z.string().trim().min(1).max(64),
  firstName: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((v) => (v ? v : undefined)),
  email: z.string().trim().max(254),
  consent: z.string().optional(),
  consent_version: z.string().max(120).optional(),
  company: z.string().optional(), // honeypot
  "cf-turnstile-response": z.string().optional(),
});

const querySchema = z.object({
  productId: z.string().trim().min(1).max(64),
});

function unavailablePage(reply: FastifyReply, message: string) {
  return reply
    .code(404)
    .type("text/html")
    .send(
      `<!doctype html><html><head><meta charset="utf-8"><title>Unavailable</title></head>` +
        `<body style="font-family:sans-serif;max-width:420px;margin:80px auto;text-align:center;color:#374151">` +
        `<h1 style="font-size:1.25rem">This referral program isn't available</h1>` +
        `<p>${escapeHtml(message)}</p></body></html>`,
    );
}

/** Load the product plus its oldest active program, which owns the refcode. */
async function resolveProgram(db: FastifyRequest["db"], productId: string) {
  const productRecord = await db.query.product.findFirst({
    where: eq(product.id, productId),
  });
  if (!productRecord) return null;

  const activeProgram = await db.query.program.findFirst({
    where: and(eq(program.productId, productId), eq(program.status, "active")),
    orderBy: asc(program.createdAt),
  });
  if (!activeProgram) return null;

  return { product: productRecord, program: activeProgram };
}

/**
 * Return the participant's existing refcode for this program, or mint a new
 * one. Codes are globally unique, so an insert can lose a race; retry with a
 * freshly generated code before giving up.
 */
async function getOrCreateRefcode(
  db: FastifyRequest["db"],
  participantId: string,
  programId: string,
  productId: string,
) {
  const existing = await db.query.refcode.findFirst({
    where: and(
      eq(refcode.participantId, participantId),
      eq(refcode.programId, programId),
    ),
    orderBy: desc(refcode.createdAt),
  });
  if (existing) return existing;

  for (let attempt = 0; attempt < 3; attempt++) {
    const code = generateGlobalCode(5);
    if (!code) break;

    const [inserted] = await db
      .insert(refcode)
      .values({ code, participantId, programId, productId })
      .onConflictDoNothing()
      .returning();
    if (inserted) return inserted;
  }

  return null;
}

export default function joinRoutes(config?: ReferConfig) {
  const cfg = config ?? loadReferConfig();

  return async function (
    fastify: FastifyInstance,
    _opts: FastifyPluginOptions,
  ) {
    const joinPath = "/join";
    const actionPath = `${cfg.basePath}${joinPath}`;

    // GET: render the public form. The product is chosen by query param so a
    // single deployment can serve every product's program.
    fastify.get(
      joinPath,
      { config: { rateLimit: { max: 60, timeWindow: "1 minute" } } },
      async (request, reply) => {
        const query = querySchema.safeParse(request.query ?? {});
        if (!query.success) {
          return unavailablePage(reply, "Missing product.");
        }

        const resolved = await resolveProgram(request.db, query.data.productId);
        if (!resolved) {
          return unavailablePage(reply, "No active referral program found.");
        }

        const programConfig = resolved.program
          .config as ProgramConfigV1Type | null;

        return reply
          .code(200)
          .type("text/html")
          .send(
            renderJoinPage({
              productName: resolved.product.name,
              productId: resolved.product.id,
              actionPath,
              consentVersion: cfg.consentVersion,
              privacyPolicyUrl: cfg.privacyPolicyUrl,
              primaryColor: programConfig?.brandConfig?.primaryColor || "",
              turnstileSiteKey: cfg.turnstileSiteKey,
            }),
          );
      },
    );

    // POST: run the same abuse checks as the invite form, then upsert an
    // anonymous participant keyed on their email and hand back their link.
    fastify.post(
      joinPath,
      { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } },
      async (request, reply) => {
        const body = submitSchema.safeParse(request.body ?? {});
        if (!body.success) {
          return unavailablePage(reply, "Missing product.");
        }
        const data = body.data;

        const resolved = await resolveProgram(request.db, data.productId);
        if (!resolved) {
          return unavailablePage(reply, "No active referral program found.");
        }

        const programConfig = resolved.program
          .config as ProgramConfigV1Type | null;
        const primaryColor = programConfig?.brandConfig?.primaryColor || "";

        const rerender = (
          error: string,
          values?: { email?: string; firstName?: string },
        ) =>
          reply
            .code(400)
            .type("text/html")
            .send(
              renderJoinPage({
                productName: resolved.product.name,
                productId: resolved.product.id,
                actionPath,
                consentVersion: cfg.consentVersion,
                privacyPolicyUrl: cfg.privacyPolicyUrl,
                primaryColor,
                turnstileSiteKey: cfg.turnstileSiteKey,
                values,
                error,
              }),
            );

        // Honeypot: a filled hidden field means a bot. Persist nothing and
        // show a generic failure rather than minting a code.
        if (data.company && data.company.trim().length > 0) {
          request.log.warn({ productId: data.productId }, "honeypot triggered");
          return rerender("Something went wrong. Please try again.");
        }

        const email = normalizeEmail(data.email);
        const firstName = data.firstName;

        if (!looksLikeEmail(email)) {
          return rerender("Please enter a valid email address.", { firstName });
        }
        if (data.consent !== "yes") {
          return rerender("Please agree to the privacy policy to continue.", {
            email,
            firstName,
          });
        }

        const captchaOk = await verifyTurnstile(
          cfg,
          data["cf-turnstile-response"],
          request.ip,
        );
        if (!captchaOk) {
          return rerender("Verification failed. Please try again.", {
            email,
            firstName,
          });
        }

        if (isDisposableEmail(email, cfg.extraDisposableDomains)) {
          return rerender(
            "Please use a permanent, non-disposable email address.",
            { firstName },
          );
        }

        const [participantRecord] = await request.db
          .insert(participant)
          .values({
            externalId: `${ANON_EXTERNAL_ID_PREFIX}${email}`,
            productId: resolved.product.id,
            email,
            name: firstName ?? null,
          })
          .onConflictDoUpdate({
            target: [participant.productId, participant.externalId],
            set: { email, name: firstName ?? null },
          })
          .returning();

        if (!participantRecord) {
          request.log.error(
            { productId: resolved.product.id },
            "failed to upsert anonymous participant",
          );
          return rerender("Something went wrong. Please try again.");
        }

        const refcodeRecord = await getOrCreateRefcode(
          request.db,
          participantRecord.id,
          resolved.program.id,
          resolved.product.id,
        );

        if (!refcodeRecord) {
          request.log.error(
            { participantId: participantRecord.id },
            "failed to create refcode",
          );
          return rerender("Something went wrong. Please try again.");
        }

        return reply
          .code(200)
          .type("text/html")
          .send(
            renderJoinSuccessPage({
              productName: resolved.product.name,
              referralLink: `${cfg.referralHostUrl}/${refcodeRecord.code}`,
              code: refcodeRecord.code,
              primaryColor,
            }),
          );
      },
    );
  };
}
