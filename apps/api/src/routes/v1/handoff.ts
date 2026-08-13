import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { schema } from "@refref/coredb";
import { eq } from "drizzle-orm";
import { consumeHandoffToken } from "../../services/referral-lead.js";

const { participant } = schema;

const exchangeSchema = z.object({
  token: z.string().min(1),
});

/**
 * Internal-only hand-off token exchange. welfie-backend calls this server-side
 * to turn the single-use `lt` token from the redirect into the referee's
 * prefill data. It is guarded by the same API-key auth as the track endpoints
 * and MUST NOT be exposed to public ingress (allowlist it to the private
 * network at the proxy). Single-use: a second exchange of the same token 404s.
 */
export default async function handoffRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/exchange",
    { preHandler: [fastify.authenticateApiKey] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = exchangeSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply
          .code(400)
          .send({ success: false, message: "A token is required." });
      }

      const lead = await consumeHandoffToken(request.db, parsed.data.token);
      if (!lead) {
        // Unknown, expired, or already consumed — do not distinguish (no oracle).
        return reply
          .code(404)
          .send({ success: false, message: "Invalid or expired token." });
      }

      // Fetch the referrer for attribution prefill.
      const [referrer] = await request.db
        .select({
          id: participant.id,
          externalId: participant.externalId,
          name: participant.name,
          email: participant.email,
        })
        .from(participant)
        .where(eq(participant.id, lead.referrerParticipantId))
        .limit(1);

      return reply.send({
        success: true,
        lead: {
          id: lead.id,
          email: lead.email,
          firstName: lead.firstName,
          code: lead.code,
          programId: lead.programId,
          productId: lead.productId,
          consentVersion: lead.consentVersion,
          consentAt: lead.consentAt,
        },
        referrer: referrer
          ? {
              participantId: referrer.id,
              externalId: referrer.externalId,
              name: referrer.name,
            }
          : null,
      });
    },
  );
}
