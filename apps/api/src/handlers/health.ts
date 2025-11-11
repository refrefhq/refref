import { FastifyReply, FastifyRequest } from "fastify";

export async function healthHandler(
  _request: FastifyRequest,
  reply: FastifyReply,
) {
  return reply.send({
    ok: true,
    service: "refref-api",
  });
}
