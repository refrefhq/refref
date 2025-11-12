import Fastify, { FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import { coredbPlugin } from "@refref/utils";
import { createDb } from "@refref/coredb";
import { healthHandler } from "./handlers/health.js";
import { openapiHandler } from "./handlers/openapi.js";
import betterAuthPlugin from "./plugins/better-auth.js";
import jwtAuthPlugin from "./plugins/jwt-auth.js";
import widgetInitRoutes from "./routes/v1/widget/init.js";
import eventsRoutes from "./routes/v1/events.js";
import programsRoutes from "./routes/v1/programs.js";

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
  app.get("/", healthHandler);
  app.get("/health", healthHandler);

  // Register OpenAPI spec route
  app.get("/openapi", openapiHandler);

  // Register v1 API routes
  await app.register(async (fastify) => {
    // Widget routes
    await fastify.register(widgetInitRoutes, { prefix: "/widget" });

    // Events routes
    await fastify.register(eventsRoutes, { prefix: "/events" });

    // Programs routes
    await fastify.register(programsRoutes, { prefix: "/programs" });
  }, { prefix: "/v1" });

  return app;
}
