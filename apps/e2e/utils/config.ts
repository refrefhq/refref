export interface TestConfig {
  env: "dev" | "staging" | "prod";
  prefix: string;
  cleanupOnFailure: boolean;
  videoOnFailure: boolean;
  dryRun: boolean;
  productionSafeMode: boolean;

  urls: {
    webapp: string;
    api: string;
    refer: string;
    acme: string;
    assets: string;
  };

  database: {
    url: string;
  };

  testUser: {
    email: string;
    password: string;
    organizationName: string;
    productName: string;
    programName: string;
  };

  participants: {
    referrer: {
      name: string;
      email: string;
    };
    referee: {
      name: string;
      email: string;
    };
  };
}

export function getTestConfig(): TestConfig {
  const env = (process.env.TEST_ENV || "dev") as TestConfig["env"];

  return {
    env,
    prefix: process.env.TEST_PREFIX || "e2e_test_",
    cleanupOnFailure: process.env.CLEANUP_ON_FAILURE === "true",
    videoOnFailure: process.env.VIDEO_ON_FAILURE === "true",
    dryRun: process.env.DRY_RUN === "true",
    productionSafeMode: process.env.PRODUCTION_SAFE_MODE === "true",

    urls: {
      webapp: process.env.WEBAPP_URL || "http://localhost:3000",
      api: process.env.API_URL || "http://localhost:3001",
      refer: process.env.REFER_URL || "http://localhost:3002",
      acme: process.env.ACME_URL || "http://localhost:3003",
      assets: process.env.ASSETS_URL || "http://localhost:8787",
    },

    database: {
      url:
        process.env.DATABASE_URL ||
        "postgresql://postgres:postgres@localhost:5432/refref",
    },

    testUser: {
      email: process.env.TEST_USER_EMAIL || "e2e_test_admin@refref.com",
      password: process.env.TEST_USER_PASSWORD || "TestPassword123!",
      organizationName:
        process.env.TEST_ORGANIZATION_NAME || "E2E Test Organization",
      productName: process.env.TEST_PRODUCT_NAME || "E2E Test Product",
      programName: process.env.TEST_PROGRAM_NAME || "E2E Test Program",
    },

    participants: {
      referrer: {
        name: process.env.REFERRER_NAME || "John Doe",
        email: process.env.REFERRER_EMAIL || "john.doe@example.com",
      },
      referee: {
        name: process.env.REFEREE_NAME || "Jane Smith",
        email: process.env.REFEREE_EMAIL || "jane.smith@example.com",
      },
    },
  };
}

export function isProductionSafe(testName: string): boolean {
  // Only tests with @safe tag can run in production
  return testName.includes("@safe");
}
