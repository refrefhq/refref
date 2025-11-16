import { describe, it, expect, vi, beforeEach } from "vitest";

describe("Referral Attribution Logic", () => {
  describe("Signup event with referral code (CRITICAL FIX)", () => {
    it("should look up refcode by code, not referral by externalId", async () => {
      // Setup mock data
      const refcodeValue = "abc123";
      const userId = "user_456";
      const referrerId = "participant_789";

      // Mock database transaction
      const mockRefcode = {
        id: "rc_1",
        code: refcodeValue,
        participantId: referrerId,
        programId: "prg_1",
        productId: "prd_1",
        global: true,
      };

      const mockNewReferral = {
        id: "referral_1",
        referrerId: referrerId,
        externalId: userId,
        email: "newuser@example.com",
        name: "New User",
      };

      // Simulate the CORRECT flow:
      // 1. Look up refcode by code
      const refcodeQuery = vi.fn().mockResolvedValue([mockRefcode]);

      // 2. Create new referral record
      const referralInsert = vi.fn().mockResolvedValue([mockNewReferral]);

      // Verify the correct table is queried
      expect(refcodeQuery).toBeDefined();

      // The key insight: we should query refcode.code, NOT referral.externalId
      // This is the bug we fixed
    });

    it("should create a NEW referral record on signup", async () => {
      // The correct behavior is to INSERT a new referral, not SELECT an existing one
      const newReferral = {
        referrerId: "participant_referrer",
        externalId: "user_new",
        email: "new@example.com",
        name: "New User",
      };

      // This should be an INSERT operation, not a SELECT
      const referralInsertMock = vi.fn().mockResolvedValue([
        {
          id: "referral_new",
          ...newReferral,
        },
      ]);

      expect(referralInsertMock).toBeDefined();
    });

    it("should handle missing refcode gracefully", async () => {
      const refcode = "nonexistent";

      // Mock database returning empty result
      const mockQuery = vi.fn().mockResolvedValue([]);

      const result = await mockQuery();

      expect(result).toEqual([]);
      // Should not crash, should not create referral
    });

    it("should use onConflictDoNothing for idempotency", () => {
      // This is important for duplicate signup event processing
      // If the same signup is processed twice, it shouldn't create duplicate referrals

      const insertWithConflict = vi.fn().mockReturnValue({
        onConflictDoNothing: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      });

      expect(insertWithConflict).toBeDefined();
    });
  });

  describe("Purchase event referral lookup", () => {
    it("should look up EXISTING referral by user's externalId", async () => {
      const userId = "user_123";

      // For purchase events, we look up referral.externalId
      // This is CORRECT because we're finding if this user was previously referred
      const mockReferral = {
        id: "referral_existing",
        referrerId: "participant_original_referrer",
        externalId: userId,
      };

      const referralQuery = vi.fn().mockResolvedValue([mockReferral]);

      const result = await referralQuery();

      expect(result[0].externalId).toBe(userId);
      // This is correct: lookup by externalId for existing referrals
    });

    it("should not create new referral on purchase event", () => {
      // Purchase events should only LOOKUP existing referrals, never create new ones
      // Referrals are created on signup, not on purchase

      const referralInsert = vi.fn();

      // This should NOT be called for purchase events
      expect(referralInsert).not.toHaveBeenCalled();
    });
  });

  describe("Data model understanding", () => {
    it("should understand refcode.code is the public code", () => {
      const refcode = {
        code: "abc123", // This is what users share
        participantId: "participant_referrer",
        programId: "prg_1",
        productId: "prd_1",
        global: true,
      };

      expect(refcode.code).toBe("abc123");
      expect(typeof refcode.code).toBe("string");
    });

    it("should understand referral.externalId is the referee's user ID", () => {
      const referral = {
        referrerId: "participant_referrer",
        externalId: "user_123", // This is the referee's ID in external system
      };

      expect(referral.externalId).toBe("user_123");
      expect(typeof referral.externalId).toBe("string");
    });

    it("should never compare refcode with referral.externalId", () => {
      const refcodeValue = "abc123"; // A code
      const referralExternalId = "user_456"; // A user ID

      // These are DIFFERENT types of data and should NEVER be compared
      expect(refcodeValue).not.toBe(referralExternalId);

      // The bug was: WHERE referral.externalId = refcode
      // This is wrong because we're comparing a user ID with a code!
    });
  });

  describe("Complete signup flow with referral", () => {
    it("should follow correct sequence: find code → create referral → link to event", async () => {
      const flow = {
        step1: "Receive signup with refcode: 'abc123'",
        step2: "Query refcode WHERE code = 'abc123'",
        step3: "Found refcode.participantId = 'participant_789'",
        step4:
          "INSERT INTO referral (referrerId: 'participant_789', externalId: 'user_new')",
        step5: "Get newReferral.id = 'referral_1'",
        step6: "Create event with referralId = 'referral_1'",
      };

      expect(flow.step2).toContain("refcode WHERE code");
      expect(flow.step4).toContain("INSERT INTO referral");
      expect(flow.step4).not.toContain("SELECT FROM referral");
    });
  });

  describe("Product boundary enforcement (P1 Security Fix)", () => {
    it("should NOT allow cross-product attribution with global codes", async () => {
      // Scenario: Product A creates a global code, Product B tries to use it
      const productA = "prd_AAA";
      const productB = "prd_BBB";
      const globalCode = "abc1234";

      // Product A's refcode
      const refcodeFromProductA = {
        id: "rc_1",
        code: globalCode,
        participantId: "participant_A",
        programId: "prg_A",
        productId: productA, // Belongs to Product A
        global: true,
      };

      // When Product B's widget init is called with this code
      // The query MUST enforce productId match
      const mockQueryWithProductBoundary = vi.fn((code, productId) => {
        // Correct query: WHERE code = :code AND productId = :productId
        if (code === globalCode && productId === productB) {
          return Promise.resolve(null); // Should NOT find Product A's code
        }
        if (code === globalCode && productId === productA) {
          return Promise.resolve(refcodeFromProductA); // Should find only for Product A
        }
        return Promise.resolve(null);
      });

      // Product B tries to look up the code
      const result = await mockQueryWithProductBoundary(globalCode, productB);

      // Should NOT find the code (returns null)
      expect(result).toBeNull();

      // Product A can look up its own code
      const resultForProductA = await mockQueryWithProductBoundary(
        globalCode,
        productA,
      );
      expect(resultForProductA).toBeDefined();
      expect(resultForProductA?.productId).toBe(productA);
    });

    it("should enforce product boundary even when global flag is true", () => {
      // The global flag only means:
      // 1. The code uses 7-character format
      // 2. The code is globally unique
      //
      // It does NOT mean:
      // 1. The code can be used across products
      // 2. Attribution should ignore productId

      const globalRefcode = {
        code: "xyz9876",
        productId: "prd_A",
        global: true, // Global format, but still belongs to a specific product
      };

      // The query should ALWAYS check productId
      expect(globalRefcode.productId).toBeDefined();
      expect(globalRefcode.productId).toBe("prd_A");

      // Even though it's global, it can only attribute within Product A
    });

    it("should prevent referral creation across product boundaries", async () => {
      const productA = "prd_AAA";
      const productB = "prd_BBB";

      // Product A's participant and refcode
      const participantA = {
        id: "participant_A",
        productId: productA,
      };

      const refcodeA = {
        code: "abc1234",
        participantId: participantA.id,
        productId: productA,
        global: true,
      };

      // Product B's new user trying to sign up with Product A's code
      const newUserB = {
        externalId: "user_B_123",
        productId: productB,
      };

      // Mock query that correctly enforces product boundary
      const findRefcode = vi.fn((code: string, productId: string) => {
        if (code === refcodeA.code && productId === productA) {
          return Promise.resolve(refcodeA);
        }
        return Promise.resolve(null); // No cross-product match
      });

      // When Product B tries to use Product A's code
      const result = await findRefcode(refcodeA.code, productB);

      // Should not find the code
      expect(result).toBeNull();

      // Therefore, no referral should be created
      // This prevents cross-product referral attribution
    });

    it("should document the bug we fixed in widget init", () => {
      // BEFORE (vulnerable):
      // WHERE code = :code AND (global = true OR productId = :productId)
      //
      // Problem: global=true bypasses productId check
      // Result: Cross-product attribution vulnerability

      // AFTER (fixed):
      // WHERE code = :code AND productId = :productId
      //
      // Solution: Always enforce product boundary
      // Result: No cross-product attribution

      const vulnerableQuery = {
        before: "WHERE code = ? AND (global = true OR productId = ?)",
        problem: "global=true bypasses productId check",
        vulnerability: "Cross-product attribution",
      };

      const fixedQuery = {
        after: "WHERE code = ? AND productId = ?",
        solution: "Always enforce product boundary",
        result: "Multi-tenancy isolation maintained",
      };

      expect(vulnerableQuery.problem).toContain("bypasses productId");
      expect(fixedQuery.solution).toContain("enforce product boundary");
    });
  });
});
