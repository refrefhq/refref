import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import { request } from "playwright";
import { startTestServer, stopTestServer } from "./utils/testServer.js";
import type { APIRequestContext } from "playwright";
import { createDb } from "@refref/coredb";

// Get mocked db instance
const mockDb = createDb("mock-url") as any;

describe("Referral Redirect Endpoint", () => {
  let apiContext: APIRequestContext;
  let baseURL: string;

  beforeAll(async () => {
    const { url } = await startTestServer();
    baseURL = url;

    apiContext = await request.newContext({
      baseURL,
      // Don't follow redirects automatically
      maxRedirects: 0,
    });
  });

  afterAll(async () => {
    await apiContext.dispose();
    await stopTestServer();
  });

  describe("GET /r/:id - Error Cases", () => {
    it("should return 404 when route path is incomplete", async () => {
      const response = await apiContext.get("/r/");

      expect(response.status()).toBe(404); // Fastify returns 404 for route not found
    });

    it("should return 404 when referral link not found", async () => {
      // Mock database to return null for referral link
      mockDb.query.referralLink.findFirst.mockResolvedValueOnce(null);

      const response = await apiContext.get("/r/nonexistent-slug");

      expect(response.status()).toBe(404);

      const body = await response.json();
      expect(body.error).toBe("Referral link not found");
    });

    it("should return 404 when participant not found", async () => {
      // Mock database to return referral link but no participant (relational query)
      mockDb.query.referralLink.findFirst.mockResolvedValueOnce({
        id: "link_123",
        slug: "test-slug",
        participantId: "participant_123",
        participant: null, // No participant found in relation
      });

      const response = await apiContext.get("/r/test-slug");

      expect(response.status()).toBe(404);

      const body = await response.json();
      expect(body.error).toBe("Referral link not found");
    });

    it("should return 500 when product URL not configured", async () => {
      // Mock database to return nested data with no product URL (relational query)
      mockDb.query.referralLink.findFirst.mockResolvedValueOnce({
        id: "link_123",
        slug: "test-slug",
        participantId: "participant_123",
        participant: {
          id: "participant_123",
          productId: "product_123",
          name: "John Doe",
          email: "john@example.com",
          product: {
            id: "product_123",
            url: null, // No URL configured
          },
        },
      });

      const response = await apiContext.get("/r/test-slug");

      expect(response.status()).toBe(500);

      const body = await response.json();
      expect(body.error).toBe("Redirect URL not configured for this product");
    });
  });

  describe("GET /r/:id - Success Cases", () => {
    it("should redirect with encoded params when all data is present", async () => {
      // Mock complete happy path with nested data (relational query)
      mockDb.query.referralLink.findFirst.mockResolvedValueOnce({
        id: "link_123",
        slug: "happy-slug",
        participantId: "participant_123",
        participant: {
          id: "participant_123",
          productId: "product_123",
          name: "John Doe",
          email: "john@example.com",
          product: {
            id: "product_123",
            url: "https://example.com",
          },
        },
      });

      const response = await apiContext.get("/r/happy-slug");

      expect(response.status()).toBe(307);

      const location = response.headers()["location"];
      expect(location).toBeDefined();
      expect(location).toContain("https://example.com");
      expect(location).toContain("rfc=happy-slug");
      expect(location).toContain("name="); // Base64 encoded name
      expect(location).toContain("email="); // Base64 encoded email
      expect(location).toContain("participantId="); // Base64 encoded participant ID
    });

    it("should handle missing optional fields gracefully", async () => {
      // Mock with null name and email (relational query)
      mockDb.query.referralLink.findFirst.mockResolvedValueOnce({
        id: "link_456",
        slug: "minimal-slug",
        participantId: "participant_456",
        participant: {
          id: "participant_456",
          productId: "product_456",
          name: null,
          email: null,
          product: {
            id: "product_456",
            url: "https://minimal.example.com",
          },
        },
      });

      const response = await apiContext.get("/r/minimal-slug");

      expect(response.status()).toBe(307);

      const location = response.headers()["location"];
      expect(location).toBeDefined();
      expect(location).toContain("https://minimal.example.com");
      expect(location).toContain("rfc=minimal-slug");
      // Should not include empty encoded params
      expect(location).not.toContain("name=");
      expect(location).not.toContain("email=");
    });

    it("should preserve existing query params in product URL", async () => {
      // Mock with nested data (relational query)
      mockDb.query.referralLink.findFirst.mockResolvedValueOnce({
        id: "link_789",
        slug: "query-slug",
        participantId: "participant_789",
        participant: {
          id: "participant_789",
          productId: "product_789",
          name: "Jane Smith",
          email: "jane@example.com",
          product: {
            id: "product_789",
            url: "https://example.com?existing=param",
          },
        },
      });

      const response = await apiContext.get("/r/query-slug");

      expect(response.status()).toBe(307);

      const location = response.headers()["location"];
      expect(location).toBeDefined();
      // Should handle existing query params correctly
      expect(location).toContain("rfc=query-slug");
    });
  });

  describe("GET /r/:id - Parameter Encoding", () => {
    it("should base64 encode participant details", async () => {
      // Mock with nested data (relational query)
      mockDb.query.referralLink.findFirst.mockResolvedValueOnce({
        id: "link_encode",
        slug: "encode-test",
        participantId: "participant_encode",
        participant: {
          id: "participant_encode",
          productId: "product_encode",
          name: "Test User",
          email: "test@example.com",
          product: {
            id: "product_encode",
            url: "https://test.example.com",
          },
        },
      });

      const response = await apiContext.get("/r/encode-test");

      expect(response.status()).toBe(307);

      const location = response.headers()["location"];
      const url = new URL(location!);

      // Verify base64 encoding
      const nameParam = url.searchParams.get("name");
      const emailParam = url.searchParams.get("email");
      const participantIdParam = url.searchParams.get("participantId");

      expect(nameParam).toBeDefined();
      expect(emailParam).toBeDefined();
      expect(participantIdParam).toBeDefined();

      // Decode and verify
      if (nameParam) {
        const decodedName = Buffer.from(nameParam, "base64").toString("utf-8");
        expect(decodedName).toBe("Test User");
      }

      if (emailParam) {
        const decodedEmail = Buffer.from(emailParam, "base64").toString("utf-8");
        expect(decodedEmail).toBe("test@example.com");
      }

      if (participantIdParam) {
        const decodedId = Buffer.from(participantIdParam, "base64").toString(
          "utf-8",
        );
        expect(decodedId).toBe("participant_encode");
      }
    });

    it("should handle special characters in participant data", async () => {
      // Mock with nested data (relational query)
      mockDb.query.referralLink.findFirst.mockResolvedValueOnce({
        id: "link_special",
        slug: "special-chars",
        participantId: "participant_special",
        participant: {
          id: "participant_special",
          productId: "product_special",
          name: "John O'Brien & Co.",
          email: "john+test@example.com",
          product: {
            id: "product_special",
            url: "https://special.example.com",
          },
        },
      });

      const response = await apiContext.get("/r/special-chars");

      expect(response.status()).toBe(307);

      const location = response.headers()["location"];
      expect(location).toBeDefined();

      const url = new URL(location!);
      const nameParam = url.searchParams.get("name");

      // Should handle special characters through base64 encoding
      expect(nameParam).toBeDefined();
      if (nameParam) {
        const decodedName = Buffer.from(nameParam, "base64").toString("utf-8");
        expect(decodedName).toBe("John O'Brien & Co.");
      }
    });
  });

  describe("GET /r/:id - Performance", () => {
    it("should respond quickly for valid redirect", async () => {
      // Mock with nested data (relational query)
      mockDb.query.referralLink.findFirst.mockResolvedValueOnce({
        id: "link_perf",
        slug: "perf-test",
        participantId: "participant_perf",
        participant: {
          id: "participant_perf",
          productId: "product_perf",
          name: "Perf User",
          email: "perf@example.com",
          product: {
            id: "product_perf",
            url: "https://perf.example.com",
          },
        },
      });

      const startTime = Date.now();
      const response = await apiContext.get("/r/perf-test");
      const endTime = Date.now();

      expect(response.status()).toBe(307);
      expect(endTime - startTime).toBeLessThan(1000); // Should respond within 1 second
    });
  });
});
