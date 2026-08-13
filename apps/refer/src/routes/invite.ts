import {
  FastifyInstance,
  FastifyRequest,
  FastifyReply,
  FastifyPluginOptions,
} from "fastify";
import { z } from "zod";
import { schema } from "@refref/coredb";
import { and, desc, eq } from "drizzle-orm";
import { normalizeCode } from "@refref/utils";
import { enqueueWebhook } from "@refref/webhooks";
import type {
  ProgramConfigV1Type,
  ReferralCreatedPayload,
} from "@refref/types";
import { renderInvitePage, escapeHtml } from "../lib/render.js";
import {
  isDisposableEmail,
  looksLikeEmail,
  normalizeEmail,
  selfReferralReason,
} from "../lib/abuse.js";
import { issueHandoffToken } from "../lib/handoff.js";
import { loadReferConfig, verifyTurnstile, type ReferConfig } from "../lib/config.js";

const { refcode, referralLead } = schema;

interface CodeParams {
  code: string;
}

const UTM_KEYS = ["source", "medium", "campaign", "term", "content"] as const;

function collectUtm(
  query: Record<string, unknown>,
): Record<string, string> {
  const utm: Record<string, string> = {};
  for (const key of UTM_KEYS) {
    const v = query[`utm_${key}`];
    if (typeof v === "string" && v.length > 0 && v.length <= 200) {
      utm[key] = v;
    }
  }
  return utm;
}

function notFoundPage(reply: FastifyReply, message: string) {
  return reply
    .code(404)
    .type("text/html")
    .send(
      `<!doctype html><html><head><meta charset="utf-8"><title>Link unavailable</title></head>` +
        `<body style="font-family:sans-serif;max-width:420px;margin:80px auto;text-align:center;color:#374151">` +
        `<h1 style="font-size:1.25rem">This referral link is invalid or has expired</h1>` +
        `<p>${escapeHtml(message)}</p></body></html>`,
    );
}

/** Resolve a global refcode with its participant and program. */
async function resolveCode(db: FastifyRequest["db"], code: string) {
  const normalized = normalizeCode(code);
  const result = await db.query.refcode.findFirst({
    where: eq(refcode.code, normalized),
    with: { participant: true, program: true },
  });
  return { normalized, result };
}

const submitSchema = z.object({
  firstName: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((v) => (v ? v : undefined)),
  lastName: z
    .string()
    .trim()
    .max(80)
    .optional()
    .transform((v) => (v ? v : undefined)),
  email: z.string().trim().max(254),
  phone: z
    .string()
    .trim()
    .max(32)
    .optional()
    .transform((v) => (v ? v : undefined)),
  consent: z.string().optional(),
  consent_version: z.string().max(120).optional(),
  company: z.string().optional(), // honeypot
  "cf-turnstile-response": z.string().optional(),
});

