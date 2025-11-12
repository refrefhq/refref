import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { promises as fs } from "fs";
import { join } from "path";

// Import production bundles
// Note: These imports will work when the packages are built
let widgetProdBundle: string | undefined;
let attributionProdBundle: string | undefined;

// Try to import production bundles (will fail gracefully in dev)
try {
  const widgetModule = await import("@refref/widget/dist/widget.es.js");
  widgetProdBundle = widgetModule.default;
} catch (error) {
  console.warn("Widget production bundle not available, will use dev mode");
}

try {
  const attributionModule = await import(
    "@refref/attribution-script/dist/attribution-script.es.js"
  );
  attributionProdBundle = attributionModule.default;
} catch (error) {
  console.warn(
    "Attribution production bundle not available, will use dev mode",
  );
}

export default async function scriptRoutes(fastify: FastifyInstance) {
  /**
   * Serves the widget bundle
   * In dev: reads from disk for hot-reloading
   * In prod: serves cached bundle
   */
  fastify.get(
    "/widget.js",
    async (_request: FastifyRequest, reply: FastifyReply) => {
      const headers = {
        "Content-Type": "application/javascript; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      };

      try {
        const isDev = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

        if (isDev) {
          // In dev/test, always read the latest bundle from disk
          const bundlePath = join(
            process.cwd(),
            "../..",
            "packages",
            "widget",
            "dist",
            "widget.es.js",
          );

          try {
            const bundle = await fs.readFile(bundlePath, "utf-8");

            // Set no-cache headers for development
            reply.headers({
              ...headers,
              "Cache-Control": "no-cache, no-store, must-revalidate",
            });

            return reply.send(bundle);
          } catch (readError) {
            // File not found, return error message
            fastify.log.error({ error: readError }, "Widget bundle file not found");
            reply.headers(headers);
            return reply
              .code(500)
              .send("console.error('Failed to load RefRef widget');");
          }
        }

        // In prod, use the statically imported bundle
        if (!widgetProdBundle) {
          throw new Error("Widget bundle not available");
        }

        // Set cache headers for production
        reply.headers({
          ...headers,
          "Cache-Control": "public, max-age=31536000, immutable",
        });

        return reply.send(widgetProdBundle);
      } catch (error) {
        fastify.log.error({ error }, "Error serving widget script");
        reply.headers(headers);
        return reply
          .code(500)
          .send("console.error('Failed to load RefRef widget');");
      }
    },
  );

  /**
   * Serves the attribution script bundle
   * In dev: reads from disk for hot-reloading
   * In prod: serves cached bundle
   */
  fastify.get(
    "/attribution.js",
    async (_request: FastifyRequest, reply: FastifyReply) => {
      const headers = {
        "Content-Type": "application/javascript; charset=utf-8",
        "Access-Control-Allow-Origin": "*",
      };

      try {
        const isDev = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";

        if (isDev) {
          // In dev/test, always read the latest bundle from disk
          const bundlePath = join(
            process.cwd(),
            "../..",
            "packages",
            "attribution-script",
            "dist",
            "attribution-script.es.js",
          );

          try {
            const bundle = await fs.readFile(bundlePath, "utf-8");

            // Set no-cache headers for development
            reply.headers({
              ...headers,
              "Cache-Control": "no-cache, no-store, must-revalidate",
            });

            return reply.send(bundle);
          } catch (readError) {
            // File not found, return error message
            fastify.log.error({ error: readError }, "Attribution bundle file not found");
            reply.headers(headers);
            return reply
              .code(500)
              .send("console.error('Failed to load RefRef attribution');");
          }
        }

        // In prod, use the statically imported bundle
        if (!attributionProdBundle) {
          throw new Error("Attribution bundle not available");
        }

        // Set cache headers for production
        reply.headers({
          ...headers,
          "Cache-Control": "public, max-age=31536000, immutable",
        });

        return reply.send(attributionProdBundle);
      } catch (error) {
        fastify.log.error({ error }, "Error serving attribution script");
        reply.headers(headers);
        return reply
          .code(500)
          .send("console.error('Failed to load RefRef attribution');");
      }
    },
  );
}
