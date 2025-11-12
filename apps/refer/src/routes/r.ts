import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { schema } from "@refref/coredb";
const { referralLink, participant, product } = schema;
import { eq } from "drizzle-orm";

interface ReferralParams {
  id: string;
}

export default async function referralRedirectRoutes(fastify: FastifyInstance) {
  /**
   * Handles GET requests to /r/:id.
   * Reads the id slug, fetches participant details, and redirects with encoded params.
   */
  fastify.get<{ Params: ReferralParams }>(
    "/:id",
    async (
      request: FastifyRequest<{ Params: ReferralParams }>,
      reply: FastifyReply,
    ) => {
      try {
        const { id } = request.params;

        // Find the referral link by slug
        const link = await request.db.query.referralLink.findFirst({
          where: eq(referralLink.slug, id),
        });

        if (!link) {
          return reply.code(404).send({ error: "Referral link not found" });
        }

        // Find the participant by participantId from the referral link
        const participantRecord = await request.db.query.participant.findFirst({
          where: eq(participant.id, link.participantId),
        });

        if (!participantRecord) {
          return reply.code(404).send({ error: "Participant not found" });
        }

        // Look up the product to get the redirect URL
        const productRecord = await request.db.query.product.findFirst({
          where: eq(product.id, participantRecord.productId),
        });

        // Use product URL if available
        const redirectUrl = productRecord?.url;

        if (!redirectUrl) {
          request.log.error({
            productId: participantRecord.productId,
            message: "No redirect URL configured",
          });
          return reply
            .code(500)
            .send({ error: "Redirect URL not configured for this product" });
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
        searchParams.set("rfc", id);

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
