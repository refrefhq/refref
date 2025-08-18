import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

/**
 * BetterAuth handler for Next.js API routes
 * This route handles all authentication-related requests
 */
export const { GET, POST } = toNextJsHandler(auth);
