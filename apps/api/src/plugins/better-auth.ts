import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import fp from "fastify-plugin";
import { getAuth } from "@refref/auth";
import { schema, type DBType } from "@refref/coredb";

declare module "fastify" {
  interface FastifyRequest {
    apiKey?: {
      id: string;
      userId: string;
      organizationId: string | null;
      permissions: string | null;
      enabled: boolean | null;
    };
    product?: {
      id: string;
      orgId: string | null;
      name: string;
      slug: string | null;
      url: string | null;
      createdAt: Date;
      updatedAt: Date;
    };
    organization?: {
      id: string;
      name: string;
      slug: string | null;
      logo: string | null;
      createdAt: Date;
      updatedAt: Date;
    } | null;
  }

  interface FastifyInstance {
    authenticateApiKey: (
      request: FastifyRequest,
      reply: FastifyReply,
    ) => Promise<void>;
  }
}

/**
 * Better Auth API Key verification plugin for Fastify
 * Uses Better Auth's built-in verifyApiKey function with rate limiting and hashing
 */
const betterAuthPlugin = fp(
  async (fastify: FastifyInstance, opts: { db: DBType }) => {
    // Create Better Auth instance using shared @refref/auth package
    const auth = getAuth({
      baseURL: process.env.APP_URL || "http://localhost:4000",
      resendApiKey: process.env.RESEND_API_KEY || "debug_key",
      db: opts.db,
      schema,
      enabledSocialAuth: [],
      enablePasswordAuth: false,
      enableMagicLinkAuth: false,
    });

    if (!fastify.hasRequestDecorator("apiKey")) {
      fastify.decorateRequest("apiKey", undefined);
    }

    // Create a reusable authentication hook
    fastify.decorate(
      "authenticateApiKey",
      async (request: FastifyRequest, reply: FastifyReply) => {
        const apiKeyHeader = request.headers["x-api-key"] as string | undefined;

        if (!apiKeyHeader) {
          return reply.code(401).send({
            error: "Unauthorized",
            message: "API key required. Provide X-Api-Key header.",
          });
        }

        // Extract productId from request body for product-scoped validation
        const productId = (request.body as any)?.productId;

        if (!productId) {
          return reply.code(400).send({
            error: "Bad Request",
            message: "productId is required in request body",
          });
        }

        try {
          // Use Better Auth's verifyApiKey with product-scoped permissions
          // This validates the API key has the required permissions for this specific product
          const result = await auth.api.verifyApiKey({
            body: {
              key: apiKeyHeader,
              permissions: {
                [productId]: ["track", "read"], // Validate API key has these permissions for this product
              },
            },
          });

          if (!result || !(result as any).apiKey) {
            return reply.code(403).send({
              error: "Forbidden",
              message: "Invalid API key or insufficient permissions for this product",
            });
          }

          const apiKeyData = (result as any).apiKey;

          // Check if the API key is enabled
          if (!apiKeyData.enabled) {
            return reply.code(401).send({
              error: "Unauthorized",
              message: "API key is disabled",
            });
          }

          // Fetch product with organization relation for authorization context
          const productData = await opts.db.query.product.findFirst({
            where: (product, { eq }) => eq(product.id, productId),
          });

          if (!productData) {
            return reply.code(404).send({
              error: "Not Found",
              message: "Product not found",
            });
          }

          // Fetch organization relation
          const orgData = productData.orgId
            ? await opts.db.query.org.findFirst({
                where: (org, { eq }) => eq(org.id, productData.orgId!),
              })
            : null;

          // Attach API key info and context to request
          request.apiKey = {
            id: apiKeyData.id,
            userId: apiKeyData.userId,
            organizationId: apiKeyData.organizationId,
            permissions: apiKeyData.permissions,
            enabled: apiKeyData.enabled,
          };

          // Attach product and organization to request for route handlers
          (request as any).product = productData;
          (request as any).organization = orgData;
        } catch (error) {
          request.log.error({ error }, "API key verification error");
          return reply.code(401).send({
            error: "Unauthorized",
            message: "Invalid API key",
          });
        }
      },
    );
  },
  {
    name: "better-auth-plugin",
    dependencies: ["coredb-plugin"], // Ensure coredb is loaded first
  },
);

export default betterAuthPlugin;
