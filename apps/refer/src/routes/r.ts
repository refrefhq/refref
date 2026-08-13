import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyRequest,
  FastifyReply,
} from "fastify";
import { schema } from "@refref/coredb";
const { refcode, product, reflink } = schema;
import { eq, and } from "drizzle-orm";
import { normalizeCode } from "@refref/utils";
import { loadReferConfig, type ReferConfig } from "../lib/config.js";

interface GlobalCodeParams {
  code: string;
}

interface LocalCodeParams {
  productSlug: string;
  code: string;
}

/**
 * Carry the inbound query string (utm_*, etc.) onto the invite page so the form
 * can re-post it as hidden fields and attribution survives the hop.
 */
function inviteTarget(cfg: ReferConfig, code: string, query: unknown): string {
  const params = new URLSearchParams();
  if (query && typeof query === "object") {
    for (const [key, value] of Object.entries(
      query as Record<string, unknown>,
    )) {
      if (typeof value === "string" && value.length > 0 && value.length <= 200) {
        params.set(key, value);
      }
    }
  }
  const qs = params.toString();
  const path = `${cfg.basePath}/invite/${encodeURIComponent(code)}`;
  return qs ? `${path}?${qs}` : path;
}

export default function referralRedirectRoutes(config?: ReferConfig) {
  const cfg = config ?? loadReferConfig();

  return async function (
    fastify: FastifyInstance,
    _opts: FastifyPluginOptions,
  ) {
    /**
     * Handles GET requests to /:code (auto-generated refcodes)
     * Example: /abc1234
     *
     * Auto-generated codes are unique across the entire system and don't
     * require product context. The visitor lands on the personalised invite
     * form, which captures their details before handing off to signup.
     */
    fastify.get<{ Params: GlobalCodeParams }>(
      "/:code",
      {
        config: {
          rateLimit: {
            max: 100,
            timeWindow: "1 minute",
          },
        },
      },
      async (
        request: FastifyRequest<{ Params: GlobalCodeParams }>,
        reply: FastifyReply,
      ) => {
        try {
          const { code } = request.params;
          const normalizedCode = normalizeCode(code);

          const result = await request.db.query.refcode.findFirst({
            where: eq(refcode.code, normalizedCode),
            with: { participant: true },
          });

          if (!result || !result.participant) {
            return reply.code(404).send({ error: "Referral code not found" });
          }

          return reply
            .code(307)
            .redirect(inviteTarget(cfg, normalizedCode, request.query));
        } catch (error) {
          request.log.error({ error }, "Error in referral redirect handler");
          return reply.code(500).send({ error: "Internal Server Error" });
        }
      },
    );

    /**
     * Handles GET requests to /:productSlug/:code (vanity links via reflink table)
     * Example: /acme/john-doe
     *
     * Vanity links are unique within a product and require the product slug for
     * disambiguation.
     */
    fastify.get<{ Params: LocalCodeParams }>(
      "/:productSlug/:code",
      {
        config: {
          rateLimit: {
            max: 100,
            timeWindow: "1 minute",
          },
        },
      },
      async (
        request: FastifyRequest<{ Params: LocalCodeParams }>,
        reply: FastifyReply,
      ) => {
        try {
          const { productSlug, code } = request.params;
          const normalizedCode = normalizeCode(code);

          const productRecord = await request.db.query.product.findFirst({
            where: eq(product.slug, productSlug),
          });

          if (!productRecord) {
            return reply.code(404).send({ error: "Product not found" });
          }

          const reflinkResult = await request.db.query.reflink.findFirst({
            where: and(
              eq(reflink.slug, normalizedCode),
              eq(reflink.productId, productRecord.id),
            ),
            with: {
              refcode: {
                with: { participant: true },
              },
            },
          });

          if (
            !reflinkResult ||
            !reflinkResult.refcode ||
            !reflinkResult.refcode.participant
          ) {
            return reply.code(404).send({ error: "Referral link not found" });
          }

          return reply
            .code(307)
            .redirect(
              inviteTarget(cfg, reflinkResult.refcode.code, request.query),
            );
        } catch (error) {
          request.log.error({ error }, "Error in referral redirect handler");
          return reply.code(500).send({ error: "Internal Server Error" });
        }
      },
    );
  };
}
