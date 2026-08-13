/**
 * End-to-end integration test for the Welfie referral fork.
 * Runs against a real Postgres (seeded). Boots the refer app, drives the full
 * referee-form -> lead -> webhook -> handoff -> qualified flow, and verifies
 * HMAC signatures on a local receiver. Exits non-zero on any failed assertion.
 */
import http from "node:http";
import { createDb, schema } from "@refref/coredb";
import {
  enqueueWebhook,
  runWebhookWorkerOnce,
  verifySignature,
} from "@refref/webhooks";
import { and, eq } from "drizzle-orm";
import {
  consumeHandoffToken,
  reconcileSignup,
} from "../../api/src/services/referral-lead.js";
import { buildApp } from "../src/app.js";

const { webhookEndpoint, referralLead, webhookDelivery, participant } = schema;

const PRODUCT_1 = "prd_rfl78apntmdzwuyxykqd7ait";
const CODE = "rpetnw5";
const SECRET = "whsec_itest_primary";
const SIGNUP_URL = "https://welfie.example/signup";

let failures = 0;
function check(name: string, cond: boolean, extra?: unknown) {
  if (cond) {
    console.log(`  ✓ ${name}`);
  } else {
    failures++;
    console.error(`  ✗ ${name}`, extra ?? "");
  }
}

const db = createDb(process.env.DATABASE_URL!);

