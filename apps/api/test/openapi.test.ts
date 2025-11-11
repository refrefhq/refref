import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { request } from "playwright";
import { startTestServer, stopTestServer } from "./utils/testServer.js";
import type { APIRequestContext } from "playwright";

describe("OpenAPI Endpoint", () => {
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

  describe("GET /openapi", () => {
    it("should return OpenAPI spec as YAML", async () => {
      const response = await apiContext.get("/openapi");

      expect(response.ok()).toBe(true);
      expect(response.status()).toBe(200);

      const contentType = response.headers()["content-type"];
      expect(contentType).toContain("text/yaml");
    });

    it("should contain valid OpenAPI 3.1.0 spec", async () => {
      const response = await apiContext.get("/openapi");
      const body = await response.text();

      // Check for OpenAPI version
      expect(body).toContain("openapi: 3.1.0");

      // Check for basic info
      expect(body).toContain("title: RefRef API");
      expect(body).toContain("version: 0.1.0");

      // Check for health endpoint paths
      expect(body).toContain("paths:");
      expect(body).toContain("/:");
      expect(body).toContain("/health:");

      // Check for components/schemas
      expect(body).toContain("components:");
      expect(body).toContain("schemas:");
      expect(body).toContain("HealthResponse:");
    });

    it("should include health endpoint documentation", async () => {
      const response = await apiContext.get("/openapi");
      const body = await response.text();

      // Check for health endpoint operations
      expect(body).toContain("operationId: getHealth");
      expect(body).toContain("operationId: getRootHealth");

      // Check for response codes
      expect(body).toContain("'200':");
      expect(body).toContain("'503':");

      // Check for tags
      expect(body).toContain("tags:");
      expect(body).toContain("- Health");
    });

    it("should respond quickly", async () => {
      const startTime = Date.now();
      const response = await apiContext.get("/openapi");
      const endTime = Date.now();

      expect(response.ok()).toBe(true);
      expect(endTime - startTime).toBeLessThan(100); // Should respond within 100ms
    });
  });
});
