/**
 * Runtime configuration for RefRef integration
 * This allows tests to dynamically configure ACME with RefRef credentials
 */

interface RefRefRuntimeConfig {
  productId: string;
  clientId: string;
  clientSecret: string;
  programId?: string;
  // Service URLs are environment-based and not configurable at runtime
}

// In-memory storage for runtime configuration
let runtimeConfig: RefRefRuntimeConfig | null = null;

/**
 * Set RefRef configuration (called from tests)
 */
export function setRefRefConfig(config: RefRefRuntimeConfig): void {
  runtimeConfig = config;
  console.log("RefRef configuration updated:", {
    productId: config.productId,
    programId: config.programId,
  });
}

/**
 * Get current RefRef configuration (server-side only)
 * Falls back to cookies, then environment variables if not set via setRefRefConfig
 */
export async function getRefRefConfig(): Promise<RefRefRuntimeConfig> {
  // First check in-memory config
  if (runtimeConfig) {
    return runtimeConfig;
  }

  // Try to read from cookies (for persistence across requests)
  // Only import cookies when actually needed (server-side only)
  try {
    const { cookies } = await import("next/headers");
    const cookieStore = await cookies();
    const configCookie = cookieStore.get("refref-config");
    const secretCookie = cookieStore.get("refref-secret");

    if (configCookie && secretCookie) {
      const config = JSON.parse(configCookie.value);
      return {
        ...config,
        clientSecret: secretCookie.value,
      };
    }
  } catch (e) {
    // Cookies might not be available in some contexts
    console.debug("Could not read cookies:", e);
  }

  // Fallback to environment variables for non-test scenarios
  return {
    productId: process.env.NEXT_PUBLIC_REFREF_PRODUCT_ID || "acme-product",
    clientId: process.env.REFREF_CLIENT_ID || "test-client-id",
    clientSecret: process.env.REFREF_CLIENT_SECRET || "test-client-secret",
    programId: process.env.NEXT_PUBLIC_REFREF_PROGRAM_ID || "test-program-id",
  };
}

/**
 * Get current RefRef configuration (sync version for client-side)
 * Only returns in-memory config or environment variables
 */
export function getRefRefConfigSync(): RefRefRuntimeConfig | null {
  // First check in-memory config
  if (runtimeConfig) {
    return runtimeConfig;
  }

  // Fallback to environment variables
  return {
    productId: process.env.NEXT_PUBLIC_REFREF_PRODUCT_ID || "acme-product",
    clientId: process.env.REFREF_CLIENT_ID || "test-client-id",
    clientSecret: process.env.REFREF_CLIENT_SECRET || "test-client-secret",
    programId: process.env.NEXT_PUBLIC_REFREF_PROGRAM_ID || "test-program-id",
  };
}

/**
 * Clear runtime configuration (called from test reset)
 */
export function clearRefRefConfig(): void {
  runtimeConfig = null;
  console.log("RefRef configuration cleared");
}

/**
 * Check if configuration has been set
 */
export function hasRefRefConfig(): boolean {
  return runtimeConfig !== null;
}
