import { schema, type DBType } from "@refref/coredb";
import { and, eq, inArray, lte, sql } from "drizzle-orm";
import {
  WEBHOOK_EVENT_ID_HEADER,
  WEBHOOK_EVENT_TYPE_HEADER,
  WEBHOOK_SIGNATURE_HEADER,
  WEBHOOK_TIMESTAMP_HEADER,
} from "@refref/types";
import { signPayload } from "./signing.js";

const { webhookDelivery, webhookEndpoint } = schema;

export interface WorkerOptions {
  /** Rows to claim per tick. Default 20. */
  batchSize?: number;
  /** Base backoff in ms (attempt 1). Default 30_000 (30s). */
  baseBackoffMs?: number;
  /** Max backoff in ms. Default 6h. */
  maxBackoffMs?: number;
  /** Per-request timeout in ms. Default 10_000. */
  requestTimeoutMs?: number;
  /** Injectable clock for tests. */
  now?: () => Date;
  /** Injectable fetch for tests. */
  fetchImpl?: typeof fetch;
  /** Optional structured logger. */
  logger?: {
    info: (o: unknown, m?: string) => void;
    error: (o: unknown, m?: string) => void;
  };
}

const DEFAULTS = {
  batchSize: 20,
  baseBackoffMs: 30_000,
  maxBackoffMs: 6 * 60 * 60 * 1000,
  requestTimeoutMs: 10_000,
};

/** Exponential backoff with light jitter. attempt is 1-based. */
export function computeBackoffMs(
  attempt: number,
  baseMs: number,
  maxMs: number,
): number {
  const raw = baseMs * Math.pow(2, Math.max(0, attempt - 1));
  const capped = Math.min(raw, maxMs);
  // +/- 15% jitter to avoid thundering herds on a recovering endpoint.
  const jitter = capped * 0.15 * (Math.random() * 2 - 1);
  return Math.max(0, Math.floor(capped + jitter));
}

/**
 * Claim up to `batchSize` due deliveries by flipping them to `delivering` in a
 * single UPDATE, so a second worker instance cannot pick the same rows. Returns
 * the claimed rows.
 */
async function claimDue(db: DBType, batchSize: number, now: Date) {
  // Subquery selects candidate ids; UPDATE ... WHERE id IN (...) RETURNING.
  const candidates = await db
    .select({ id: webhookDelivery.id })
    .from(webhookDelivery)
    .where(
      and(
        inArray(webhookDelivery.lastStatus, ["pending", "failed"]),
        lte(webhookDelivery.nextRetryAt, now),
        lt(webhookDelivery.attempts, webhookDelivery.maxAttempts),
      ),
    )
    .orderBy(webhookDelivery.nextRetryAt)
    .limit(batchSize);

  const ids = candidates.map((c) => c.id);
  if (ids.length === 0) return [];

  const claimed = await db
    .update(webhookDelivery)
    .set({ lastStatus: "delivering", updatedAt: now })
    .where(
      and(
        inArray(webhookDelivery.id, ids),
        inArray(webhookDelivery.lastStatus, ["pending", "failed"]),
      ),
    )
    .returning();

  return claimed;
}

// drizzle helper: column < column
function lt(a: unknown, b: unknown) {
  return sql`${a} < ${b}`;
}

/**
 * Deliver a single already-claimed row. Exported for tests and manual replay.
 */
