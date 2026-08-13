# Welfie referral fork — RefRef implementation notes

This fork adds the two capabilities the plan identified as missing from upstream
`refrefhq/refref` — **the referee form** and **the outbound webhook** — plus the
supporting schema, hand-off token flow, qualified-signup reconciliation, and
abuse controls. All changes are **additive** (no upstream table or route was
modified in a breaking way), so the fork stays easy to rebase.

Branch: `feat/welfie-referral-fork`.

## What the repo actually had (Phase 0 findings)

Several plan "open questions" were resolved by reading the code, not the docs:

- **`participant.external_id` already exists** (unique per product). The
  Welfie-user-id → participant mapping needs no new column.
- **A qualifying-event ingestion path already exists**: `POST /v1/track/signup`
  (API-key auth) creates a `referral` + `event` and runs the reward engine. This
  is the endpoint welfie-backend calls on Welfie signup. (Fallback of "write the
  event directly to the DB" is unnecessary.)
- **`apps/refer` was a pure redirect service** (`/r/:code` → 307 to the
  product's own landing page). There was no RefRef-hosted form. It is now the
  home of the public invite page, which is the natural fit (it is already the
  public, rate-limited, no-auth service).
- **No** webhook dispatcher, lead/consent storage, or hand-off tokens existed.
- The referrer-side share UI (widget) and JWT init already exist
  (`/v1/widget/init`), so Phase 2 largely stands.

## Schema (`packages/coredb`, migration `0003`)

New, additive tables (+ entity-id prefixes in `@refref/id`):

- `referral_lead` — a referee captured by the form **before** they have an
  account (a new table, because `referral.external_id` is `NOT NULL` = the
  referee's Welfie id, which doesn't exist yet at form time). Stores status,
  `email_verified`, versioned consent, attribution (`utm`, `ip`, `user_agent`),
  and `qualified_referral_id` / `matched_by` once reconciled.
- `handoff_token` — single-use, short-lived; stores only the SHA-256 **hash**.
- `webhook_endpoint` — per-product URL + `secret` + `secondary_secret` (rotation
  overlap) + subscribed `event_types`.
- `webhook_delivery` — outbound log **and** dead-letter queue; `event_id` is the
  idempotency key sent to the receiver, `dedupe_key` guards against
  double-enqueue. The worker polls this table.

Apply with `pnpm --filter @refref/coredb db:migrate` (or `db:push` in dev).

## Webhook dispatcher (`packages/webhooks`, new)

- **Signing**: HMAC-SHA256 over `${timestamp}.${rawBody}` → `X-Refref-Signature:
  sha256=<hex>` plus `X-Refref-Timestamp`. Binding the timestamp into the signed
  string makes replays detectable; the receiver also rejects skew > 120s.
- **`verifySignature`** accepts an **array of secrets** — the reference the
  receiver mirrors, and what enables rotation with overlap.
- **`enqueueWebhook`** writes one delivery row per subscribed endpoint. Never
  calls out inline (a slow downstream can't become a form timeout).
- **Worker** (`runWebhookWorker` / `runWebhookWorkerOnce`): claims due rows
  atomically, POSTs with a timeout, on failure applies exponential backoff with
  jitter, and dead-letters after `max_attempts`. `replayDelivery` re-queues a
  dead-lettered row.
- Runs inside the API when `WEBHOOK_WORKER_ENABLED=true`, or standalone via
  `apps/api` `pnpm --filter @refref/api worker` (`src/worker.ts`).

## Referee form + hand-off (`apps/refer`)

- `GET  {basePath}/invite/:code` — resolves the code server-side and renders a
  personalised, dependency-free HTML page. Fields are limited to **first name +
  email** by policy, with a versioned consent checkbox, a honeypot, and optional
  Turnstile.
- `POST {basePath}/invite/:code` — validates, runs abuse checks, writes the
  lead, enqueues `referral.created`, issues a single-use hand-off token, and
  `303`-redirects to `WELFIE_SIGNUP_URL?lt=<token>`.
- `basePath` (`REFER_BASE_PATH`, e.g. `/refer`) matches the reverse-proxy mount.
  `trustProxy` is on so client IP is correct behind the proxy.

## Qualified + token exchange (`apps/api`)

- `POST /v1/handoff/exchange` (API-key auth, **internal only** — allowlist to the
  private network at the proxy): single-use, constant-time hash claim; returns
  the referee prefill + referrer attribution.
- `POST /v1/track/signup` extended: after recording the event it calls
  `reconcileSignup`, which matches a pending lead by (0) explicit `leadId`, (1)
  hand-off token, or (2) **email within the attribution window** — the last one
  covers "submitted on mobile, signed up days later on desktop". On a match the
  lead flips to `qualified` and `referral.qualified` is enqueued. Reward status
  is reported as `pending_approval` (manual approval in v1). Failures here never
  fail the signup call.

## Abuse controls

Honeypot (silent drop), disposable-domain rejection, self-referral (referrer's
own email or shared **custom** domain — shared free providers like gmail are
allowed), tighter per-route rate limits, and optional Turnstile. Per the plan,
per-IP/per-code rate limits + WAF also belong at the proxy.

## Tests

- `packages/webhooks` — signing round-trip, tamper, skew, rotation overlap,
  backoff (8).
- `apps/refer` — abuse helpers (9) + existing redirect/health (19).
- `apps/api` — existing suite unaffected (53).
- **End-to-end** against a real Postgres: `apps/refer/scripts/itest.mts`
  (`pnpm --filter @refref/refer itest`) — 38 assertions covering page render,
  form submit, lead creation, `referral.created` enqueue + **retry-then-deliver**
  with signature verification, idempotent double-submit, single-use hand-off,
  email-reconciliation qualify + `referral.qualified`, and every abuse path.

## Still owned by welfie-backend (not in this fork)

Receiving the webhooks (verify HMAC + timestamp before parsing, upsert on
`event_id`), the HubSpot writes from a separate queue, double-opt-in email
verification before promoting a lead to a HubSpot contact, retention/deletion,
and the reward-approval UI. `verifySignature` in `@refref/webhooks` is the
reference to mirror on the receiver.
