import { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { type DBType } from "@refref/coredb";

declare module "fastify" {
  interface FastifyInstance {
    db: DBType;
  }
  interface FastifyRequest {
    db: DBType;
  }
}

const coredbPlugin: FastifyPluginAsync<{ db: DBType }> = async (fastify: FastifyInstance, opts) => {
  const { db } = opts;

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

export default fp(coredbPlugin, {
  name: "coredb-plugin",
});
