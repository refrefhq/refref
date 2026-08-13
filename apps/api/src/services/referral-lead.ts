import { createHash } from "node:crypto";
import { schema } from "@refref/coredb";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { and, desc, eq, gte, isNull } from "drizzle-orm";

const { referralLead, handoffToken } = schema;

type DbType = PostgresJsDatabase<typeof schema>;

export type MatchedBy = "handoff_token" | "email_reconciliation";

export interface QualifiedLead {
  leadId: string;
  matchedBy: MatchedBy;
  code: string;
  programId: string;
  email: string;
  referrerParticipantId: string;
}

function hashToken(token: string): string {
  return createHash("sha256").update(token, "utf8").digest("hex");
}

/**
 * Consume a hand-off token: atomically mark it consumed only if it is unused and
 * unexpired (single-use, constant-time compare on the stored hash), returning
 * the associated lead. Returns null if the token is unknown, expired, or already
 * consumed.
 */
export async function consumeHandoffToken(db: DbType, token: string, now = new Date()) {
  const tokenHash = hashToken(token);

  // Atomic single-use claim. The WHERE clause guarantees only the first caller
  // wins even under concurrent exchange attempts.
  const [claimed] = await db
    .update(handoffToken)
    .set({ consumedAt: now, updatedAt: now })
    .where(
      and(
        eq(handoffToken.tokenHash, tokenHash),
        isNull(handoffToken.consumedAt),
        gte(handoffToken.expiresAt, now),
      ),
    )
    .returning();

  if (!claimed) return null;

  const [lead] = await db
    .select()
    .from(referralLead)
    .where(eq(referralLead.id, claimed.leadId))
    .limit(1);

  return lead ?? null;
}

/**
 * Look up a hand-off token WITHOUT consuming it (for the exchange endpoint that
 * prefills the signup form). Returns the lead if valid and unconsumed.
 */
export async function peekHandoffToken(db: DbType, token: string, now = new Date()) {
  const tokenHash = hashToken(token);
  const [row] = await db
    .select()
    .from(handoffToken)
    .where(eq(handoffToken.tokenHash, tokenHash))
    .limit(1);
  if (!row || row.consumedAt || row.expiresAt < now) return null;
  const [lead] = await db
    .select()
    .from(referralLead)
    .where(eq(referralLead.id, row.leadId))
    .limit(1);
  return lead ?? null;
}

/** Mark a lead qualified and link it to the real referral row. Idempotent. */
async function markQualified(
  db: DbType,
  leadId: string,
  opts: {
    matchedBy: MatchedBy;
    referralId?: string;
    refereeExternalId?: string;
    now?: Date;
  },
) {
  const now = opts.now ?? new Date();
  const [updated] = await db
    .update(referralLead)
    .set({
      status: "qualified",
      matchedBy: opts.matchedBy,
      qualifiedReferralId: opts.referralId ?? null,
      qualifiedAt: now,
      emailVerified: true,
      updatedAt: now,
    })
    // Only transition from pending -> qualified so re-delivery is harmless.
    .where(and(eq(referralLead.id, leadId), eq(referralLead.status, "pending")))
    .returning();
  return updated ?? null;
}

export interface ReconcileInput {
  productId: string;
  email?: string;
  /** Lead id from a prior token exchange, for deterministic matching. */
  leadId?: string;
  /** Explicit token passed by welfie-backend for deterministic matching. */
  handoffToken?: string;
  /** The referral row id created for this signup, to link back. */
  referralId?: string;
  /** The new referee's Welfie user id. */
  refereeExternalId?: string;
  /** Email-reconciliation attribution window in days. */
  windowDays?: number;
  now?: Date;
}

/**
 * Reconcile a signup against a pending lead. Prefers the hand-off token (exact
 * match) and falls back to email reconciliation within the attribution window —
 * the latter is what covers "submitted on mobile, signed up days later on
 * desktop". Returns the qualified lead, or null if nothing matched.
 */
export async function reconcileSignup(
  db: DbType,
  input: ReconcileInput,
): Promise<QualifiedLead | null> {
  const now = input.now ?? new Date();
  const windowDays = input.windowDays ?? 30;

  // 0) Direct lead id (welfie-backend already exchanged the token server-side).
  if (input.leadId) {
    const [lead] = await db
      .select()
      .from(referralLead)
      .where(eq(referralLead.id, input.leadId))
      .limit(1);
    if (lead && lead.status === "pending" && lead.productId === input.productId) {
      const updated = await markQualified(db, lead.id, {
        matchedBy: "handoff_token",
        referralId: input.referralId,
        refereeExternalId: input.refereeExternalId,
        now,
      });
      if (updated) {
        return {
          leadId: updated.id,
          matchedBy: "handoff_token",
          code: updated.code,
          programId: updated.programId,
          email: updated.email,
          referrerParticipantId: updated.referrerParticipantId,
        };
      }
    }
  }

  // 1) Deterministic hand-off token match.
  if (input.handoffToken) {
    const lead = await consumeHandoffToken(db, input.handoffToken, now);
    if (lead && lead.status === "pending") {
      const updated = await markQualified(db, lead.id, {
        matchedBy: "handoff_token",
        referralId: input.referralId,
        refereeExternalId: input.refereeExternalId,
        now,
      });
      if (updated) {
        return {
          leadId: updated.id,
          matchedBy: "handoff_token",
          code: updated.code,
          programId: updated.programId,
          email: updated.email,
          referrerParticipantId: updated.referrerParticipantId,
        };
      }
    }
  }

  // 2) Email reconciliation within the attribution window.
  if (input.email) {
    const email = input.email.trim().toLowerCase();
    const cutoff = new Date(now.getTime() - windowDays * 24 * 60 * 60 * 1000);
    const lead = await db.query.referralLead.findFirst({
      where: and(
        eq(referralLead.productId, input.productId),
        eq(referralLead.email, email),
        eq(referralLead.status, "pending"),
        gte(referralLead.createdAt, cutoff),
      ),
      orderBy: desc(referralLead.createdAt),
    });
    if (lead) {
      const updated = await markQualified(db, lead.id, {
        matchedBy: "email_reconciliation",
        referralId: input.referralId,
        refereeExternalId: input.refereeExternalId,
        now,
      });
      if (updated) {
        return {
          leadId: updated.id,
          matchedBy: "email_reconciliation",
          code: updated.code,
          programId: updated.programId,
          email: updated.email,
          referrerParticipantId: updated.referrerParticipantId,
        };
      }
    }
  }

  return null;
}
