import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

export default async function healthRoutes(fastify: FastifyInstance) {
  // Health check endpoint - no rate limiting for monitoring systems
  fastify.get(
    "/health",
    {
      config: {
        rateLimit: false,
      },
    },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      return reply.send({
        status: "ok",
        timestamp: new Date().toISOString(),
        service: "refer",
      });
    }
  );

  // Root health check - no rate limiting for monitoring systems
  fastify.get(
    "/",
    {
      config: {
        rateLimit: false,
      },
    },
    async (_request: FastifyRequest, reply: FastifyReply) => {
      return reply.send({
        status: "ok",
        service: "refer",
        message: "RefRef Refer Server",
      });
    }
  );
}
