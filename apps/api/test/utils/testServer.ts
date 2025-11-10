import { FastifyInstance } from "fastify";
import { buildApp } from "../../src/app.js";

let testServer: FastifyInstance | null = null;

export async function startTestServer(): Promise<{
  server: FastifyInstance;
  url: string;
}> {
  if (testServer) {
    throw new Error("Test server is already running");
  }

  testServer = await buildApp();

  const port = Math.floor(Math.random() * 10000) + 30000; // Random port between 30000-40000
  await testServer.listen({ port, host: "127.0.0.1" });

  const url = `http://127.0.0.1:${port}`;

  return { server: testServer, url };
}

export async function stopTestServer(): Promise<void> {
  if (testServer) {
    await testServer.close();
    testServer = null;
  }
}