export async function deliverOne(
  db: DBType,
  deliveryId: string,
  options: WorkerOptions = {},
): Promise<"delivered" | "failed" | "dead_letter" | "skipped"> {
  const opts = { ...DEFAULTS, ...options };
  const now = options.now ?? (() => new Date());
  const doFetch = options.fetchImpl ?? fetch;

  const [row] = await db
    .select()
    .from(webhookDelivery)
    .where(eq(webhookDelivery.id, deliveryId))
    .limit(1);
  if (!row) return "skipped";

  const [endpoint] = row.endpointId
    ? await db
        .select()
        .from(webhookEndpoint)
        .where(eq(webhookEndpoint.id, row.endpointId))
        .limit(1)
    : [undefined];

  const attemptNo = row.attempts + 1;

  // Endpoint gone or inactive -> dead-letter immediately, do not spin.
  if (!endpoint || !endpoint.isActive) {
    await db
      .update(webhookDelivery)
      .set({
        lastStatus: "dead_letter",
        lastError: "endpoint missing or inactive",
        attempts: attemptNo,
        updatedAt: now(),
      })
      .where(eq(webhookDelivery.id, deliveryId));
    return "dead_letter";
  }

  const rawBody = JSON.stringify(row.payload);
  const timestamp = Math.floor(now().getTime() / 1000).toString();
  const signature = signPayload(endpoint.secret, timestamp, rawBody);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.requestTimeoutMs);

  let responseCode: number | null = null;
  let errorText: string | null = null;
  let ok = false;

  try {
    const res = await doFetch(endpoint.url, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        [WEBHOOK_SIGNATURE_HEADER]: signature,
        [WEBHOOK_TIMESTAMP_HEADER]: timestamp,
        [WEBHOOK_EVENT_ID_HEADER]: row.eventId,
        [WEBHOOK_EVENT_TYPE_HEADER]: row.eventType,
      },
      body: rawBody,
      signal: controller.signal,
    });
    responseCode = res.status;
    ok = res.status >= 200 && res.status < 300;
    if (!ok) {
      errorText = `non-2xx status ${res.status}`;
    }
  } catch (err) {
    errorText = err instanceof Error ? err.message : String(err);
  } finally {
    clearTimeout(timer);
  }

  if (ok) {
    await db
      .update(webhookDelivery)
      .set({
        lastStatus: "delivered",
        lastResponseCode: responseCode,
        lastError: null,
        attempts: attemptNo,
        deliveredAt: now(),
        nextRetryAt: null,
        updatedAt: now(),
      })
      .where(eq(webhookDelivery.id, deliveryId));
    options.logger?.info(
      { deliveryId, eventId: row.eventId, attemptNo },
      "webhook delivered",
    );
    return "delivered";
  }

  // Failure path: schedule retry or dead-letter.
  const exhausted = attemptNo >= row.maxAttempts;
  const nextRetryAt = exhausted
    ? null
    : new Date(
        now().getTime() +
          computeBackoffMs(attemptNo, opts.baseBackoffMs, opts.maxBackoffMs),
      );

  await db
    .update(webhookDelivery)
    .set({
      lastStatus: exhausted ? "dead_letter" : "failed",
      lastResponseCode: responseCode,
      lastError: errorText,
      attempts: attemptNo,
      nextRetryAt,
      updatedAt: now(),
    })
    .where(eq(webhookDelivery.id, deliveryId));

  options.logger?.error(
    { deliveryId, eventId: row.eventId, attemptNo, errorText, exhausted },
    "webhook delivery failed",
  );

  return exhausted ? "dead_letter" : "failed";
}

/**
 * Process one batch of due deliveries. Returns how many rows were attempted.
 * Call this on an interval, or once from a cron/queue consumer.
 */
export async function runWebhookWorkerOnce(
  db: DBType,
  options: WorkerOptions = {},
): Promise<number> {
  const opts = { ...DEFAULTS, ...options };
  const now = options.now ?? (() => new Date());
  const claimed = await claimDue(db, opts.batchSize, now());
  for (const row of claimed) {
    await deliverOne(db, row.id, options);
  }
  return claimed.length;
}

/**
 * Long-running poller. Returns a stop() function. Intended to run inside the
 * API process (env-gated) or as a standalone worker entrypoint.
 */
export function runWebhookWorker(
  db: DBType,
  intervalMs = 5_000,
  options: WorkerOptions = {},
): () => void {
  let stopped = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  const tick = async () => {
    if (stopped) return;
    try {
      await runWebhookWorkerOnce(db, options);
    } catch (err) {
      options.logger?.error({ err }, "webhook worker tick failed");
    } finally {
      if (!stopped) timer = setTimeout(tick, intervalMs);
    }
  };

  timer = setTimeout(tick, intervalMs);
  return () => {
    stopped = true;
    if (timer) clearTimeout(timer);
  };
}

/**
 * Reset a failed/dead-letter delivery so the worker will attempt it again.
 * This is the replay path required for the dead-letter queue.
 */
export async function replayDelivery(
  db: DBType,
  deliveryId: string,
  { resetAttempts = false }: { resetAttempts?: boolean } = {},
): Promise<boolean> {
  const set: Record<string, unknown> = {
    lastStatus: "pending",
    nextRetryAt: new Date(),
    lastError: null,
    updatedAt: new Date(),
  };
  if (resetAttempts) set.attempts = 0;

  const rows = await db
    .update(webhookDelivery)
    .set(set)
    .where(
      and(
        eq(webhookDelivery.id, deliveryId),
        inArray(webhookDelivery.lastStatus, ["failed", "dead_letter"]),
      ),
    )
    .returning({ id: webhookDelivery.id });

  return rows.length > 0;
}
