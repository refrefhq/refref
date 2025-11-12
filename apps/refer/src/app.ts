import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
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

  // Register rate limiting plugin
  // Global rate limit (applies to all routes unless overridden)
  await app.register(rateLimit, {
    global: true,
    max: 100, // Default: 100 requests per timeWindow
    timeWindow: "1 minute",
    skipOnError: true, // Don't count failed requests against the limit
    errorResponseBuilder: () => {
      return {
        statusCode: 429,
        error: "Too Many Requests",
        message: "Rate limit exceeded. Please try again later.",
      };
    },
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
