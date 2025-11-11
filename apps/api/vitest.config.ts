import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    testTimeout: 30000,
    hookTimeout: 30000,
    setupFiles: ["./test/setup.ts"],
    env: {
      NODE_ENV: "test",
      // Mock database is used via Vitest mocks, but we need a dummy URL
      // to satisfy the plugin's validation
      DATABASE_URL: "postgresql://mock:mock@localhost:5432/mock",
    },
  },
});
