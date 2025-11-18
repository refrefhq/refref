import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read OpenAPI spec at module load time
const openapiSpec = readFileSync(
  join(__dirname, "../../openapi.yaml"),
  "utf-8",
);

export default async function openapiRoutes(fastify: FastifyInstance) {
  fastify.get("/openapi", openapiHandler);
}

async function openapiHandler(_request: FastifyRequest, reply: FastifyReply) {
  return reply.type("text/yaml").send(openapiSpec);
}
