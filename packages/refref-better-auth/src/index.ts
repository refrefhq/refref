/**
 * @refref/better-auth
 *
 * Better Auth integration for RefRef referral tracking.
 * Automatically tracks user signups with referral attribution.
 */

// Main plugin export
export { refrefAnalytics } from "./plugin";

// Type exports
export type {
  RefRefPluginOptions,
  SignupTrackingData,
  TrackingResponse,
  SignupTrackingPayload,
} from "./types";

// Utility exports (for advanced usage)
export { RefRefAPIClient } from "./utils/api-client";
export {
  extractRefcodeFromRequest,
  extractRefcodeFromContext,
} from "./utils/cookie";
