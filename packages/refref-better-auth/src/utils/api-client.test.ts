import { describe, it, expect, vi } from "vitest";
import { RefRefAPIClient } from "./api-client";

// Mock fetch
global.fetch = vi.fn();

describe("RefRefAPIClient", () => {
  const client = new RefRefAPIClient("test-api-key", "https://api.test.com");

  it("should successfully track signup", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ eventId: "event-123" }),
    });

    const result = await client.trackSignup({
      timestamp: "2024-01-01T00:00:00Z",
      productId: "prod-123",
      payload: {
        userId: "user-789",
        refcode: "REF123",
      },
    });

    expect(result.success).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      "https://api.test.com/v1/track/signup",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "X-Api-Key": "test-api-key",
        }),
      }),
    );
  });

  it("should handle API errors gracefully", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 400,
      text: async () => "Bad Request",
    });

    const result = await client.trackSignup({
      timestamp: "2024-01-01T00:00:00Z",
      productId: "prod-123",
      payload: { userId: "user-123" },
    });

    expect(result.success).toBe(false);
    expect(result.message).toContain("400");
  });

  it("should handle network errors", async () => {
    (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

    const result = await client.trackSignup({
      timestamp: "2024-01-01T00:00:00Z",
      productId: "prod-123",
      payload: { userId: "user-123" },
    });

    expect(result.success).toBe(false);
    expect(result.message).toBe("Network error");
  });
});
