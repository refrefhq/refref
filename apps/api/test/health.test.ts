import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { request } from "playwright";
import { startTestServer, stopTestServer } from "./utils/testServer.js";
import type { APIRequestContext } from "playwright";

describe("Health Endpoints", () => {
  let apiContext: APIRequestContext;
  let baseURL: string;

  beforeAll(async () => {
    // Start test server
    const { url } = await startTestServer();
    baseURL = url;

    // Create Playwright API request context
    apiContext = await request.newContext({
      baseURL,
    });
  });

  afterAll(async () => {
    // Clean up
    await apiContext.dispose();
    await stopTestServer();
  });

  describe("GET /health", () => {
    it("should return ok: true and service name", async () => {
      const response = await apiContext.get("/health");

      expect(response.ok()).toBe(true);
      expect(response.status()).toBe(200);

      const body = await response.json();

      expect(body).toEqual({
        ok: true,
        service: "refref-api",
      });
    });

    it("should have correct content-type header", async () => {
      const response = await apiContext.get("/health");

      const contentType = response.headers()["content-type"];
      expect(contentType).toContain("application/json");
    });

    it("should respond quickly", async () => {
      const startTime = Date.now();
      const response = await apiContext.get("/health");
      const endTime = Date.now();

      expect(response.ok()).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should respond within 1 second
    });
  });

  describe("GET /", () => {
    it("should return ok: true and service name", async () => {
      const response = await apiContext.get("/");

      expect(response.ok()).toBe(true);
      expect(response.status()).toBe(200);

      const body = await response.json();

      expect(body).toEqual({
        ok: true,
        service: "refref-api",
      });
    });

    it("should have correct content-type header", async () => {
      const response = await apiContext.get("/");

      const contentType = response.headers()["content-type"];
      expect(contentType).toContain("application/json");
    });

    it("should respond quickly", async () => {
      const startTime = Date.now();
      const response = await apiContext.get("/");
      const endTime = Date.now();

      expect(response.ok()).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should respond within 1 second
    });
  });
});
