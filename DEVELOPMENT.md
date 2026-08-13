# RefRef — Local Development & Testing Handbook

Everything needed to install, configure, run and test this monorepo locally.

> For the product overview and feature list, see [README.md](README.md). For the
> Welfie referral fork design, see [WELFIE_FORK_IMPLEMENTATION.md](WELFIE_FORK_IMPLEMENTATION.md).

---

## Table of contents

1. [Architecture at a glance](#1-architecture-at-a-glance)
2. [Prerequisites](#2-prerequisites)
3. [Path A — Docker Compose (fastest)](#3-path-a--docker-compose-fastest)
4. [Path B — Local pnpm development](#4-path-b--local-pnpm-development)
5. [Environment variables](#5-environment-variables)
6. [Database workflow](#6-database-workflow)
7. [Testing handbook](#7-testing-handbook)
8. [Manual test recipes](#8-manual-test-recipes)
9. [Inspecting state](#9-inspecting-state)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. Architecture at a glance

A pnpm + Turborepo monorepo. `apps/*` are deployable services, `packages/*` are
shared libraries.

| App            | Package          | Default port | Purpose                                                       |
| -------------- | ---------------- | ------------ | ------------------------------------------------------------- |
| `apps/webapp`  | `@refref/webapp` | 3000         | Next.js admin portal, auth, tRPC API                          |
| `apps/api`     | `@refref/api`    | 3001         | Fastify public API (widget init, signup tracking, hand-off)   |
| `apps/refer`   | `@refref/refer`  | 3002         | Fastify public referral service — redirects, invite/join forms |
| `apps/acme`    | `@refref/acme`   | 3003 (`start`) | Demo merchant app for exercising the widget                 |
| `apps/assets`  | `@refref/assets` | 8787         | Cloudflare Worker serving `widget.v1.js` / `attribution.v1.js` |
| `apps/www`     | `@refref/www`    | —            | Marketing site + docs (Fumadocs)                              |
| `apps/e2e`     | `@refref/e2e`    | —            | Playwright end-to-end suite                                    |

Key shared packages: `@refref/coredb` (Drizzle schema + seed), `@refref/types`
(Zod schemas), `@refref/utils` (refcode generation), `@refref/webhooks`,
`@refref/id`, `@refref/auth`, `@refref/ui`.

### The referral flow

```mermaid
flowchart TD
    A["Referrer gets a link"] --> A1["Widget: POST /v1/widget/init (JWT)"]
    A --> A2["Anonymous: GET/POST /refer/join"]
    A1 --> B["refcode row, e.g. yaymdja"]
    A2 --> B
    B --> C["Share http://localhost:3002/yaymdja"]
    C --> D["GET /:code → 307"]
    D --> E["/refer/invite/yaymdja — personalised form"]
    E --> F["POST → referral_lead + handoff_token"]
    F --> G["303 to signup?lt=TOKEN"]
    G --> H["POST /v1/handoff/exchange → referral"]
```

Two ways a referrer obtains a link:

- **Authenticated** — the host product's frontend calls `POST /v1/widget/init`
  on `apps/api` with a product-signed JWT.
- **Anonymous** — a visitor fills the public form at `{REFER_BASE_PATH}/join`,
  identified only by email (`participant.external_id = "anon:<email>"`).

Both mint a `refcode`. Visiting that code redirects to the invite form, which
captures the referee and hands off to signup with a single-use token.

---

## 2. Prerequisites

| Tool       | Version              | Notes                                                     |
| ---------- | -------------------- | --------------------------------------------------------- |
| Node.js    | >= 20 (22 LTS tested) | Enforced by `engines` in the root `package.json`          |
| pnpm       | 10.23.0              | Pinned via `packageManager`; Corepack will fetch it       |
| PostgreSQL | 16                   | Or just use the Docker Compose `postgres` service         |
| Docker     | Desktop 4.x+         | Required for Path A                                        |
| portless   | latest               | Optional. `npm install -g portless`                        |
| Infisical  | latest               | Optional. Scripts fall back gracefully when absent         |

Enable Corepack once (needs network on first `pnpm` invocation):

```bash
corepack enable
```

### About the optional tools

Many `package.json` scripts are written as:

```
infisical run --env=dev -- <cmd> || <cmd>
```

If the Infisical CLI is missing the first half fails and the plain command runs,
so **you do not need Infisical**. Supply env vars via `.env` files instead.

`portless` gives each app a stable `*.localhost:1355` hostname. Skip it with
`PORTLESS=0 pnpm dev` and use raw ports.

---

## 3. Path A — Docker Compose (fastest)

Best for exercising the referral flow without a local toolchain.

```bash
git clone https://github.com/refrefhq/refref.git
cd refref

# Postgres + webapp (runs db:push and db:seed automatically on boot)
docker compose up -d postgres webapp

# The public referral service
docker compose up -d --build refer
```

Services:

| URL                     | What                         |
| ----------------------- | ---------------------------- |
| http://localhost:3000   | Webapp portal                |
| http://localhost:3002   | Refer service                |
| `localhost:5432`        | Postgres (`postgres`/`postgres`) |

Verify:

```bash
curl -s http://localhost:3002/health
# {"status":"ok","timestamp":"...","service":"refer"}

docker compose logs -f refer
```

Tear down (`-v` also drops the database volume):

```bash
docker compose down       # keep data
docker compose down -v    # wipe data
```

### Rebuilding after a code change

The `refer` image is built from source, so changes require a rebuild:

```bash
docker compose build refer && docker compose up -d refer
```

> `apps/api`, `apps/assets` and `apps/acme` are **not** in `docker-compose.yml`.
> Run them via Path B if you need them. `Dockerfile.api` and `Dockerfile.refer`
> exist for deployment.

---

## 4. Path B — Local pnpm development

### 4.1 Install

```bash
pnpm install
```

### 4.2 Start Postgres

Reuse the Compose database rather than installing Postgres:

```bash
docker compose up -d postgres
```

### 4.3 Configure environment

```bash
cp apps/webapp/.env.example apps/webapp/.env
cp apps/api/.env.example    apps/api/.env
cp apps/refer/.env.example  apps/refer/.env

# Required by the webapp
openssl rand -base64 32   # paste into BETTER_AUTH_SECRET
```

### 4.4 Create the schema and seed

```bash
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/refref"

pnpm -F @refref/coredb db:push
pnpm -F @refref/coredb db:seed
```

### 4.5 Run

```bash
# Everything
pnpm dev

# Or a single service
pnpm -F @refref/refer  dev
pnpm -F @refref/api    dev
pnpm -F @refref/webapp dev
```

With portless running:

| App    | URL                                 |
| ------ | ----------------------------------- |
| Webapp | http://refref-webapp.localhost:1355 |
| WWW    | http://refref-www.localhost:1355    |
| API    | http://refref-api.localhost:1355    |
| Refer  | http://refref-refer.localhost:1355  |
| Acme   | http://refref-acme.localhost:1355   |

Without portless (`PORTLESS=0 pnpm dev`), use `localhost:3000/3001/3002/3003`.

### 4.6 Common commands

```bash
pnpm build         # turbo run build
pnpm lint
pnpm type:check
pnpm format
pnpm test          # turbo run test across all packages

# Scope to one package
pnpm -F @refref/refer type:check
pnpm -F @refref/refer test
```

---

## 5. Environment variables

### Required

| Variable             | Used by        | Notes                                    |
| -------------------- | -------------- | ---------------------------------------- |
| `DATABASE_URL`       | all            | `postgresql://postgres:postgres@localhost:5432/refref` |
| `BETTER_AUTH_SECRET` | webapp         | `openssl rand -base64 32`                |

### `apps/refer`

See [apps/refer/.env.example](apps/refer/.env.example).

| Variable                   | Default                    | Notes                                                          |
| -------------------------- | -------------------------- | -------------------------------------------------------------- |
| `PORT`                     | `3002`                     |                                                                |
| `NODE_ENV`                 | —                          | Must be `production` in the Docker image (see Troubleshooting) |
| `REFER_BASE_PATH`          | `""`                       | Proxy prefix, e.g. `/refer`. Applies to `/invite` and `/join`  |
| `REFERRAL_HOST_URL`        | `http://localhost:3002`    | Origin used to build referral links. **No trailing slash, no base path** |
| `WELFIE_SIGNUP_URL`        | `https://welfie.com/signup`| Where the invite form hands off                                |
| `PRIVACY_POLICY_URL`       | `https://welfie.com/privacy`| Linked beside the consent checkbox                            |
| `REFERRAL_CONSENT_VERSION` | `privacy-2026-08`          | Stored with every lead                                         |
| `HANDOFF_TTL_MINUTES`      | `10`                       | Single-use token lifetime                                      |
| `DISPOSABLE_DOMAINS_EXTRA` | `""`                       | Comma/space separated additions to the blocklist               |
| `TURNSTILE_SITE_KEY`       | —                          | Renders the CAPTCHA widget when set                            |
| `TURNSTILE_SECRET`         | —                          | **CAPTCHA is only enforced when this is set.** Leave empty locally |

> `REFERRAL_HOST_URL` must **not** include `REFER_BASE_PATH`. The `/:code`
> redirect is registered at the root, so links look like
> `http://localhost:3002/yaymdja` even when `REFER_BASE_PATH=/refer`.
> Keep the value identical in `apps/api` and `apps/refer`, or the two services
> will hand out different link formats.

### `apps/api`

See [apps/api/.env.example](apps/api/.env.example): `PORT` (3001),
`REFERRAL_HOST_URL`, `WEBHOOK_WORKER_ENABLED`, `WEBHOOK_WORKER_INTERVAL_MS`,
`ATTRIBUTION_WINDOW_DAYS`.

### `apps/webapp`

See [apps/webapp/.env.example](apps/webapp/.env.example). Optional:
`GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET`, `RESEND_API_KEY`,
`NEXT_PUBLIC_POSTHOG_KEY`, `NEXT_PUBLIC_ASSETS_URL`.

---

## 6. Database workflow

```bash
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/refref"

pnpm -F @refref/coredb db:push        # sync schema directly (dev)
pnpm -F @refref/coredb db:generate    # emit a migration from schema.ts
pnpm -F @refref/coredb db:migrate     # apply migrations
pnpm -F @refref/coredb db:studio      # Drizzle Studio GUI
pnpm -F @refref/coredb db:seed        # insert fixtures
pnpm -F @refref/coredb db:deleteseed  # remove fixtures
```

Schema lives in [packages/coredb/src/schema.ts](packages/coredb/src/schema.ts);
migrations in [packages/coredb/drizzle](packages/coredb/drizzle).

Applying a single migration to a running container:

```bash
docker exec -i refref-db psql -U postgres -d refref \
  < packages/coredb/drizzle/0004_nostalgic_multiple_man.sql
```

### Seed fixtures you will actually use

From [packages/coredb/src/seed.ts](packages/coredb/src/seed.ts):

| Entity                  | ID / value                     |
| ----------------------- | ------------------------------ |
| Product ("Demo SaaS")   | `prd_rfl78apntmdzwuyxykqd7ait` |
| Active program          | `prg_bi46lm8q7llax4khniewcvlb` |
| Seeded refcode          | `rpetnw5`                      |
| Login user              | `test1@test.com`               |

Only `prg_bi46lm8q7llax4khniewcvlb` has `status = 'active'`, and **the join and
invite pages only ever resolve active programs**.

The seed does not populate `brandConfig`, which supplies the form's accent
colour. Add it if you want branded pages:

```sql
UPDATE program SET config = jsonb_set(config::jsonb, '{brandConfig}',
  '{"primaryColor":"#0f9d58","landingPageUrl":"http://localhost:3000/auth/sign-up"}'::jsonb,
  true)
WHERE id = 'prg_bi46lm8q7llax4khniewcvlb';
```

---

## 7. Testing handbook

### 7.1 The layers

| Layer             | Tool       | Needs a database? | Command                          |
| ----------------- | ---------- | ----------------- | -------------------------------- |
| Unit / route      | Vitest     | No — mocked       | `pnpm -F @refref/refer test`     |
| Integration       | tsx script | **Yes**, seeded   | `pnpm -F @refref/refer itest`    |
| End-to-end        | Playwright | **Yes**, seeded   | `pnpm -F @refref/e2e test`       |
| Types             | tsc        | No                | `pnpm type:check`                |

### 7.2 Unit and route tests

```bash
pnpm test                          # everything, via turbo
pnpm -F @refref/refer test         # one package
pnpm -F @refref/refer test:watch
pnpm -F @refref/refer test:ui
```

The database is mocked in [apps/refer/test/setup.ts](apps/refer/test/setup.ts),
which replaces `@refref/coredb`'s `createDb` with a Vitest mock. Each test
primes the queries it needs:

```ts
mockDb.query.refcode.findFirst.mockResolvedValueOnce({
  id: "rc_happy",
  code: "abc1234",
  participant: { id: "prt_123", name: "John Doe", email: "john@example.com" },
});
```

`vitest.config.ts` pins `NODE_ENV=test` and a dummy `DATABASE_URL`, so **no
Postgres is required** and `REFER_BASE_PATH` is empty — meaning redirect targets
are `/invite/<code>`, not `/refer/invite/<code>`. Existing assertions use
`toMatch(/\/invite\/abc1234(\?|$)/)` so they hold under either base path.

Current suites: `abuse.test.ts` (9), `health.test.ts` (6),
`referral-redirect.test.ts` (13) — 28 tests.

### 7.3 Integration test (real database)

[apps/refer/scripts/itest.mts](apps/refer/scripts/itest.mts) boots the real app
against real Postgres and drives lead → webhook → hand-off → qualified,
including HMAC signature verification and a forced delivery retry.

```bash
export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/refref"
pnpm -F @refref/coredb db:seed        # requires refcode rpetnw5
pnpm -F @refref/refer  itest
```

Exits non-zero on any failed assertion.

### 7.4 End-to-end (Playwright)

```bash
cd apps/e2e
pnpm exec playwright install     # first run only
pnpm test
pnpm test:ui                     # interactive
pnpm test:headed
pnpm cleanup-ports               # frees 3000-3003, 8787
```

### 7.5 Before opening a PR

```bash
pnpm type:check
pnpm lint
pnpm test
```

> `pnpm build` at the root currently fails on `@refref/webapp` with
> `Invalid environment variables` unless the webapp's env is populated — its
> `env.ts` validates at build time. Build a single package to sidestep this:
> `pnpm exec turbo run build --filter=@refref/refer...`

---

## 8. Manual test recipes

Assumes Path A with `REFER_BASE_PATH=/refer` and the seeded product
`prd_rfl78apntmdzwuyxykqd7ait`.

### Recipe 1 — Anonymous referrer gets a link

```bash
PID=prd_rfl78apntmdzwuyxykqd7ait

# 1. Load the public form (no auth, no cookies)
curl -s -o /dev/null -w "%{http_code}\n" \
  "http://localhost:3002/refer/join?productId=$PID"     # 200

# 2. Submit it
curl -s -X POST http://localhost:3002/refer/join \
  -d "productId=$PID" -d "firstName=Ramya" \
  -d "email=ramya@example.com" -d "consent=yes" \
  | grep -oE 'Referral code: [a-z0-9]+'
```

Re-submitting the same email returns the **same** code — the participant is
upserted on `(product_id, external_id)`.

### Recipe 2 — Referee journey

```bash
CODE=<code from recipe 1>

# The link lands on the personalised form, forwarding utm params
curl -s -o /dev/null -D - \
  "http://localhost:3002/$CODE?utm_source=whatsapp" | grep -i location
# location: /refer/invite/<CODE>?utm_source=whatsapp

# Submit referee details -> 303 to signup with a single-use hand-off token
curl -s -o /dev/null -D - -X POST "http://localhost:3002/refer/invite/$CODE" \
  -d "firstName=Arjun" -d "lastName=Mehta" \
  -d "email=arjun@gmail.com" --data-urlencode "phone=+61 400 123 456" \
  -d "consent=yes" | grep -i location
# location: http://localhost:3000/auth/sign-up?lt=<TOKEN>
```

> **Gotcha:** the referee's address must differ from the referrer's. Only an
> exact match is blocked (`same_email`) — colleagues on a shared company domain
> are allowed. See [apps/refer/src/lib/abuse.ts](apps/refer/src/lib/abuse.ts).

### Recipe 3 — Abuse controls

Each must return `400` and write **no** rows:

```bash
U=http://localhost:3002/refer/join
P=productId=prd_rfl78apntmdzwuyxykqd7ait

curl -s -X POST $U -d "$P" -d "email=b@x.com"  -d "consent=yes" -d "company=Bot"  # honeypot
curl -s -X POST $U -d "$P" -d "email=x@mailinator.com" -d "consent=yes"           # disposable
curl -s -X POST $U -d "$P" -d "email=n@x.com"                                     # no consent
curl -s -X POST $U -d "$P" -d "email=not-an-email" -d "consent=yes"               # bad email
```

Unknown or missing `productId` returns `404`.

### Recipe 4 — Rate limits

| Route                    | Limit    |
| ------------------------ | -------- |
| `GET /:code`             | 100/min  |
| `GET .../join`           | 60/min   |
| `POST .../join`          | 10/min   |
| `GET .../invite/:code`   | 60/min   |
| `POST .../invite/:code`  | 20/min   |
| Global default           | 100/min  |

```bash
for i in $(seq 1 12); do
  curl -s -o /dev/null -w "%{http_code} " -X POST http://localhost:3002/refer/join \
    -d "productId=prd_rfl78apntmdzwuyxykqd7ait" \
    -d "email=flood$i@example.com" -d "consent=yes"
done
# ... 200 200 429 429
```

Limits are per IP and reset after the window. **Remember you consumed quota
while testing** — a later `429` may be your own earlier requests.

### Recipe 5 — Browser walkthrough

1. Open `http://localhost:3002/refer/join?productId=prd_rfl78apntmdzwuyxykqd7ait`
2. Fill first name + email, tick consent, submit → success page with a Copy button
3. Open the returned link → redirects to the invite form showing
   *"<Referrer> invited you to Welfie"* and a read-only **Referred by** field
4. Fill referee details, submit → lands on the webapp signup with `?lt=<token>`

---

## 9. Inspecting state

```bash
PSQL="docker exec refref-db psql -U postgres -d refref"

# Products with an active program (what /join accepts)
$PSQL -c "SELECT p.id, p.name, g.id AS program_id FROM product p
          JOIN program g ON g.product_id = p.id WHERE g.status='active';"

# Anonymous referrers and their links
$PSQL -c "SELECT p.external_id, p.name, r.code
          FROM participant p JOIN refcode r ON r.participant_id = p.id
          WHERE p.external_id LIKE 'anon:%';"

# Most recent captured lead
$PSQL -x -c "SELECT code, email, first_name, last_name, phone, status, utm
             FROM referral_lead ORDER BY created_at DESC LIMIT 1;"

# Webhook delivery attempts
$PSQL -c "SELECT event_type, last_status, attempts, max_attempts
          FROM webhook_delivery ORDER BY created_at DESC LIMIT 10;"
```

Clean up test data:

```bash
$PSQL -c "DELETE FROM participant WHERE external_id LIKE 'anon:%';"
```

---

## 10. Troubleshooting

### `Corepack is about to download pnpm… Operation not permitted`

Corepack needs network and a writable `~/.cache` on first run. Run
`corepack enable && pnpm --version` once in a normal terminal, or invoke the
local binary directly: `node node_modules/typescript/bin/tsc --noEmit`.

### `unable to determine transport target for "pino-pretty"`

`pino-pretty` is a devDependency, but Fastify enables it whenever
`NODE_ENV !== "production"`. The production image installs `--prod` only, so the
container crashes on boot. Set `NODE_ENV=production` for containerised runs —
already configured on the `refer` service in `docker-compose.yml`.

### `pnpm build` fails on `@refref/webapp` — "Invalid environment variables"

The webapp validates env at build time via `env.ts`. Populate
`apps/webapp/.env`, or build only what you need:

```bash
pnpm exec turbo run build --filter=@refref/refer...
```

### Join page returns 404

The product must exist **and** have a program with `status = 'active'`:

```bash
docker exec refref-db psql -U postgres -d refref -c \
  "SELECT product_id, status FROM program WHERE status='active';"
```

### Form submission rejected with "This email address can't be used"

Self-referral detection: the referee entered the referrer's own email address.
Any other address is accepted, including one on the same domain.

### Referral link 404s

Codes are normalised to lowercase and must exist in `refcode`. `/:code` matches
7-char global codes; `/:productSlug/:code` resolves vanity slugs through
`reflink`. Static routes such as `/join` and `/health` take precedence over the
`/:code` parameter route.

### Widget scripts fail with `ERR_CONNECTION_REFUSED` on :8787

`apps/assets` is not part of Docker Compose. Either start it
(`pnpm -F @refref/assets dev`) or ignore it — it does not affect the referral
redirect or form flows.

### Changes to `apps/refer` are not visible

The Docker image is built from source. Rebuild:

```bash
docker compose build refer && docker compose up -d refer
```

### Ports already in use

```bash
pnpm -F @refref/e2e cleanup-ports   # frees 3000-3003 and 8787
```
