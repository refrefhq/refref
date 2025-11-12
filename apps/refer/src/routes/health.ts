import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";

export default async function healthRoutes(fastify: FastifyInstance) {
  // Health check endpoint
  fastify.get("/health", async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "refer",
    });
  });

  // Root health check
  fastify.get("/", async (_request: FastifyRequest, reply: FastifyReply) => {
    return reply.send({
      status: "ok",
      service: "refer",
      message: "RefRef Refer Server",
    });
  });
}
