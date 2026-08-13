import { describe, it, expect } from "vitest";
import {
  isDisposableEmail,
  selfReferralReason,
  normalizeEmail,
  emailDomain,
  looksLikeEmail,
  parseExtraDisposableDomains,
} from "../src/lib/abuse.js";

describe("email helpers", () => {
  it("normalizes and extracts domains", () => {
    expect(normalizeEmail("  Foo@Bar.COM ")).toBe("foo@bar.com");
    expect(emailDomain("foo@bar.com")).toBe("bar.com");
    expect(emailDomain("nope")).toBeNull();
    expect(looksLikeEmail("a@b.co")).toBe(true);
    expect(looksLikeEmail("a@b")).toBe(false);
  });
});

describe("isDisposableEmail", () => {
  it("flags known disposable domains", () => {
    expect(isDisposableEmail("x@mailinator.com")).toBe(true);
    expect(isDisposableEmail("x@yopmail.com")).toBe(true);
  });
  it("allows normal domains", () => {
    expect(isDisposableEmail("x@gmail.com")).toBe(false);
    expect(isDisposableEmail("x@welfie.com")).toBe(false);
  });
  it("honours extra domains from config", () => {
    const extra = parseExtraDisposableDomains("evil.test, spam.example");
    expect(isDisposableEmail("x@evil.test", extra)).toBe(true);
    expect(isDisposableEmail("x@spam.example", extra)).toBe(true);
  });
});

describe("selfReferralReason", () => {
  it("blocks the referrer's own email", () => {
    expect(selfReferralReason("me@corp.com", { email: "me@corp.com" })).toBe(
      "same_email",
    );
  });
  it("blocks a shared custom domain", () => {
    expect(
      selfReferralReason("friend@corp.com", { email: "me@corp.com" }),
    ).toBe("same_domain");
  });
  it("does NOT block a shared free provider", () => {
    expect(
      selfReferralReason("friend@gmail.com", { email: "me@gmail.com" }),
    ).toBeNull();
  });
  it("allows genuinely different addresses", () => {
    expect(
      selfReferralReason("friend@other.com", { email: "me@corp.com" }),
    ).toBeNull();
  });
  it("is a no-op when the referrer has no email", () => {
    expect(selfReferralReason("friend@other.com", { email: null })).toBeNull();
  });
});
