import { describe, it, expect } from "vitest";
import { signupTrackingSchema } from "./types";

describe("Type Validation", () => {
  it("should validate valid signup payload", () => {
    const validPayload = {
      timestamp: "2024-01-01T00:00:00Z",
      productId: "prod-123",
      payload: {
        userId: "user-789",
        refcode: "REF123",
        email: "test@example.com",
      },
    };

    const result = signupTrackingSchema.safeParse(validPayload);
    expect(result.success).toBe(true);
  });

  it("should reject invalid payload", () => {
    const invalidPayload = {
      // Missing required fields
      timestamp: "2024-01-01T00:00:00Z",
      payload: {
        email: "test@example.com",
      },
    };

    const result = signupTrackingSchema.safeParse(invalidPayload);
    expect(result.success).toBe(false);
  });
});
