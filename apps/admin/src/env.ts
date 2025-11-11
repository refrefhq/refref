import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    DATABASE_URL: z.url(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
    BETTER_AUTH_SECRET: z.string().min(1),
    BETTER_AUTH_URL: z.url().default("http://localhost:3000"),
    RESEND_API_KEY: z.string().optional(),
    GOOGLE_CLIENT_ID: z.string().min(1).default("google_client_id"),
    GOOGLE_CLIENT_SECRET: z.string().min(1).default("google_client_secret"),
    REFERRAL_PROGRAM_CLIENT_ID: z.string().optional(),
    REFERRAL_PROGRAM_CLIENT_SECRET: z.string().optional(),
    NOTIFICATIONS_EMAIL_FROM: z
      .string()
      .default("RefRef <notifications@mail.refref.ai>"),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
    NEXT_PUBLIC_APP_URL: z.url().default("http://localhost:3000"),
    NEXT_PUBLIC_REFREF_PRODUCT_ID: z.string().optional(),
    NEXT_PUBLIC_REFREF_PROGRAM_ID: z.string().optional(),
    NEXT_PUBLIC_ENABLE_PASSWORD_AUTH: z
      .enum(["true", "false"])
      .default("true")
      .transform((val) => val === "true"),
    NEXT_PUBLIC_ENABLE_MAGIC_LINK_AUTH: z
      .enum(["true", "false"])
      .default("false")
      .transform((val) => val === "true"),
    NEXT_PUBLIC_ENABLED_SOCIAL_AUTH: z
      .string()
      .optional()
      .default("")
      .transform((val) =>
        val
          ? val
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
          : [],
      ),
    NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
    NEXT_PUBLIC_POSTHOG_ENABLED: z
      .enum(["true", "false"])
      .default("false")
      .transform((val) => val === "true"),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    REFERRAL_PROGRAM_CLIENT_ID: process.env.REFERRAL_PROGRAM_CLIENT_ID,
    REFERRAL_PROGRAM_CLIENT_SECRET: process.env.REFERRAL_PROGRAM_CLIENT_SECRET,
    NEXT_PUBLIC_REFREF_PRODUCT_ID: process.env.NEXT_PUBLIC_REFREF_PRODUCT_ID,
    NEXT_PUBLIC_REFREF_PROGRAM_ID: process.env.NEXT_PUBLIC_REFREF_PROGRAM_ID,
    NEXT_PUBLIC_ENABLE_PASSWORD_AUTH:
      process.env.NEXT_PUBLIC_ENABLE_PASSWORD_AUTH,
    NEXT_PUBLIC_ENABLE_MAGIC_LINK_AUTH:
      process.env.NEXT_PUBLIC_ENABLE_MAGIC_LINK_AUTH,
    NEXT_PUBLIC_ENABLED_SOCIAL_AUTH:
      process.env.NEXT_PUBLIC_ENABLED_SOCIAL_AUTH,
    NOTIFICATIONS_EMAIL_FROM: process.env.NOTIFICATIONS_EMAIL_FROM,
    NEXT_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_POSTHOG_KEY,
    NEXT_PUBLIC_POSTHOG_ENABLED: process.env.NEXT_PUBLIC_POSTHOG_ENABLED,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});
