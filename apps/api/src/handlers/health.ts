import { FastifyReply, FastifyRequest } from "fastify";

export async function healthHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  return reply.send({
    ok: true,
    service: "refref-api",
  });
}
