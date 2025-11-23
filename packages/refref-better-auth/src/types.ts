import { z } from "zod";

/**
 * Configuration options for the RefRef Better Auth plugin
 */
export interface RefRefPluginOptions {
  /**
   * RefRef API key for authentication
   */
  apiKey: string;

  /**
   * RefRef API URL (defaults to production API)
   */
  apiUrl?: string;

  /**
   * RefRef product ID
   */
  productId: string;

  /**
   * Optional program ID (if not provided, will use default program)
   */
  programId?: string;

  /**
   * Name of the cookie containing the referral code (default: "refref_refcode")
   */
  cookieName?: string;

  /**
   * Disable automatic signup tracking (default: false)
   */
  disableSignupTracking?: boolean;

  /**
   * Custom function to override the default signup tracking logic
   */
  customSignupTrack?: (data: SignupTrackingData) => Promise<void>;
}

/**
 * Data passed to the signup tracking function
 */
export interface SignupTrackingData {
  userId: string;
  email?: string;
  name?: string;
  refcode?: string;
  timestamp: string;
  productId: string;
  programId?: string;
}

/**
 * RefRef API response for tracking events
 */
export interface TrackingResponse {
  success: boolean;
  message?: string;
  data?: {
    eventId?: string;
    referralId?: string;
    participantId?: string;
  };
}

/**
 * Schema for the signup tracking request payload
 */
export const signupTrackingSchema = z.object({
  timestamp: z.string(),
  productId: z.string(),
  programId: z.string().optional(),
  payload: z.object({
    userId: z.string(),
    refcode: z.string().optional(),
    email: z.string().email().optional(),
    name: z.string().optional(),
  }),
});

export type SignupTrackingPayload = z.infer<typeof signupTrackingSchema>;
