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

  describe("GET /:code - Refcode Error Cases", () => {
    it("should return 404 when refcode not found", async () => {
      // Mock database to return null for refcode
      mockDb.query.refcode.findFirst.mockResolvedValueOnce(null);

      const response = await apiContext.get("/abc1234");

      expect(response.status()).toBe(404);

      const body = await response.json();
      expect(body.error).toBe("Referral code not found");
    });

    it("should return 404 when participant not found", async () => {
      // Mock database to return refcode but no participant (relational query)
      mockDb.query.refcode.findFirst.mockResolvedValueOnce({
        id: "rc_123",
        code: "abc1234",
        participantId: "prt_123",
        programId: "prg_123",
        productId: "prd_123",
        participant: null, // No participant found in relation
      });

      const response = await apiContext.get("/abc1234");

      expect(response.status()).toBe(404);

      const body = await response.json();
      expect(body.error).toBe("Referral code not found");
    });

    it("should return 500 when product URL not configured", async () => {
      // Mock database to return nested data with no landing page URL (relational query)
      mockDb.query.refcode.findFirst.mockResolvedValueOnce({
        id: "rc_123",
        code: "abc1234",
        participantId: "prt_123",
        programId: "prg_123",
        productId: "prd_123",
        participant: {
          id: "prt_123",
          productId: "prd_123",
          name: "John Doe",
          email: "john@example.com",
        },
        program: {
          id: "prg_123",
          config: {
            brandConfig: {
              landingPageUrl: null, // No URL configured
            },
          },
        },
      });

      const response = await apiContext.get("/abc1234");

      expect(response.status()).toBe(500);

      const body = await response.json();
      expect(body.error).toBe(
        "Landing page URL not configured for this program",
      );
    });
  });

  describe("GET /:code - Refcode Success Cases", () => {
    it("should redirect with encoded params when all data is present", async () => {
      // Mock complete happy path with nested data (relational query)
      mockDb.query.refcode.findFirst.mockResolvedValueOnce({
        id: "rc_happy",
        code: "abc1234",
        participantId: "prt_123",
        programId: "prg_123",
        productId: "prd_123",
        participant: {
          id: "prt_123",
          productId: "prd_123",
          name: "John Doe",
          email: "john@example.com",
        },
        program: {
          id: "prg_123",
          config: {
            brandConfig: {
              landingPageUrl: "https://example.com",
            },
          },
        },
      });

      const response = await apiContext.get("/abc1234");

      expect(response.status()).toBe(307);

      const location = response.headers()["location"];
      expect(location).toBeDefined();
      expect(location).toContain("https://example.com");
      expect(location).toContain("refcode=abc1234");
      expect(location).toContain("name="); // Base64 encoded name
      expect(location).toContain("participantId="); // Base64 encoded participant ID
    });

    it("should handle missing optional fields gracefully", async () => {
      // Mock with null name and email (relational query)
      mockDb.query.refcode.findFirst.mockResolvedValueOnce({
        id: "rc_minimal",
        code: "xyz5678",
        participantId: "prt_456",
        programId: "prg_456",
        productId: "prd_456",
        participant: {
          id: "prt_456",
          productId: "prd_456",
          name: null,
          email: null,
        },
        program: {
          id: "prg_456",
          config: {
            brandConfig: {
              landingPageUrl: "https://minimal.example.com",
            },
          },
        },
      });

      const response = await apiContext.get("/xyz5678");

      expect(response.status()).toBe(307);

      const location = response.headers()["location"];
      expect(location).toBeDefined();
      expect(location).toContain("https://minimal.example.com");
      expect(location).toContain("refcode=xyz5678");
      // Should not include empty encoded params
      expect(location).not.toContain("name=");
    });

    it("should preserve existing query params in product URL", async () => {
      // Mock with nested data (relational query)
      mockDb.query.refcode.findFirst.mockResolvedValueOnce({
        id: "rc_query",
        code: "def9012",
        participantId: "prt_789",
        programId: "prg_789",
        productId: "prd_789",
        participant: {
          id: "prt_789",
          productId: "prd_789",
          name: "Jane Smith",
          email: "jane@example.com",
        },
        program: {
          id: "prg_789",
          config: {
            brandConfig: {
              landingPageUrl: "https://example.com?existing=param",
            },
          },
        },
      });

      const response = await apiContext.get("/def9012");

      expect(response.status()).toBe(307);

      const location = response.headers()["location"];
      expect(location).toBeDefined();
      // Should handle existing query params correctly
      expect(location).toContain("refcode=def9012");
    });

    it("should handle case-insensitive codes", async () => {
      // Mock database (normalizeCode converts to lowercase)
      mockDb.query.refcode.findFirst.mockResolvedValueOnce({
        id: "rc_case",
        code: "abc1234", // stored in lowercase
        participantId: "prt_case",
        programId: "prg_case",
        productId: "prd_case",
        participant: {
          id: "prt_case",
          productId: "prd_case",
          name: "Case Test",
          email: "case@example.com",
        },
        program: {
          id: "prg_case",
          config: {
            brandConfig: {
              landingPageUrl: "https://case.example.com",
            },
          },
        },
      });

      // Request with uppercase should work
      const response = await apiContext.get("/ABC1234");

      expect(response.status()).toBe(307);
      const location = response.headers()["location"];
      expect(location).toContain("refcode=abc1234"); // normalized to lowercase
    });
  });

  describe("GET /:productSlug/:code - Reflink (Vanity URL) Cases", () => {
    it("should return 404 when product not found", async () => {
      // Mock product lookup to return null
      mockDb.query.product.findFirst.mockResolvedValueOnce(null);

      const response = await apiContext.get("/nonexistent/john-doe");

      expect(response.status()).toBe(404);

      const body = await response.json();
      expect(body.error).toBe("Product not found");
    });

    it("should return 404 when reflink not found", async () => {
      // Mock product lookup
      mockDb.query.product.findFirst.mockResolvedValueOnce({
        id: "prd_acme",
        slug: "acme",
        url: "https://acme.example.com",
      });

      // Mock reflink lookup to return null
      mockDb.query.reflink.findFirst.mockResolvedValueOnce(null);

      const response = await apiContext.get("/acme/nonexistent");

      expect(response.status()).toBe(404);

      const body = await response.json();
      expect(body.error).toBe("Referral link not found");
    });

    it("should redirect with vanity URL when all data is present", async () => {
      // Mock product lookup
      mockDb.query.product.findFirst.mockResolvedValueOnce({
        id: "prd_acme",
        slug: "acme",
        url: "https://acme.example.com",
      });

      // Mock reflink lookup with nested refcode
      mockDb.query.reflink.findFirst.mockResolvedValueOnce({
        id: "rl_vanity",
        slug: "john-doe",
        refcodeId: "rc_local",
        productId: "prd_acme",
        refcode: {
          id: "rc_local",
          code: "abc1234",
          participantId: "prt_john",
          programId: "prg_acme",
          productId: "prd_acme",
          participant: {
            id: "prt_john",
            productId: "prd_acme",
            name: "John Doe",
            email: "john@acme.com",
          },
          program: {
            id: "prg_acme",
            config: {
              brandConfig: {
                landingPageUrl: "https://acme.example.com",
              },
            },
          },
        },
      });

      const response = await apiContext.get("/acme/john-doe");

      expect(response.status()).toBe(307);

      const location = response.headers()["location"];
      expect(location).toBeDefined();
      expect(location).toContain("https://acme.example.com");
      expect(location).toContain("refcode=abc1234");
      expect(location).toContain("name=");
      expect(location).toContain("email=");
    });
  });

  describe("GET /:code - Parameter Encoding", () => {
    it("should base64 encode participant details", async () => {
      // Mock with nested data (relational query)
      mockDb.query.refcode.findFirst.mockResolvedValueOnce({
        id: "rc_encode",
        code: "enc0123",
        participantId: "prt_encode",
        programId: "prg_encode",
        productId: "prd_encode",
        participant: {
          id: "prt_encode",
          productId: "prd_encode",
          name: "Test User",
          email: "test@example.com",
        },
        program: {
          id: "prg_encode",
          config: {
            brandConfig: {
              landingPageUrl: "https://test.example.com",
            },
          },
        },
      });

      const response = await apiContext.get("/enc0123");

      expect(response.status()).toBe(307);

      const location = response.headers()["location"];
      const url = new URL(location!);

      // Verify base64 encoding
      const nameParam = url.searchParams.get("name");
      const participantIdParam = url.searchParams.get("participantId");

      expect(nameParam).toBeDefined();
      expect(participantIdParam).toBeDefined();

      // Decode and verify
      if (nameParam) {
        const decodedName = Buffer.from(nameParam, "base64").toString("utf-8");
        expect(decodedName).toBe("Test User");
      }

      if (participantIdParam) {
        const decodedId = Buffer.from(participantIdParam, "base64").toString(
          "utf-8",
        );
        expect(decodedId).toBe("prt_encode");
      }
    });

    it("should handle special characters in participant data", async () => {
      // Mock with nested data (relational query)
      mockDb.query.refcode.findFirst.mockResolvedValueOnce({
        id: "rc_special",
        code: "spc4567",
        participantId: "prt_special",
        programId: "prg_special",
        productId: "prd_special",
        participant: {
          id: "prt_special",
          productId: "prd_special",
          name: "John O'Brien & Co.",
          email: "john+test@example.com",
        },
        program: {
          id: "prg_special",
          config: {
            brandConfig: {
              landingPageUrl: "https://special.example.com",
            },
          },
        },
      });

      const response = await apiContext.get("/spc4567");

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

  describe("GET /:code - Performance", () => {
    it("should respond quickly for valid redirect", async () => {
      // Mock with nested data (relational query)
      mockDb.query.refcode.findFirst.mockResolvedValueOnce({
        id: "rc_perf",
        code: "prf8901",
        participantId: "prt_perf",
        programId: "prg_perf",
        productId: "prd_perf",
        participant: {
          id: "prt_perf",
          productId: "prd_perf",
          name: "Perf User",
          email: "perf@example.com",
        },
        program: {
          id: "prg_perf",
          config: {
            brandConfig: {
              landingPageUrl: "https://perf.example.com",
            },
          },
        },
      });

      const startTime = Date.now();
      const response = await apiContext.get("/prf8901");
      const endTime = Date.now();

      expect(response.status()).toBe(307);
      expect(endTime - startTime).toBeLessThan(1000); // Should respond within 1 second
    });
  });
});