export default function inviteRoutes(config?: ReferConfig) {
  const cfg = config ?? loadReferConfig();

  return async function (
    fastify: FastifyInstance,
    _opts: FastifyPluginOptions,
  ) {
    const invitePath = "/invite/:code";

    // GET: render the personalised landing page + form.
    fastify.get<{ Params: CodeParams }>(
      invitePath,
      {
        config: { rateLimit: { max: 60, timeWindow: "1 minute" } },
      },
      async (request, reply) => {
        const { result, normalized } = await resolveCode(
          request.db,
          request.params.code,
        );
        if (!result || !result.participant || !result.program) {
          return notFoundPage(reply, "Ask your friend for a fresh link.");
        }

        const programConfig = result.program.config as ProgramConfigV1Type | null;
        const primaryColor = programConfig?.brandConfig?.primaryColor || "#4f46e5";
        const utm = collectUtm(request.query as Record<string, unknown>);

        const html = renderInvitePage({
          referrerName: result.participant.name ?? null,
          code: normalized,
          actionPath: `${cfg.basePath}/invite/${encodeURIComponent(normalized)}`,
          consentVersion: cfg.consentVersion,
          privacyPolicyUrl: cfg.privacyPolicyUrl,
          primaryColor,
          turnstileSiteKey: cfg.turnstileSiteKey,
          utm,
        });
        return reply.code(200).type("text/html").send(html);
      },
    );

    // POST: validate, run abuse checks, create the lead, enqueue the webhook,
    // issue a hand-off token, and redirect to Welfie signup.
    fastify.post<{ Params: CodeParams }>(
      invitePath,
      {
        config: { rateLimit: { max: 20, timeWindow: "1 minute" } },
      },
      async (request, reply) => {
        const body = submitSchema.safeParse(request.body ?? {});
        const { result, normalized } = await resolveCode(
          request.db,
          request.params.code,
        );

        if (!result || !result.participant || !result.program) {
          return notFoundPage(reply, "Ask your friend for a fresh link.");
        }

        const programConfig = result.program.config as ProgramConfigV1Type | null;
        const primaryColor = programConfig?.brandConfig?.primaryColor || "#4f46e5";
        const utm = collectUtm(request.body as Record<string, unknown>);
        const actionPath = `${cfg.basePath}/invite/${encodeURIComponent(normalized)}`;

        const rerender = (
          error: string,
          values?: {
            email?: string;
            firstName?: string;
            lastName?: string;
            phone?: string;
          },
        ) =>
          reply.code(400).type("text/html").send(
            renderInvitePage({
              referrerName: result.participant!.name ?? null,
              code: normalized,
              actionPath,
              consentVersion: cfg.consentVersion,
              privacyPolicyUrl: cfg.privacyPolicyUrl,
              primaryColor,
              turnstileSiteKey: cfg.turnstileSiteKey,
              utm,
              values,
              error,
            }),
          );

        if (!body.success) {
          return rerender("Please check your details and try again.");
        }
        const data = body.data;

        // Honeypot: a filled hidden field means a bot. Pretend success, persist
        // nothing, and send it onward with no token.
        if (data.company && data.company.trim().length > 0) {
          request.log.warn({ code: normalized }, "honeypot triggered");
          return reply.code(303).redirect(cfg.signupUrl);
        }

        const email = normalizeEmail(data.email);
        const firstName = data.firstName;
        const lastName = data.lastName;
        const phone = data.phone;
        const sticky = { email, firstName, lastName, phone };

        if (!looksLikeEmail(email)) {
          return rerender("Please enter a valid email address.", {
            ...sticky,
            email: undefined,
          });
        }
        if (data.consent !== "yes") {
          return rerender("Please agree to the privacy policy to continue.", sticky);
        }

        // CAPTCHA (only enforced when a secret is configured).
        const captchaOk = await verifyTurnstile(
          cfg,
          data["cf-turnstile-response"],
          request.ip,
        );
        if (!captchaOk) {
          return rerender("Verification failed. Please try again.", sticky);
        }

        if (isDisposableEmail(email, cfg.extraDisposableDomains)) {
          return rerender(
            "Please use a permanent, non-disposable email address.",
            { ...sticky, email: undefined },
          );
        }

        const selfRef = selfReferralReason(email, {
          email: result.participant.email,
        });
        if (selfRef) {
          request.log.warn(
            { code: normalized, reason: selfRef },
            "self-referral blocked",
          );
          return rerender(
            "This email address can't be used with this referral link.",
            { ...sticky, email: undefined },
          );
        }

        const programId = result.programId;
        const productId = result.productId;
        const referrerParticipantId = result.participantId;

        // Reuse an existing recent pending lead for the same code+email to keep
        // a double submit idempotent; otherwise create a fresh lead.
        const existing = await request.db.query.referralLead.findFirst({
          where: and(
            eq(referralLead.code, normalized),
            eq(referralLead.email, email),
            eq(referralLead.status, "pending"),
          ),
          orderBy: desc(referralLead.createdAt),
        });

        const landingUrl = `${cfg.basePath}/invite/${normalized}`;
        const nowIso = new Date().toISOString();

        let lead = existing;
        if (!lead) {
          const [inserted] = await request.db
            .insert(referralLead)
            .values({
              programId,
              productId,
              referrerParticipantId,
              refcodeId: result.id,
              code: normalized,
              email,
              firstName: firstName ?? null,
              lastName: lastName ?? null,
              phone: phone ?? null,
              status: "pending",
              emailVerified: false,
              consentVersion: data.consent_version || cfg.consentVersion,
              consentAt: new Date(),
              landingUrl,
              utm: Object.keys(utm).length ? utm : null,
              ip: request.ip,
              userAgent: request.headers["user-agent"] ?? null,
            })
            .returning();
          lead = inserted;
        }

        if (!lead) {
          request.log.error({ code: normalized }, "failed to persist lead");
          return rerender("Something went wrong. Please try again.");
        }

        // Enqueue referral.created (async, dedupe on the lead id).
        const payload: Omit<ReferralCreatedPayload, "event_id"> = {
          event: "referral.created",
          occurred_at: nowIso,
          program_id: programId,
          referral: { id: lead.id, code: normalized, status: "pending" },
          referrer: {
            participant_id: referrerParticipantId,
            external_id: result.participant.externalId ?? null,
            email: result.participant.email ?? null,
            name: result.participant.name ?? null,
          },
          referee: {
            email,
            first_name: firstName ?? null,
            last_name: lastName ?? null,
            phone: phone ?? null,
            email_verified: false,
            form_fields: {},
          },
          consent: {
            version: lead.consentVersion || cfg.consentVersion,
            accepted_at: (lead.consentAt ?? new Date()).toISOString(),
          },
          attribution: {
            landing_url: landingUrl,
            utm,
            ip: request.ip,
            user_agent: request.headers["user-agent"] ?? null,
          },
        };

        try {
          await enqueueWebhook(request.db, {
            productId,
            eventType: "referral.created",
            payload: payload as unknown as Record<string, unknown>,
            dedupeKey: `created:${lead.id}`,
          });
        } catch (err) {
          // Never fail the form on an enqueue hiccup — the lead is already saved.
          request.log.error({ err }, "failed to enqueue referral.created");
        }

        // Issue single-use hand-off token and redirect to signup.
        const { token } = await issueHandoffToken(
          request.db,
          lead.id,
          cfg.handoffTtlMinutes,
        );
        const redirectUrl = `${cfg.signupUrl}?lt=${encodeURIComponent(token)}`;
        return reply.code(303).redirect(redirectUrl);
      },
    );
  };
}