async function main() {
  // --- local webhook receiver -------------------------------------------------
  const received: Array<{ type: string; body: any; sigValid: boolean }> = [];
  let failFirst = true; // force one retry to exercise backoff/dead-letter path
  const receiver = http.createServer((req, res) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      const sig = req.headers["x-refref-signature"] as string;
      const ts = req.headers["x-refref-timestamp"] as string;
      const result = verifySignature({
        secrets: [SECRET],
        signature: sig,
        timestamp: ts,
        rawBody: raw,
      });
      const body = JSON.parse(raw);
      if (failFirst) {
        failFirst = false;
        res.statusCode = 503;
        res.end("try later");
        return;
      }
      received.push({ type: body.event, body, sigValid: result.valid });
      res.statusCode = 200;
      res.end("ok");
    });
  });
  await new Promise<void>((r) => receiver.listen(0, "127.0.0.1", r));
  const recvPort = (receiver.address() as any).port;
  const recvUrl = `http://127.0.0.1:${recvPort}/hook`;

  // Register endpoint for the product.
  await db.delete(webhookEndpoint).where(eq(webhookEndpoint.productId, PRODUCT_1));
  await db.insert(webhookEndpoint).values({
    productId: PRODUCT_1,
    url: recvUrl,
    secret: SECRET,
  });

  // Clean any prior test leads/deliveries for a deterministic run.
  await db.delete(referralLead);
  await db.delete(webhookDelivery);

  // --- boot the refer app -----------------------------------------------------
  process.env.WELFIE_SIGNUP_URL = SIGNUP_URL;
  process.env.REFER_BASE_PATH = "";
  const app = await buildApp();
  await app.listen({ port: 0, host: "127.0.0.1" });
  const addr = app.server.address() as any;
  const base = `http://127.0.0.1:${addr.port}`;

  const worker = () =>
    runWebhookWorkerOnce(db, { baseBackoffMs: 1, requestTimeoutMs: 3000 });

  try {
    console.log("\n[1] GET invite page");
    const pageRes = await fetch(`${base}/invite/${CODE}`);
    const pageHtml = await pageRes.text();
    check("returns 200", pageRes.status === 200);
    check("renders the form", pageHtml.includes("Continue to Welfie"));
    check("has honeypot field", pageHtml.includes('name="company"'));
    check("has consent checkbox", pageHtml.includes('name="consent"'));

    console.log("\n[2] POST valid referee form");
    const form = new URLSearchParams({
      email: "Friend@Example.com",
      firstName: "Friendly",
      consent: "yes",
      consent_version: "privacy-2026-08",
    });
    const submit = await fetch(`${base}/invite/${CODE}`, {
      method: "POST",
      body: form,
      redirect: "manual",
      headers: { "content-type": "application/x-www-form-urlencoded" },
    });
    check("returns 303 redirect", submit.status === 303);
    const loc = submit.headers.get("location") || "";
    check("redirects to signup with token", loc.startsWith(`${SIGNUP_URL}?lt=`), loc);
    const token = new URL(loc).searchParams.get("lt") || "";
    check("token is present", token.length > 20);

    const leads = await db
      .select()
      .from(referralLead)
      .where(eq(referralLead.email, "friend@example.com"));
    check("lead created (email normalized)", leads.length === 1);
    check("lead is pending", leads[0]?.status === "pending");
    check("lead email not verified", leads[0]?.emailVerified === false);
    check("consent version stored", leads[0]?.consentVersion === "privacy-2026-08");
    check("consent timestamp stored", !!leads[0]?.consentAt);
    check("ip captured", !!leads[0]?.ip);
    const leadId = leads[0]!.id;

    const createdDeliveries = await db
      .select()
      .from(webhookDelivery)
      .where(eq(webhookDelivery.eventType, "referral.created"));
    check("referral.created enqueued", createdDeliveries.length === 1);
    check(
      "payload event correct",
      (createdDeliveries[0]?.payload as any)?.event === "referral.created",
    );
    check(
      "payload has event_id",
      typeof (createdDeliveries[0]?.payload as any)?.event_id === "string",
    );

    console.log("\n[3] Webhook worker: retry then deliver");
    await worker(); // first attempt -> receiver returns 503
    const afterFirst = await db
      .select()
      .from(webhookDelivery)
      .where(eq(webhookDelivery.id, createdDeliveries[0]!.id));
    check("first attempt failed", afterFirst[0]?.lastStatus === "failed");
    check("attempts incremented", afterFirst[0]?.attempts === 1);
    await new Promise((r) => setTimeout(r, 60));
    await worker(); // second attempt -> 200
    const afterSecond = await db
      .select()
      .from(webhookDelivery)
      .where(eq(webhookDelivery.id, createdDeliveries[0]!.id));
    check("delivered on retry", afterSecond[0]?.lastStatus === "delivered");
    check(
      "receiver verified signature",
      received.some((r) => r.type === "referral.created" && r.sigValid),
    );

    console.log("\n[4] Idempotent double submit");
    const submit2 = await fetch(`${base}/invite/${CODE}`, {
      method: "POST",
      body: new URLSearchParams({
        email: "friend@example.com",
        firstName: "Friendly",
        consent: "yes",
      }),
      redirect: "manual",
      headers: { "content-type": "application/x-www-form-urlencoded" },
    });
    check("second submit also 303", submit2.status === 303);
    const leadsAfter = await db
      .select()
      .from(referralLead)
      .where(eq(referralLead.email, "friend@example.com"));
    check("no duplicate lead", leadsAfter.length === 1);
    const createdAfter = await db
      .select()
      .from(webhookDelivery)
      .where(eq(webhookDelivery.eventType, "referral.created"));
    check("no duplicate created-delivery (dedupe)", createdAfter.length === 1);

    console.log("\n[5] Hand-off token single-use");
    const first = await consumeHandoffToken(db, token);
    check("first exchange resolves lead", first?.id === leadId);
    const second = await consumeHandoffToken(db, token);
    check("second exchange is rejected (single-use)", second === null);

    console.log("\n[6] Qualify via email reconciliation + referral.qualified");
    const qualified = await reconcileSignup(db, {
      productId: PRODUCT_1,
      email: "friend@example.com",
      refereeExternalId: "usr_newfriend",
      windowDays: 30,
    });
    check("reconcile matched by email", qualified?.matchedBy === "email_reconciliation");
    const qLead = await db
      .select()
      .from(referralLead)
      .where(eq(referralLead.id, leadId));
    check("lead now qualified", qLead[0]?.status === "qualified");
    check("lead email now verified", qLead[0]?.emailVerified === true);

    await enqueueWebhook(db, {
      productId: PRODUCT_1,
      eventType: "referral.qualified",
      payload: {
        event: "referral.qualified",
        occurred_at: new Date().toISOString(),
        program_id: qualified!.programId,
        referral: { id: leadId, code: CODE, status: "qualified" },
        referee: { email: "friend@example.com", external_id: "usr_newfriend" },
        reward: {
          id: null,
          type: "cash",
          amount: 10,
          currency: "AUD",
          status: "pending_approval",
        },
        matched_by: qualified!.matchedBy,
      },
      dedupeKey: `qualified:${leadId}`,
    });
    await new Promise((r) => setTimeout(r, 20));
    await worker();
    const qDelivery = await db
      .select()
      .from(webhookDelivery)
      .where(eq(webhookDelivery.eventType, "referral.qualified"));
    check("referral.qualified delivered", qDelivery[0]?.lastStatus === "delivered");
    check(
      "receiver got qualified w/ matched_by + pending_approval reward",
      received.some(
        (r) =>
          r.type === "referral.qualified" &&
          r.sigValid &&
          r.body.matched_by === "email_reconciliation" &&
          r.body.reward.status === "pending_approval",
      ),
    );

    console.log("\n[7] Abuse controls");
    // disposable email
    const disp = await fetch(`${base}/invite/${CODE}`, {
      method: "POST",
      body: new URLSearchParams({ email: "x@mailinator.com", consent: "yes" }),
      redirect: "manual",
      headers: { "content-type": "application/x-www-form-urlencoded" },
    });
    check("disposable email rejected (400)", disp.status === 400);
    check("disposable message shown", (await disp.text()).includes("disposable"));

    // honeypot filled -> silent redirect, no lead
    const hp = await fetch(`${base}/invite/${CODE}`, {
      method: "POST",
      body: new URLSearchParams({
        email: "bot@example.com",
        consent: "yes",
        company: "AcmeBot",
      }),
      redirect: "manual",
      headers: { "content-type": "application/x-www-form-urlencoded" },
    });
    check("honeypot -> 303", hp.status === 303);
    check("honeypot -> no token", !(hp.headers.get("location") || "").includes("lt="));
    const botLeads = await db
      .select()
      .from(referralLead)
      .where(eq(referralLead.email, "bot@example.com"));
    check("honeypot -> no lead persisted", botLeads.length === 0);

    // self-referral (referrer's own email)
    const [ref] = await db
      .select()
      .from(participant)
      .where(eq(participant.id, "prt_na69t6s091jfb1dpqy1c48rv"));
    const self = await fetch(`${base}/invite/${CODE}`, {
      method: "POST",
      body: new URLSearchParams({ email: ref!.email!, consent: "yes" }),
      redirect: "manual",
      headers: { "content-type": "application/x-www-form-urlencoded" },
    });
    check("self-referral rejected (400)", self.status === 400);

    // missing consent
    const noConsent = await fetch(`${base}/invite/${CODE}`, {
      method: "POST",
      body: new URLSearchParams({ email: "someone@example.com" }),
      redirect: "manual",
      headers: { "content-type": "application/x-www-form-urlencoded" },
    });
    check("missing consent rejected (400)", noConsent.status === 400);

    // unknown code
    const unknown = await fetch(`${base}/invite/zzzzzzz`);
    check("unknown code -> 404", unknown.status === 404);
  } finally {
    await app.close();
    receiver.close();
  }

  console.log(`\n${failures === 0 ? "ALL PASSED" : failures + " FAILED"}`);
  await db.$client.end?.();
  process.exit(failures === 0 ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
