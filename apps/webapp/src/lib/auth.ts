import { getAuth } from "@refref/auth";
import { db, schema } from "@/server/db";
import { env } from "@/env";
import { logger } from "@/lib/logger";
import { posthog } from "@/lib/posthog";

// Create auth instance using the factory function from @refref/auth
export const auth = getAuth({
  baseURL: env.NEXT_PUBLIC_APP_URL,
  resendApiKey: env.RESEND_API_KEY || "debug_key",
  db,
  schema,
  enabledSocialAuth: env.NEXT_PUBLIC_ENABLED_SOCIAL_AUTH,
  enablePasswordAuth: env.NEXT_PUBLIC_ENABLE_PASSWORD_AUTH,
  enableMagicLinkAuth: env.NEXT_PUBLIC_ENABLE_MAGIC_LINK_AUTH,
  google: env.GOOGLE_CLIENT_ID
    ? {
        clientId: env.GOOGLE_CLIENT_ID,
        clientSecret: env.GOOGLE_CLIENT_SECRET,
      }
    : undefined,
  logger,
  posthog,
  trustedOrigins: [env.NEXT_PUBLIC_APP_URL],
});
