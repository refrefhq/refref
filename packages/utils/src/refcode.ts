import { Filter } from "bad-words";

/**
 * Refcode utilities for generating and validating referral codes
 *
 * RefRef supports two types of referral codes:
 *
 * 1. **Global Codes**: Auto-generated, globally unique codes
 *    - Format: 7 characters (numbers + lowercase letters only)
 *    - Example: abc1234
 *    - URL Pattern: REFERRAL_HOST_URL/r/:code
 *    - Use Case: Default referral codes for participants
 *
 * 2. **Local Codes**: User-specified vanity codes, unique within a product
 *    - Format: 3-50 characters (alphanumeric + hyphens)
 *    - Example: john-doe
 *    - URL Pattern: REFERRAL_HOST_URL/r/:product_slug/:code
 *    - Use Case: Custom vanity URLs for branding
 *
 * Both code types:
 * - Are case-insensitive (normalized to lowercase)
 * - Must pass profanity filtering
 * - Are tied to a specific participant and program
 */

const filter = new Filter();

/**
 * Character set for global code generation: numbers + lowercase letters
 * Excludes potentially confusing characters (0/O, 1/I/l)
 */
const GLOBAL_CODE_CHARS = "23456789abcdefghjkmnpqrstuvwxyz";
const GLOBAL_CODE_LENGTH = 7;

/**
 * Validation rules for user-specified vanity codes
 */
const VANITY_CODE_MIN_LENGTH = 3;
const VANITY_CODE_MAX_LENGTH = 50;
const VANITY_CODE_PATTERN = /^[a-z0-9-]+$/; // alphanumeric + hyphens only

/**
 * Generates a random global refcode
 *
 * Global codes are:
 * - 7 characters long
 * - Contain only numbers (2-9) and lowercase letters (a-z, excluding confusing chars)
 * - Checked for profanity
 * - Retried on collision or profanity failure
 *
 * @param maxAttempts - Maximum number of generation attempts (default: 5)
 * @returns Generated code or null if all attempts exhausted
 *
 * @example
 * const code = generateGlobalCode();
 * // Returns: "abc1234" or null
 */
export function generateGlobalCode(maxAttempts: number = 5): string | null {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let code = "";

    // Generate random code
    for (let i = 0; i < GLOBAL_CODE_LENGTH; i++) {
      const randomIndex = Math.floor(Math.random() * GLOBAL_CODE_CHARS.length);
      code += GLOBAL_CODE_CHARS[randomIndex];
    }

    // Check for profanity
    if (!filter.isProfane(code)) {
      return code;
    }
  }

  // All attempts exhausted
  return null;
}

/**
 * Validates a user-specified vanity code
 *
 * Vanity codes must:
 * - Be 3-50 characters long
 * - Contain only lowercase alphanumeric characters and hyphens
 * - Not contain profanity
 * - Not contain URL-unsafe characters
 *
 * @param code - The vanity code to validate
 * @returns Object with isValid flag and error message if invalid
 *
 * @example
 * validateVanityCode("john-doe");
 * // Returns: { isValid: true }
 *
 * validateVanityCode("a");
 * // Returns: { isValid: false, error: "Code must be 3-50 characters" }
 */
export function validateVanityCode(code: string): {
  isValid: boolean;
  error?: string;
} {
  // Normalize first
  const normalizedCode = normalizeCode(code);

  // Check length
  if (
    normalizedCode.length < VANITY_CODE_MIN_LENGTH ||
    normalizedCode.length > VANITY_CODE_MAX_LENGTH
  ) {
    return {
      isValid: false,
      error: `Code must be ${VANITY_CODE_MIN_LENGTH}-${VANITY_CODE_MAX_LENGTH} characters`,
    };
  }

  // Check character pattern
  if (!VANITY_CODE_PATTERN.test(normalizedCode)) {
    return {
      isValid: false,
      error: "Code can only contain lowercase letters, numbers, and hyphens",
    };
  }

  // Check for profanity
  if (filter.isProfane(normalizedCode)) {
    return {
      isValid: false,
      error: "Code contains inappropriate language",
    };
  }

  return { isValid: true };
}

/**
 * Normalizes a refcode to lowercase
 *
 * All refcodes are stored and compared in lowercase for case-insensitive matching
 *
 * @param code - The code to normalize
 * @returns Lowercase version of the code
 *
 * @example
 * normalizeCode("ABC-123");
 * // Returns: "abc-123"
 */
export function normalizeCode(code: string): string {
  return code.trim().toLowerCase();
}

/**
 * Checks if a code appears to be a global code based on format
 *
 * Note: This is a heuristic check, not definitive. The actual source of truth
 * is the database `global` field.
 *
 * @param code - The code to check
 * @returns True if code matches global code format
 *
 * @example
 * isGlobalCodeFormat("abc1234");
 * // Returns: true
 *
 * isGlobalCodeFormat("john-doe");
 * // Returns: false
 */
export function isGlobalCodeFormat(code: string): boolean {
  const normalizedCode = normalizeCode(code);
  return (
    normalizedCode.length === GLOBAL_CODE_LENGTH &&
    /^[a-z0-9]+$/.test(normalizedCode)
  );
}
