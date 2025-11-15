import { defineConfig, devices } from '@playwright/test';
import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load test environment variables
config({ path: path.resolve(__dirname, '.env.test') });

const TEST_ENV = process.env.TEST_ENV || 'dev';
const BASE_URL = process.env.WEBAPP_URL || 'http://localhost:3000';
const SKIP_WEBSERVER_START = process.env.SKIP_WEBSERVER_START === 'true';

export default defineConfig({
  testDir: './sanity/tests',
  fullyParallel: false, // Run tests serially for initial implementation
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Single worker for database transaction safety
  reporter: [
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: process.env.VIDEO_ON_FAILURE === 'true' ? 'on-first-retry' : 'off',
    actionTimeout: 15000,
    navigationTimeout: 60000, // Increased to 60s due to slow Next.js cold starts
  },

  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      dependencies: TEST_ENV === 'dev' ? ['setup'] : [],
    },
  ],

  webServer: (TEST_ENV === 'dev' && !SKIP_WEBSERVER_START) ? [
    {
      command: 'pnpm -F @refref/webapp dev',
      port: 3000,
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'pnpm -F @refref/api dev',
      port: 3001,
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'pnpm -F @refref/refer dev',
      port: 3002,
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'pnpm -F @refref/assets dev',
      port: 8787,
      timeout: 120 * 1000,
      reuseExistingServer: !process.env.CI,
    },
  ] : undefined,
});
