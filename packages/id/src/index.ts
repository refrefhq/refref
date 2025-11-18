import { createId as createCuid } from "@paralleldrive/cuid2";

/**
 * Entity type prefixes for RefRef domain models
 */
const ENTITY_PREFIXES = {
  user: "usr",
  org: "org",
  orgUser: "ou",
  session: "ses",
  account: "acc",
  verification: "ver",
  product: "prd",
  productUser: "pu",
  invitation: "inv",
  apikey: "key",
  programTemplate: "pgt",
  program: "prg",
  programUser: "pru",
  eventDefinition: "evd",
  participant: "prt",
  rewardRule: "rwr",
  reward: "rwd",
  productSecrets: "psec",
  refcode: "rc",
  referral: "ref",
  event: "evt",
} as const;

/**
 * Valid entity types for ID generation
 */
export type EntityType = keyof typeof ENTITY_PREFIXES;

/**
 * Custom error thrown when an invalid entity type is provided
 */
export class InvalidEntityError extends Error {
  constructor(entityType: string) {
    super(
      `Invalid entity type: ${entityType}. Valid types are: ${Object.keys(ENTITY_PREFIXES).join(", ")}`,
    );
    this.name = "InvalidEntityError";
  }
}

/**
 * Creates a prefixed ID for a given entity type
 *
 * @param entityType - The type of entity to create an ID for
 * @returns A prefixed ID in the format: prefix_cuid2
 * @throws InvalidEntityError if the entity type is not valid
 *
 * @example
 * createId('user') // Returns: usr_cl9x8k2n000000d0e8y8z8b0w
 * createId('product') // Returns: prj_cm1a9b3c000000e0f9z0a1b2c
 */
export function createId(entityType: EntityType): string {
  const prefix = ENTITY_PREFIXES[entityType];

  if (!prefix) {
    throw new InvalidEntityError(entityType);
  }

  return `${prefix}_${createCuid()}`;
}

/**
 * Type guard to check if a string is a valid entity type
 *
 * @param entityType - The string to check
 * @returns True if the entity type is valid
 *
 * @example
 * isValidEntityType('user') // Returns: true
 * isValidEntityType('invalid') // Returns: false
 */
export function isValidEntityType(
  entityType: string,
): entityType is EntityType {
  return entityType in ENTITY_PREFIXES;
}

/**
 * Returns an array of all valid entity types
 *
 * @returns Array of valid entity types
 *
 * @example
 * getValidEntityTypes() // Returns: ['user', 'product', 'program', ...]
 */
export function getValidEntityTypes(): EntityType[] {
  return Object.keys(ENTITY_PREFIXES) as EntityType[];
}
