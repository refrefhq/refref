import { getTestConfig } from "../../utils/config";

const config = getTestConfig();

/**
 * Test data templates for E2E tests
 * All data is prefixed with TEST_PREFIX to enable cleanup
 */

export const testData = {
  /**
   * Test user credentials
   */
  user: {
    email: config.testUser.email,
    password: config.testUser.password,
  },

  /**
   * Organization data
   */
  organization: {
    name: config.testUser.organizationName,
    slug: `${config.prefix}${config.testUser.organizationName.toLowerCase().replace(/\s+/g, "-")}`,
  },

  /**
   * Product data
   */
  product: {
    name: config.testUser.productName,
    slug: `${config.prefix}${config.testUser.productName.toLowerCase().replace(/\s+/g, "-")}`,
  },

  /**
   * Program data
   */
  program: {
    name: config.testUser.programName,
    slug: `${config.prefix}${config.testUser.programName.toLowerCase().replace(/\s+/g, "-")}`,
  },

  /**
   * Referrer (John) data
   */
  referrer: {
    name: config.participants.referrer.name,
    email: config.participants.referrer.email,
    externalId: `${config.prefix}john_external_id`,
  },

  /**
   * Referee (Jane) data
   */
  referee: {
    name: config.participants.referee.name,
    email: config.participants.referee.email,
    externalId: `${config.prefix}jane_external_id`,
  },

  /**
   * Event data
   */
  events: {
    signup: {
      eventName: "user_signup",
      value: 0,
    },
    purchase: {
      eventName: "purchase",
      value: 100,
    },
  },
};

/**
 * Helper to generate unique IDs with test prefix
 */
export function generateTestId(base: string): string {
  return `${config.prefix}${base}_${Date.now()}`;
}

/**
 * Helper to check if a string is a test entity (has test prefix)
 */
export function isTestEntity(value: string): boolean {
  return value.startsWith(config.prefix);
}
