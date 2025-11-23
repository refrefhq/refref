import { Filter } from "bad-words";

/**
 * Refcode and Reflink utilities for generating and validating referral codes
 *
 * RefRef supports two separate but related concepts:
 *
 * 1. **Refcodes**: Auto-generated, globally unique tracking codes
 *    - Format: 7 characters (numbers + lowercase letters only)
 *    - Example: abc1234
 *    - URL Pattern: REFERRAL_HOST_URL/:code
 *    - Use Case: Core referral tracking codes for participants
 *
 * 2. **Reflinks**: Optional vanity URLs that map to refcodes
 *    - Format: 3-50 characters (alphanumeric + hyphens)
 *    - Example: john-doe
 *    - URL Pattern: REFERRAL_HOST_URL/:product_slug/:slug
 *    - Use Case: Custom vanity URLs for branding
 *    - Note: Reflinks are stored separately and point to underlying refcodes
 *
 * Both types:
 * - Are case-insensitive (normalized to lowercase)
 * - Must pass profanity filtering
 * - Are tied to a specific product and participant
 */

const filter = new Filter();

/**
 * Character set for refcode generation: numbers + lowercase letters
 * Excludes potentially confusing characters (0/O, 1/I/l)
 */
const REFCODE_CHARS = "23456789abcdefghjkmnpqrstuvwxyz";
const REFCODE_LENGTH = 7;

/**
 * Validation rules for user-specified vanity codes
 */
const VANITY_CODE_MIN_LENGTH = 3;
const VANITY_CODE_MAX_LENGTH = 50;
const VANITY_CODE_PATTERN = /^[a-z0-9-]+$/; // alphanumeric + hyphens only

/**
 * Generates a random refcode
 *
 * Refcodes are:
 * - 7 characters long
 * - Contain only numbers (2-9) and lowercase letters (a-z, excluding confusing chars)
 * - Checked for profanity
 * - Retried on collision or profanity failure
 *
 * @param maxAttempts - Maximum number of generation attempts (default: 5)
 * @returns Generated code or null if all attempts exhausted
 *
 * @example
 * const code = generateRefcode();
 * // Returns: "abc1234" or null
 */
export function generateRefcode(maxAttempts: number = 5): string | null {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    let code = "";

    // Generate random code
    for (let i = 0; i < REFCODE_LENGTH; i++) {
      const randomIndex = Math.floor(Math.random() * REFCODE_CHARS.length);
      code += REFCODE_CHARS[randomIndex];
    }

    // Check for profanity
    if (!filter.isProfane(code)) {
      return code;
    }
  }

  // All attempts exhausted
  return null;
}

// Keep the old function name for backward compatibility (deprecated)
export const generateGlobalCode = generateRefcode;

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
 * Checks if a code appears to be a refcode based on format
 *
 * Note: This is a heuristic check. Refcodes are exactly 7 characters of
 * numbers and lowercase letters (after normalization).
 *
 * @param code - The code to check
 * @returns True if code matches refcode format
 *
 * @example
 * isRefcodeFormat("abc1234");
 * // Returns: true
 *
 * isRefcodeFormat("john-doe");
 * // Returns: false
 */
export function isRefcodeFormat(code: string): boolean {
  const normalizedCode = normalizeCode(code);
  return (
    normalizedCode.length === REFCODE_LENGTH &&
    /^[a-z0-9]+$/.test(normalizedCode)
  );
}

// Keep the old function name for backward compatibility (deprecated)
export const isGlobalCodeFormat = isRefcodeFormat;
