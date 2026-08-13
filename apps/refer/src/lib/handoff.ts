import { createHash } from "node:crypto";
import { schema, type DBType } from "@refref/coredb";
import { generateOpaqueToken } from "@refref/webhooks";

const { handoffToken } = schema;

/** SHA-256 hex of the plaintext token. We never store the plaintext. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

export interface IssuedHandoff {
  /** Plaintext token — goes ONLY into the redirect URL, never persisted. */
  token: string;
  expiresAt: Date;
}

/**
 * Issue a single-use, short-lived hand-off token bound to a lead. Default TTL
 * is 10 minutes. welfie-backend exchanges it server-side at signup.
 */
export async function issueHandoffToken(
  db: DBType,
  leadId: string,
  ttlMinutes = 10,
): Promise<IssuedHandoff> {
  const token = generateOpaqueToken(32);
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + ttlMinutes * 60_000);

  await db.insert(handoffToken).values({
    tokenHash,
    leadId,
    expiresAt,
  });

  return { token, expiresAt };
}
