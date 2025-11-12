import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import { jwtVerify } from "jose";
import { decode } from "@tsndr/cloudflare-worker-jwt";
import { jwtPayloadSchema, type JwtPayloadType } from "@refref/types";

declare module "fastify" {
  interface FastifyRequest {
    user?: JwtPayloadType;
  }

  interface FastifyInstance {
    authenticateJWT: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

/**
 * JWT authentication plugin for Fastify
 * Verifies JWT tokens against productSecrets table
 */
const jwtAuthPlugin = fp(async (fastify: FastifyInstance) => {
  fastify.decorateRequest("user", undefined);

  // Create a reusable JWT authentication hook
  fastify.decorate("authenticateJWT", async (request: FastifyRequest, reply: FastifyReply) => {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.code(401).send({
        error: "Unauthorized",
        message: "Missing or invalid authorization header. Use: Authorization: Bearer <token>"
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return reply.code(401).send({
        error: "Unauthorized",
        message: "Invalid authorization header format"
      });
    }

    try {
      // First decode the JWT without verification to get the productId
      const { payload } = decode(token);
      const parsedPayload = jwtPayloadSchema.safeParse(payload);

      if (!parsedPayload.success) {
        request.log.error({ error: parsedPayload.error }, "JWT payload validation failed");
        return reply.code(401).send({
          error: "Unauthorized",
          message: "Invalid token payload"
        });
      }

      const { productId } = parsedPayload.data;

      // Get product secret from database
      const secret = await request.db.query.productSecrets.findFirst({
        where: (productSecrets, { eq }) => eq(productSecrets.productId, productId),
      });

      if (!secret) {
        request.log.error({ productId }, "Product secret not found");
        return reply.code(401).send({
          error: "Unauthorized",
          message: "Invalid product or product not configured"
        });
      }

      // Verify the JWT with the product's secret
      const { payload: verifiedPayload } = await jwtVerify(
        token,
        new TextEncoder().encode(secret.clientSecret)
      );

      const validatedPayload = jwtPayloadSchema.parse(verifiedPayload);

      // Attach user info to request
      request.user = validatedPayload;
    } catch (error) {
      request.log.error({ error }, "JWT verification error");
      return reply.code(401).send({
        error: "Unauthorized",
        message: "Invalid or expired token"
      });
    }
  });
}, {
  name: "jwt-auth-plugin",
  dependencies: ["coredb-plugin"],
});

export default jwtAuthPlugin;
