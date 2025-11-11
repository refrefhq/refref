import { FastifyReply, FastifyRequest } from "fastify";
import { sql } from "drizzle-orm";

export async function healthHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const checks: Record<string, { ok: boolean; error?: string }> = {
    api: { ok: true },
  };

  // Check database connection
  try {
    await request.db.execute(sql`SELECT 1`);
    checks.database = { ok: true };
  } catch (error) {
    checks.database = {
      ok: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }

  const allOk = Object.values(checks).every((check) => check.ok);

  return reply.status(allOk ? 200 : 503).send({
    ok: allOk,
    service: "refref-api",
    checks,
  });
}
