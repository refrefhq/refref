import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { schema } from "@refref/coredb";
const { referralLink } = schema;
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

        // Single optimized query using relations (1 query instead of 3)
        // This does a JOIN under the hood: referralLink → participant → product
        const result = await request.db.query.referralLink.findFirst({
          where: eq(referralLink.slug, id),
          with: {
            participant: {
              with: {
                product: true,
              },
            },
          },
        });

        if (!result || !result.participant) {
          return reply.code(404).send({ error: "Referral link not found" });
        }

        // Type assertion needed due to Drizzle's type inference limitations with nested relations
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const participantRecord = result.participant as any;
        const productRecord = participantRecord.product;
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
