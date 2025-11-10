import { buildApp } from "./app.js";

const start = async () => {
  try {
    const app = await buildApp();

    const port = Number(process.env.PORT) || 3001;
    const host = process.env.HOST || "0.0.0.0";

    await app.listen({ port, host });

    app.log.info(`Server listening on ${host}:${port}`);

    // Graceful shutdown handlers
    const signals = ["SIGINT", "SIGTERM"] as const;
    for (const signal of signals) {
      process.on(signal, async () => {
        app.log.info(`Received ${signal}, closing server gracefully...`);
        await app.close();
        process.exit(0);
      });
    }
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
