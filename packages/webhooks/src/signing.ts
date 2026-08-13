import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";
import {
  WEBHOOK_MAX_SKEW_SECONDS,
  WEBHOOK_SIGNATURE_HEADER,
  WEBHOOK_TIMESTAMP_HEADER,
} from "@refref/types";

/**
 * Signature scheme
 * ----------------
 * We compute HMAC-SHA256 over `${timestamp}.${rawBody}` using the shared
 * secret, and send it as:
 *
 *   X-Refref-Signature: sha256=<hex>
 *   X-Refref-Timestamp: <unix seconds>
 *
 * Binding the timestamp into the signed string is what makes replays
 * detectable: an attacker cannot reuse an old signature with a fresh timestamp,
 * and the receiver additionally rejects timestamps skewed beyond
 * WEBHOOK_MAX_SKEW_SECONDS. The receiver MUST verify the signature over the
 * exact raw bytes it received, BEFORE JSON parsing.
 */

const PREFIX = "sha256=";

/** Build the exact string that gets HMAC'd. */
export function buildSigningString(timestamp: string, rawBody: string): string {
  return `${timestamp}.${rawBody}`;
}

/** Compute the `sha256=<hex>` signature for a body + timestamp with one secret. */
export function signPayload(
  secret: string,
  timestamp: string,
  rawBody: string,
): string {
  const mac = createHmac("sha256", secret)
    .update(buildSigningString(timestamp, rawBody), "utf8")
    .digest("hex");
  return `${PREFIX}${mac}`;
}

/** Constant-time comparison of two signature strings of arbitrary length. */
export function constantTimeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a, "utf8");
  const bb = Buffer.from(b, "utf8");
  // timingSafeEqual throws on length mismatch, so guard first — but keep the
  // work constant by comparing against a same-length buffer either way.
  if (ab.length !== bb.length) {
    // Compare a against itself to burn roughly equivalent time, then fail.
    timingSafeEqual(ab, ab);
    return false;
  }
  return timingSafeEqual(ab, bb);
}

export interface VerifyOptions {
  /** All acceptable secrets. Pass [primary, secondary] during key rotation. */
  secrets: string[];
  /** Header value from X-Refref-Signature. */
  signature: string;
  /** Header value from X-Refref-Timestamp (unix seconds as string). */
  timestamp: string;
  /** The exact raw request body bytes, as a string. */
  rawBody: string;
  /** Current time in unix seconds. Defaults to Date.now(). Injectable for tests. */
  nowSeconds?: number;
  /** Max allowed clock skew. Defaults to WEBHOOK_MAX_SKEW_SECONDS. */
  maxSkewSeconds?: number;
}

export type VerifyResult =
  | { valid: true }
  | { valid: false; reason: "missing" | "skew" | "signature" };

/**
 * Verify an inbound webhook. This is the reference implementation the receiver
 * (welfie-backend) should mirror. It accepts MULTIPLE secrets so a key rotation
 * can overlap: sign new deliveries with the new key while still accepting the
 * old one until every in-flight delivery has drained.
 */
export function verifySignature(opts: VerifyOptions): VerifyResult {
  const {
    secrets,
    signature,
    timestamp,
    rawBody,
    maxSkewSeconds = WEBHOOK_MAX_SKEW_SECONDS,
  } = opts;

  if (!signature || !timestamp || secrets.length === 0) {
    return { valid: false, reason: "missing" };
  }

  const ts = Number.parseInt(timestamp, 10);
  if (!Number.isFinite(ts)) {
    return { valid: false, reason: "skew" };
  }
  const now =
    opts.nowSeconds ?? Math.floor(Date.now() / 1000);
  if (Math.abs(now - ts) > maxSkewSeconds) {
    return { valid: false, reason: "skew" };
  }

  // Any accepted secret producing a matching signature is a pass.
  for (const secret of secrets) {
    const expected = signPayload(secret, timestamp, rawBody);
    if (constantTimeEqual(expected, signature)) {
      return { valid: true };
    }
  }
  return { valid: false, reason: "signature" };
}

/** Generate an opaque, URL-safe hand-off token (not a signing secret). */
export function generateOpaqueToken(bytes = 32): string {
  return randomBytes(bytes).toString("base64url");
}
