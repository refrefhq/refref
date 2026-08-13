import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { coredbPlugin } from "@refref/utils";
import { createDb } from "@refref/coredb";
import healthRoutes from "./routes/health.js";
import openapiRoutes from "./routes/openapi.js";
import betterAuthPlugin from "./plugins/better-auth.js";
import jwtAuthPlugin from "./plugins/jwt-auth.js";
import widgetInitRoutes from "./routes/v1/widget/init.js";
import trackRoutes from "./routes/v1/track.js";
import programsRoutes from "./routes/v1/programs.js";
import handoffRoutes from "./routes/v1/handoff.js";
import { runWebhookWorker } from "@refref/webhooks";

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

  // Register CORS plugin
  await app.register(cors, {
    origin: true,
  });

  // Register coredb plugin with database instance
  await app.register(coredbPlugin, { db });

  // Register authentication plugins with database instance
  await app.register(betterAuthPlugin, { db });
  await app.register(jwtAuthPlugin);

  // Register health check routes
  await app.register(healthRoutes);

  // Register OpenAPI spec route
  await app.register(openapiRoutes);

  // Register v1 API routes
  await app.register(
    async (fastify) => {
      // Widget routes
      await fastify.register(widgetInitRoutes, { prefix: "/widget" });

      // Track routes (signup, purchase)
      await fastify.register(trackRoutes, { prefix: "/track" });

      // Programs routes
      await fastify.register(programsRoutes, { prefix: "/programs" });

      // Internal hand-off token exchange (API-key auth; keep off public ingress)
      await fastify.register(handoffRoutes, { prefix: "/handoff" });
    },
    { prefix: "/v1" },
  );

  // Optionally run the outbound webhook dispatcher inside the API process.
  // In production you may prefer the standalone worker (see src/worker.ts).
  if (process.env.WEBHOOK_WORKER_ENABLED === "true") {
    const intervalMs = Number(process.env.WEBHOOK_WORKER_INTERVAL_MS) || 5000;
    const stop = runWebhookWorker(db, intervalMs, {
      logger: {
        info: (o, m) => app.log.info(o, m),
        error: (o, m) => app.log.error(o, m),
      },
    });
    app.addHook("onClose", async () => stop());
    app.log.info(`Webhook worker started (interval ${intervalMs}ms)`);
  }

  return app;
}
