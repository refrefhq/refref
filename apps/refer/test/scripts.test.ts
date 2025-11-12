import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { request } from "playwright";
import { startTestServer, stopTestServer } from "./utils/testServer.js";
import type { APIRequestContext } from "playwright";

describe("Script Serving Endpoints", () => {
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

  describe("GET /scripts/widget.js", () => {
    it("should serve widget bundle successfully", async () => {
      const response = await apiContext.get("/scripts/widget.js");

      expect(response.status()).toBe(200);
      expect(response.ok()).toBe(true);
    });

    it("should have correct content-type header", async () => {
      const response = await apiContext.get("/scripts/widget.js");

      const contentType = response.headers()["content-type"];
      expect(contentType).toContain("application/javascript");
      expect(contentType).toContain("charset=utf-8");
    });

    it("should have CORS headers", async () => {
      const response = await apiContext.get("/scripts/widget.js");

      const headers = response.headers();
      expect(headers["access-control-allow-origin"]).toBe("*");
    });

    it("should have cache-control headers in development", async () => {
      const response = await apiContext.get("/scripts/widget.js");

      const headers = response.headers();
      // In test environment (NODE_ENV=test), it should use dev mode
      expect(headers["cache-control"]).toBeDefined();
    });

    it("should return JavaScript code", async () => {
      const response = await apiContext.get("/scripts/widget.js");
      const body = await response.text();

      // Should be valid JavaScript (contains common JS patterns)
      expect(body.length).toBeGreaterThan(0);
      // Widget bundle should contain function definitions
      expect(body).toMatch(/function|const|var|let/);
    });

    it("should handle missing bundle gracefully", async () => {
      // Test that even if bundle is missing, endpoint doesn't crash
      const response = await apiContext.get("/scripts/widget.js");

      // Should either return bundle or error message
      expect([200, 500]).toContain(response.status());

      if (response.status() === 500) {
        const body = await response.text();
        expect(body).toContain("console.error");
        expect(body).toContain("Failed to load RefRef widget");
      }
    });
  });

  describe("GET /scripts/attribution.js", () => {
    it("should serve attribution script successfully", async () => {
      const response = await apiContext.get("/scripts/attribution.js");

      expect(response.status()).toBe(200);
      expect(response.ok()).toBe(true);
    });

    it("should have correct content-type header", async () => {
      const response = await apiContext.get("/scripts/attribution.js");

      const contentType = response.headers()["content-type"];
      expect(contentType).toContain("application/javascript");
      expect(contentType).toContain("charset=utf-8");
    });

    it("should have CORS headers", async () => {
      const response = await apiContext.get("/scripts/attribution.js");

      const headers = response.headers();
      expect(headers["access-control-allow-origin"]).toBe("*");
    });

    it("should have cache-control headers in development", async () => {
      const response = await apiContext.get("/scripts/attribution.js");

      const headers = response.headers();
      // In test environment (NODE_ENV=test), it should use dev mode
      expect(headers["cache-control"]).toBeDefined();
    });

    it("should return JavaScript code", async () => {
      const response = await apiContext.get("/scripts/attribution.js");
      const body = await response.text();

      // Should be valid JavaScript
      expect(body.length).toBeGreaterThan(0);
      // Attribution script should contain function definitions or class definitions
      expect(body).toMatch(/function|class|const|var|let/);
    });

    it("should handle missing bundle gracefully", async () => {
      const response = await apiContext.get("/scripts/attribution.js");

      // Should either return bundle or error message
      expect([200, 500]).toContain(response.status());

      if (response.status() === 500) {
        const body = await response.text();
        expect(body).toContain("console.error");
        expect(body).toContain("Failed to load RefRef attribution");
      }
    });
  });

  describe("Script Serving Performance", () => {
    it("should respond to widget.js quickly", async () => {
      const startTime = Date.now();
      const response = await apiContext.get("/scripts/widget.js");
      const endTime = Date.now();

      expect(response.status()).toBe(200);
      expect(endTime - startTime).toBeLessThan(2000); // Should respond within 2 seconds
    });

    it("should respond to attribution.js quickly", async () => {
      const startTime = Date.now();
      const response = await apiContext.get("/scripts/attribution.js");
      const endTime = Date.now();

      expect(response.status()).toBe(200);
      expect(endTime - startTime).toBeLessThan(2000); // Should respond within 2 seconds
    });
  });

  describe("Script Serving Security", () => {
    it("should not expose sensitive information in widget.js", async () => {
      const response = await apiContext.get("/scripts/widget.js");
      const body = await response.text();

      // Should not contain sensitive patterns
      expect(body).not.toContain("DATABASE_URL");
      expect(body).not.toContain("API_KEY");
      expect(body).not.toContain("SECRET");
    });

    it("should not expose sensitive information in attribution.js", async () => {
      const response = await apiContext.get("/scripts/attribution.js");
      const body = await response.text();

      // Should not contain sensitive patterns
      expect(body).not.toContain("DATABASE_URL");
      expect(body).not.toContain("API_KEY");
      expect(body).not.toContain("SECRET");
    });
  });
});
