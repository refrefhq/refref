import { schema, type DBType } from "@refref/coredb";
import { createId } from "@refref/id";
import { eq, and } from "drizzle-orm";
import type { WebhookEventType } from "@refref/types";

const { webhookEndpoint, webhookDelivery } = schema;

export interface EnqueueWebhookInput {
  productId: string;
  eventType: WebhookEventType;
  /** The payload MINUS the transport-level `event_id` — that is generated here. */
  payload: Record<string, unknown>;
  /**
   * Optional application-level idempotency key. If a delivery with the same
   * dedupeKey already exists, enqueue is a no-op. Use this to make a double
   * form-submit or a retried signup call harmless.
   */
  dedupeKey?: string;
}

export interface EnqueueResult {
  enqueued: number;
  eventIds: string[];
  skipped: boolean;
}

/**
 * Enqueue an outbound webhook for every active endpoint on the product that is
 * subscribed to this event type. Writes one `webhook_delivery` row per endpoint
 * with `lastStatus = "pending"` and `nextRetryAt = now`, to be picked up by the
 * worker. The call is asynchronous by contract: it never performs the HTTP
 * request inline, so a slow downstream can never turn into a form/API timeout.
 */
export async function enqueueWebhook(
  db: DBType,
  input: EnqueueWebhookInput,
): Promise<EnqueueResult> {
  const endpoints = await db
    .select()
    .from(webhookEndpoint)
    .where(
      and(
        eq(webhookEndpoint.productId, input.productId),
        eq(webhookEndpoint.isActive, true),
      ),
    );

  const subscribed = endpoints.filter((e) =>
    (e.eventTypes ?? []).includes(input.eventType),
  );

  if (subscribed.length === 0) {
    return { enqueued: 0, eventIds: [], skipped: true };
  }

  const eventIds: string[] = [];
  let enqueued = 0;

  for (const endpoint of subscribed) {
    const eventId = createId("webhookEvent");
    // Stamp the transport-level event_id into the payload so what we persist is
    // byte-for-byte what we will POST later.
    const payload = { ...input.payload, event_id: eventId };
    const dedupeKey = input.dedupeKey
      ? `${endpoint.id}:${input.dedupeKey}`
      : null;

    const [row] = await db
      .insert(webhookDelivery)
      .values({
        eventId,
        dedupeKey,
        endpointId: endpoint.id,
        productId: input.productId,
        eventType: input.eventType,
        payload,
        lastStatus: "pending",
        nextRetryAt: new Date(),
      })
      .onConflictDoNothing({ target: webhookDelivery.dedupeKey })
      .returning({ id: webhookDelivery.id, eventId: webhookDelivery.eventId });

    if (row) {
      enqueued += 1;
      eventIds.push(row.eventId);
    }
  }

  return { enqueued, eventIds, skipped: false };
}
