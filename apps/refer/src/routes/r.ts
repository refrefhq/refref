import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { schema } from "@refref/coredb";
const { refcode, product } = schema;
import { eq, and } from "drizzle-orm";
import { normalizeCode } from "@refref/utils";
import type { ProgramConfigV1Type } from "@refref/types";

interface GlobalCodeParams {
  code: string;
}

interface LocalCodeParams {
  productSlug: string;
  code: string;
}

export default async function referralRedirectRoutes(fastify: FastifyInstance) {
  /**
   * Handles GET requests to /r/:code (global codes)
   * Example: /r/abc1234
   *
   * Global codes are unique across the entire system and don't require product context.
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

        // Single optimized query using relations
        // This does a JOIN under the hood: refcode → participant → program
        const result = await request.db.query.refcode.findFirst({
          where: and(
            eq(refcode.code, normalizedCode),
            eq(refcode.global, true),
          ),
          with: {
            participant: true,
            program: true,
          },
        });

        if (!result || !result.participant) {
          return reply.code(404).send({ error: "Referral code not found" });
        }

        // Type assertion needed due to Drizzle's type inference limitations with nested relations
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const participantRecord = result.participant as any;

        // Get the landing page URL from program config (assuming it's always present)
        const programConfig = result.program!.config as ProgramConfigV1Type;
        const redirectUrl = programConfig.brandConfig!.landingPageUrl;

        if (!redirectUrl) {
          request.log.error({
            programId: result.programId,
            message: "No landing page URL configured in brand config",
          });
          return reply
            .code(500)
            .send({ error: "Landing page URL not configured for this program" });
        }

        // Helper to encode and only add non-empty values
        const encode = (value: string | null | undefined) =>
          value ? Buffer.from(value, "utf-8").toString("base64") : undefined;

        // Extra params, potentially enabled/disabled via config
        const paramsObj: Record<string, string | undefined> = {
          name: encode(participantRecord.name),
          participantId: encode(participantRecord.id),
        };

        const searchParams = new URLSearchParams();
        Object.entries(paramsObj).forEach(([key, value]) => {
          if (value) searchParams.set(key, value);
        });
        searchParams.set("refcode", normalizedCode);

        // Redirect with 307 to the product URL with encoded params
        return reply
          .code(307)
          .redirect(`${redirectUrl}?${searchParams.toString()}`);
      } catch (error) {
        // Log error and return 500
        request.log.error({ error }, "Error in referral redirect handler");
        return reply.code(500).send({ error: "Internal Server Error" });
      }
    },
  );

  /**
   * Handles GET requests to /r/:productSlug/:code (local/product-scoped codes)
   * Example: /r/acme/john-doe
   *
   * Local codes are unique within a product and require the product slug for disambiguation.
   * This allows for vanity URLs like /r/acme/ceo or /r/startup/founder
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

        // First find the product by slug
        const productRecord = await request.db.query.product.findFirst({
          where: eq(product.slug, productSlug),
        });

        if (!productRecord) {
          return reply.code(404).send({ error: "Product not found" });
        }

        // Single optimized query using relations
        // This does a JOIN under the hood: refcode → participant → program
        const result = await request.db.query.refcode.findFirst({
          where: and(
            eq(refcode.code, normalizedCode),
            eq(refcode.productId, productRecord.id),
            eq(refcode.global, false),
          ),
          with: {
            participant: true,
            program: true,
          },
        });

        if (!result || !result.participant) {
          return reply.code(404).send({ error: "Referral code not found" });
        }

        // Type assertion needed due to Drizzle's type inference limitations with nested relations
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const participantRecord = result.participant as any;

        // Get the landing page URL from program config (assuming it's always present)
        const programConfig = result.program!.config as ProgramConfigV1Type;
        const redirectUrl = programConfig.brandConfig!.landingPageUrl;

        if (!redirectUrl) {
          request.log.error({
            programId: result.programId,
            message: "No landing page URL configured in brand config",
          });
          return reply
            .code(500)
            .send({ error: "Landing page URL not configured for this program" });
        }

        // Helper to encode and only add non-empty values
        const encode = (value: string | null | undefined) =>
          value ? Buffer.from(value, "utf-8").toString("base64") : undefined;

        // Extra params, potentially enabled/disabled via config
        const paramsObj: Record<string, string | undefined> = {
          name: encode(participantRecord.name),
          email: encode(participantRecord.email),
          participantId: encode(participantRecord.id),
        };

        const searchParams = new URLSearchParams();
        Object.entries(paramsObj).forEach(([key, value]) => {
          if (value) searchParams.set(key, value);
        });
        searchParams.set("refcode", normalizedCode);

        // Redirect with 307 to the product URL with encoded params
        return reply
          .code(307)
          .redirect(`${redirectUrl}?${searchParams.toString()}`);
      } catch (error) {
        // Log error and return 500
        request.log.error({ error }, "Error in referral redirect handler");
        return reply.code(500).send({ error: "Internal Server Error" });
      }
    },
  );
}
