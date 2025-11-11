import { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { createDb, type DBType } from "@refref/coredb";

declare module "fastify" {
  interface FastifyInstance {
    db: DBType;
  }
  interface FastifyRequest {
    db: DBType;
  }
}

const databasePlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const db = createDb(databaseUrl);

  fastify.decorate("db", db);

  // Decorate request with db for easier access in handlers
  fastify.decorateRequest("db", {
    getter() {
      return db;
    },
  });

  fastify.log.info("Database connection initialized");

  // Cleanup on server close
  fastify.addHook("onClose", async () => {
    fastify.log.info("Closing database connections");
  });
};

export default fp(databasePlugin, {
  name: "database-plugin",
});
