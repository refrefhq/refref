import "dotenv/config";
import { createDb } from "@refref/coredb";
import { runWebhookWorker } from "@refref/webhooks";

/**
 * Standalone outbound webhook worker. Run this as its own process/container when
 * you don't want the dispatcher sharing the API's event loop:
 *
 *   node dist/worker.js
 */
const start = () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error("DATABASE_URL environment variable is required");
    process.exit(1);
  }

  const db = createDb(databaseUrl);
  const intervalMs = Number(process.env.WEBHOOK_WORKER_INTERVAL_MS) || 5000;

  const stop = runWebhookWorker(db, intervalMs, {
    logger: {
      info: (o, m) => console.log(m ?? "", o),
      error: (o, m) => console.error(m ?? "", o),
    },
  });

  console.log(`Webhook worker running (interval ${intervalMs}ms)`);

  const signals = ["SIGINT", "SIGTERM"] as const;
  for (const signal of signals) {
    process.on(signal, () => {
      console.log(`Received ${signal}, stopping worker...`);
      stop();
      process.exit(0);
    });
  }
};

start();
