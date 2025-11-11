import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import databasePlugin from "./plugins/database.js";
import { healthHandler } from "./handlers/health.js";
import { openapiHandler } from "./handlers/openapi.js";

export async function buildApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: {
      level: process.env.LOG_LEVEL || "info",
      transport:
        process.env.NODE_ENV !== "production"
          ? {
              target: "pino-pretty",
              options: {
                translateTime: "HH:MM:ss Z",
                ignore: "pid,hostname",
                colorize: true,
              },
            }
          : undefined,
    },
  });

  // Register CORS plugin
  await app.register(cors, {
    origin: true,
  });

  // Register database plugin
  await app.register(databasePlugin);

  // Register health check routes
  app.get("/", healthHandler);
  app.get("/health", healthHandler);

  // Register OpenAPI spec route
  app.get("/openapi", openapiHandler);

  return app;
}
