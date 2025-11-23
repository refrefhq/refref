import { SignupTrackingPayload, TrackingResponse } from "../types";

/**
 * RefRef API client for tracking events
 */
export class RefRefAPIClient {
  private apiKey: string;
  private apiUrl: string;

  constructor(apiKey: string, apiUrl: string = "https://api.refref.app") {
    this.apiKey = apiKey;
    this.apiUrl = apiUrl.replace(/\/$/, ""); // Remove trailing slash
  }

  /**
   * Track a signup event with referral attribution
   */
  async trackSignup(payload: SignupTrackingPayload): Promise<TrackingResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/v1/track/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": this.apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`RefRef API error (${response.status}):`, errorText);

        return {
          success: false,
          message: `API request failed with status ${response.status}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("RefRef API request failed:", error);

      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Track a purchase event (for future use)
   */
  async trackPurchase(payload: {
    timestamp: string;
    productId: string;
    programId?: string;
    payload: {
      userId: string;
      orderAmount: number;
      orderId: string;
      productIds?: string[];
      currency?: string;
    };
  }): Promise<TrackingResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/v1/track/purchase`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": this.apiKey,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`RefRef API error (${response.status}):`, errorText);

        return {
          success: false,
          message: `API request failed with status ${response.status}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("RefRef API request failed:", error);

      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  /**
   * Track a custom event (for future extensibility)
   */
  async trackCustomEvent(
    eventName: string,
    payload: Record<string, any>,
  ): Promise<TrackingResponse> {
    try {
      const response = await fetch(`${this.apiUrl}/v1/track/event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Api-Key": this.apiKey,
        },
        body: JSON.stringify({
          event: eventName,
          ...payload,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`RefRef API error (${response.status}):`, errorText);

        return {
          success: false,
          message: `API request failed with status ${response.status}`,
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error("RefRef API request failed:", error);

      return {
        success: false,
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }
}
