import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { coredbPlugin } from "@refref/utils";
import { createDb } from "@refref/coredb";
import healthRoutes from "./routes/health.js";
import referralRedirectRoutes from "./routes/r.js";
import scriptRoutes from "./routes/scripts.js";

export async function buildApp(): Promise<FastifyInstance> {
  // Validate required environment variables
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  // Initialize database connection
  const db = createDb(databaseUrl);

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

  // Register CORS plugin with permissive settings for public endpoints
  await app.register(cors, {
    origin: true,
  });

  // Register coredb plugin with database instance
  await app.register(coredbPlugin, { db });

  // Register health check routes
  await app.register(healthRoutes);

  // Register referral redirect routes (/r/:id)
  await app.register(referralRedirectRoutes, { prefix: "/r" });

  // Register script serving routes (/scripts/*)
  await app.register(scriptRoutes, { prefix: "/scripts" });

  return app;
}
