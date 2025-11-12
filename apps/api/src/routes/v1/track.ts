import { FastifyInstance } from "fastify";
import signupTrackRoutes from "./track/signup.js";
import purchaseTrackRoutes from "./track/purchase.js";

export default async function trackRoutes(fastify: FastifyInstance) {
  // Register signup tracking route
  await fastify.register(signupTrackRoutes, { prefix: "/signup" });

  // Register purchase tracking route
  await fastify.register(purchaseTrackRoutes, { prefix: "/purchase" });
}
