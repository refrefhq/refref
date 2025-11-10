import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { healthHandler } from "./handlers/health.js";

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

  // Register health check routes
  app.get("/", healthHandler);
  app.get("/health", healthHandler);

  return app;
}
