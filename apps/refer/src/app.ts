import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import formbody from "@fastify/formbody";
import { coredbPlugin } from "@refref/utils";
import { createDb } from "@refref/coredb";
import healthRoutes from "./routes/health.js";
import referralRedirectRoutes from "./routes/r.js";
import inviteRoutes from "./routes/invite.js";
import { loadReferConfig } from "./lib/config.js";

export async function buildApp(): Promise<FastifyInstance> {
  // Validate required environment variables
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  // Initialize database connection
  const db = createDb(databaseUrl);

  const app = Fastify({
    // The app always runs behind the reverse proxy, so trust X-Forwarded-* to
    // get the real client IP for rate limiting and attribution.
    trustProxy: true,
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

  const referConfig = loadReferConfig();

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

  // Parse application/x-www-form-urlencoded bodies (the referee form posts these)
  await app.register(formbody);

  // Register coredb plugin with database instance
  await app.register(coredbPlugin, { db });

  // Register health check routes
  await app.register(healthRoutes);

  // Register referral redirect routes (/:id)
  await app.register(referralRedirectRoutes);

  // Register the public invite page + form under the configured base path
  // (e.g. "/refer"), matching how it is exposed at the reverse proxy.
  await app.register(inviteRoutes(referConfig), { prefix: referConfig.basePath });

  return app;
}
