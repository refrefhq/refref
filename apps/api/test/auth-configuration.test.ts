import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { request } from "playwright";
import { startTestServer, stopTestServer } from "./utils/testServer.js";
import type { APIRequestContext } from "playwright";

describe("Authentication Configuration", () => {
  let apiContext: APIRequestContext;
  let baseURL: string;

  beforeAll(async () => {
    const { url } = await startTestServer();
    baseURL = url;

    apiContext = await request.newContext({
      baseURL,
    });
  });

  afterAll(async () => {
    await apiContext.dispose();
    await stopTestServer();
  });

  describe("Unprotected Routes", () => {
    it("should allow access to health check without auth", async () => {
      const response = await apiContext.get("/health");

      expect(response.status()).toBe(200);
      expect(response.ok()).toBe(true);
    });

    it("should allow access to root health check without auth", async () => {
      const response = await apiContext.get("/");

      expect(response.status()).toBe(200);
      expect(response.ok()).toBe(true);
    });

    it("should allow access to OpenAPI spec without auth", async () => {
      const response = await apiContext.get("/openapi");

      expect(response.status()).toBe(200);
      expect(response.ok()).toBe(true);
    });
  });

  describe("JWT Protected Routes", () => {
    it("should reject widget init without JWT token", async () => {
      const response = await apiContext.post("/v1/widget/init", {
        data: {
          productId: "test",
          refcode: "abc123",
        },
      });

      expect(response.status()).toBe(401);

      const body = await response.json();
      expect(body.error).toBe("Unauthorized");
      expect(body.message).toContain("authorization header");
    });

    it("should reject widget init with invalid JWT", async () => {
      const response = await apiContext.post("/v1/widget/init", {
        headers: {
          Authorization: "Bearer invalid-token",
        },
        data: {
          productId: "test",
          refcode: "abc123",
        },
      });

      expect(response.status()).toBe(401);

      const body = await response.json();
      expect(body.error).toBe("Unauthorized");
    });
  });

  describe("API Key Protected Routes", () => {
    it("should reject track signup endpoint without API key", async () => {
      const response = await apiContext.post("/v1/track/signup", {
        data: {
          timestamp: new Date().toISOString(),
          productId: "test-product",
          payload: {
            userId: "user_123",
          },
        },
      });

      expect(response.status()).toBe(401);

      const body = await response.json();
      expect(body.error).toBe("Unauthorized");
      expect(body.message).toContain("API key required");
    });

    it("should reject programs endpoint without API key", async () => {
      const response = await apiContext.get("/v1/programs/test-program-id");

      expect(response.status()).toBe(401);

      const body = await response.json();
      expect(body.error).toBe("Unauthorized");
      expect(body.message).toContain("API key required");
    });

    it("should reject with invalid API key", async () => {
      const response = await apiContext.post("/v1/track/signup", {
        headers: {
          "X-Api-Key": "invalid-api-key-12345",
        },
        data: {
          timestamp: new Date().toISOString(),
          productId: "test-product",
          payload: {
            userId: "user_123",
          },
        },
      });

      expect(response.status()).toBe(401);

      const body = await response.json();
      expect(body.error).toBe("Unauthorized");
      expect(body.message).toContain("Invalid");
    });
  });

  describe("Authentication Method Verification", () => {
    it("should not accept API key for JWT-protected route", async () => {
      const response = await apiContext.post("/v1/widget/init", {
        headers: {
          "X-Api-Key": "some-api-key",
        },
        data: {
          productId: "test",
        },
      });

      // Should still require JWT, not accept API key
      expect(response.status()).toBe(401);
    });

    it("should not accept JWT for API-key-protected route", async () => {
      const response = await apiContext.post("/v1/track/signup", {
        headers: {
          Authorization: "Bearer some-jwt-token",
        },
        data: {
          timestamp: new Date().toISOString(),
          productId: "test",
          payload: {
            userId: "user_123",
          },
        },
      });

      // Should still require API key, not accept JWT
      expect(response.status()).toBe(401);

      const body = await response.json();
      expect(body.message).toContain("API key required");
    });
  });
});
