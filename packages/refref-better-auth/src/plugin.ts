import type { BetterAuthPlugin } from "better-auth";
import { RefRefPluginOptions, SignupTrackingData } from "./types";
import { extractRefcodeFromContext } from "./utils/cookie";
import { RefRefAPIClient } from "./utils/api-client";

/**
 * RefRef Better Auth Plugin
 *
 * Automatically tracks user signups with referral attribution
 * by extracting referral codes from cookies and calling the RefRef API.
 *
 * @example
 * ```typescript
 * import { betterAuth } from "better-auth";
 * import { refrefAnalytics } from "@refref/better-auth";
 *
 * export const auth = betterAuth({
 *   // ... other config
 *   plugins: [
 *     refrefAnalytics({
 *       apiKey: process.env.REFREF_API_KEY,
 *       productId: process.env.REFREF_PRODUCT_ID,
 *       apiUrl: process.env.REFREF_API_URL, // optional
 *     })
 *   ]
 * });
 * ```
 */
export const refrefAnalytics = (
  options: RefRefPluginOptions,
): BetterAuthPlugin => {
  // Validate required options
  if (!options.apiKey) {
    throw new Error("RefRef plugin: apiKey is required");
  }
  if (!options.productId) {
    throw new Error("RefRef plugin: productId is required");
  }

  // Initialize API client
  const apiClient = new RefRefAPIClient(options.apiKey, options.apiUrl);

  // Set default values
  const cookieName = options.cookieName || "refref_refcode";
  const disableSignupTracking = options.disableSignupTracking || false;

  return {
    id: "refref-analytics",

    hooks: {
      after: [
        {
          matcher: (context) => context.path === "/user/create",
          handler: async (context) => {
            // Skip if signup tracking is disabled
            if (disableSignupTracking) {
              return;
            }

            try {
              // Extract user data from the response
              const user = context.body?.user;
              if (!user) {
                console.warn("RefRef plugin: No user data found in response");
                return;
              }

              // Extract referral code from cookies
              const refcode = extractRefcodeFromContext(context, cookieName);

              // Prepare tracking data
              const trackingData: SignupTrackingData = {
                userId: user.id,
                email: user.email,
                name: user.name,
                refcode,
                timestamp: new Date().toISOString(),
                productId: options.productId,
                programId: options.programId,
              };

              // Use custom tracking function if provided
              if (options.customSignupTrack) {
                await options.customSignupTrack(trackingData);
                return;
              }

              // Default tracking: call RefRef API
              const payload = {
                timestamp: trackingData.timestamp,
                productId: trackingData.productId,
                programId: trackingData.programId,
                payload: {
                  userId: trackingData.userId,
                  refcode: trackingData.refcode,
                  email: trackingData.email,
                  name: trackingData.name,
                },
              };

              const result = await apiClient.trackSignup(payload);

              if (result.success) {
                console.log(
                  `RefRef: Successfully tracked signup for user ${user.id}`,
                  refcode
                    ? `with referral code ${refcode}`
                    : "without referral",
                );
              } else {
                console.error(
                  "RefRef: Failed to track signup:",
                  result.message,
                );
              }
            } catch (error) {
              // Don't throw errors to prevent disrupting the auth flow
              console.error("RefRef plugin error:", error);
            }
          },
        },
      ],
    },

    // Provide the API client as a utility for manual tracking
    $Infer: {
      refrefClient: {} as RefRefAPIClient,
    },

    // Export the API client for manual usage
    api: {
      refrefClient: apiClient,
    },
  };
};

/**
 * Type augmentation for Better Auth
 */
declare module "better-auth" {
  interface Auth {
    refrefClient?: RefRefAPIClient;
  }
}
