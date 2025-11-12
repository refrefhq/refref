import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { apiKey } from "better-auth/plugins";
import { schema } from "@refref/coredb";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

declare module "fastify" {
  interface FastifyRequest {
    apiKey?: {
      id: string;
      userId: string;
      organizationId: string | null;
      permissions: string | null;
      enabled: boolean | null;
    };
  }

  interface FastifyInstance {
    authenticateApiKey: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

/**
 * Better Auth API Key verification plugin for Fastify
 * Uses Better Auth's built-in verifyApiKey function with rate limiting and hashing
 */
const betterAuthPlugin = fp(async (fastify: FastifyInstance, opts: { db: PostgresJsDatabase<typeof schema> }) => {
  // Create Better Auth instance with the provided database connection
  const auth = betterAuth({
    database: drizzleAdapter(opts.db, {
      provider: "pg",
      schema: {
        ...schema,
      },
    }),
    plugins: [apiKey()],
    secret: process.env.BETTER_AUTH_SECRET || "secret-for-development-only",
  });

  if (!fastify.hasRequestDecorator("apiKey")) {
    fastify.decorateRequest("apiKey", undefined);
  }

  // Create a reusable authentication hook
  fastify.decorate("authenticateApiKey", async (request: FastifyRequest, reply: FastifyReply) => {
    const apiKeyHeader = request.headers["x-api-key"] as string | undefined;

    if (!apiKeyHeader) {
      return reply.code(401).send({
        error: "Unauthorized",
        message: "API key required. Provide X-Api-Key header."
      });
    }

    try {
      // Use Better Auth's verifyApiKey which handles:
      // - Hashed key comparison
      // - Rate limiting
      // - Expiration checks
      const result = await auth.api.verifyApiKey({
        body: {
          key: apiKeyHeader,
        },
      });

      if (!result || !(result as any).apiKey) {
        return reply.code(401).send({
          error: "Unauthorized",
          message: "Invalid or expired API key"
        });
      }

      const apiKeyData = (result as any).apiKey;

      // Check if the API key is enabled
      if (!apiKeyData.enabled) {
        return reply.code(401).send({
          error: "Unauthorized",
          message: "API key is disabled"
        });
      }

      // Attach API key info to request
      request.apiKey = {
        id: apiKeyData.id,
        userId: apiKeyData.userId,
        organizationId: apiKeyData.organizationId,
        permissions: apiKeyData.permissions,
        enabled: apiKeyData.enabled,
      };
    } catch (error) {
      request.log.error({ error }, "API key verification error");
      return reply.code(401).send({
        error: "Unauthorized",
        message: "Invalid API key"
      });
    }
  });
}, {
  name: "better-auth-plugin",
  dependencies: ["coredb-plugin"], // Ensure coredb is loaded first
});

export default betterAuthPlugin;
