import posthog from "posthog-js";
import { env } from "./src/env";

// Only initialize PostHog if key is present and enabled
if (env.NEXT_PUBLIC_POSTHOG_KEY) {
  if (env.NEXT_PUBLIC_POSTHOG_ENABLED) {
    posthog.init(env.NEXT_PUBLIC_POSTHOG_KEY, {
      api_host: "/ingest",
      ui_host: "https://us.posthog.com",
      defaults: "2025-05-24",
      capture_exceptions: true, // This enables capturing exceptions using Error Tracking
      debug: process.env.NODE_ENV === "development",
      loaded: (ph) => {
        if (!env.NEXT_PUBLIC_POSTHOG_ENABLED) {
          ph.opt_out_capturing();
        }
      },
    });
  }
}

export { posthog };
