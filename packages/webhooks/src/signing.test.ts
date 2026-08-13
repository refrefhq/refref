import { describe, it, expect } from "vitest";
import {
  signPayload,
  verifySignature,
  constantTimeEqual,
  generateOpaqueToken,
} from "./signing.js";
import { computeBackoffMs } from "./dispatcher.js";

const SECRET = "whsec_primary_key";
const OTHER = "whsec_rotated_key";
const BODY = JSON.stringify({ event: "referral.created", event_id: "wev_1" });

describe("signPayload / verifySignature", () => {
  it("round-trips a valid signature", () => {
    const ts = "1000000000";
    const sig = signPayload(SECRET, ts, BODY);
    const res = verifySignature({
      secrets: [SECRET],
      signature: sig,
      timestamp: ts,
      rawBody: BODY,
      nowSeconds: 1000000000,
    });
    expect(res.valid).toBe(true);
  });

  it("rejects a tampered body", () => {
    const ts = "1000000000";
    const sig = signPayload(SECRET, ts, BODY);
    const res = verifySignature({
      secrets: [SECRET],
      signature: sig,
      timestamp: ts,
      rawBody: BODY + " ",
      nowSeconds: 1000000000,
    });
    expect(res).toEqual({ valid: false, reason: "signature" });
  });

  it("rejects a stale timestamp beyond skew", () => {
    const ts = "1000000000";
    const sig = signPayload(SECRET, ts, BODY);
    const res = verifySignature({
      secrets: [SECRET],
      signature: sig,
      timestamp: ts,
      rawBody: BODY,
      nowSeconds: 1000000000 + 300, // 5 min later, default skew 120s
    });
    expect(res).toEqual({ valid: false, reason: "skew" });
  });

  it("accepts either secret during rotation overlap", () => {
    const ts = "1000000000";
    // Signed with the rotated (new) key...
    const sig = signPayload(OTHER, ts, BODY);
    // ...receiver still lists both old and new as acceptable.
    const res = verifySignature({
      secrets: [SECRET, OTHER],
      signature: sig,
      timestamp: ts,
      rawBody: BODY,
      nowSeconds: 1000000000,
    });
    expect(res.valid).toBe(true);
  });

  it("flags missing headers", () => {
    const res = verifySignature({
      secrets: [SECRET],
      signature: "",
      timestamp: "",
      rawBody: BODY,
      nowSeconds: 1000000000,
    });
    expect(res).toEqual({ valid: false, reason: "missing" });
  });
});

describe("constantTimeEqual", () => {
  it("is true for equal strings and false otherwise", () => {
    expect(constantTimeEqual("abc", "abc")).toBe(true);
    expect(constantTimeEqual("abc", "abd")).toBe(false);
    expect(constantTimeEqual("abc", "abcd")).toBe(false);
  });
});

describe("generateOpaqueToken", () => {
  it("produces url-safe, unique tokens", () => {
    const a = generateOpaqueToken();
    const b = generateOpaqueToken();
    expect(a).not.toEqual(b);
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});

describe("computeBackoffMs", () => {
  it("grows roughly exponentially and stays capped", () => {
    const base = 1000;
    const max = 60_000;
    const a1 = computeBackoffMs(1, base, max);
    const a3 = computeBackoffMs(3, base, max);
    const a20 = computeBackoffMs(20, base, max);
    // attempt 1 ~ 1000ms (+/-15%), attempt 3 ~ 4000ms
    expect(a1).toBeGreaterThan(800);
    expect(a1).toBeLessThan(1200);
    expect(a3).toBeGreaterThan(3000);
    // capped near max (+/-15% jitter)
    expect(a20).toBeLessThanOrEqual(Math.ceil(max * 1.15));
  });
});
