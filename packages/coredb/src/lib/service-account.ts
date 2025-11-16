import { eq, and } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { user, productUser, apikey, product } from "../schema";
import { createId } from "@paralleldrive/cuid2";

/**
 * Service account utilities for managing product-scoped API keys
 */

export interface ServiceAccount {
  id: string;
  email: string;
  name: string;
  role: string;
}

export interface ApiKeyWithMetadata {
  id: string;
  name: string | null;
  key: string; // Redacted format: "prefix_****last4"
  start: string | null;
  expiresAt: Date | null;
  createdAt: Date;
  enabled: boolean | null;
  productId: string;
}

/**
 * Find service account for a given product
 */
async function findServiceAccountForProduct(
  db: PostgresJsDatabase<any>,
  productId: string,
): Promise<ServiceAccount | null> {
  const result = await db
    .select({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    })
    .from(productUser)
    .innerJoin(user, eq(productUser.userId, user.id))
    .where(and(eq(productUser.productId, productId), eq(user.role, "service")))
    .limit(1);

  return result[0] ?? null;
}

/**
 * Create service account for a product
 * Idempotent with retry logic for race conditions
 */
async function createServiceAccount(
  db: PostgresJsDatabase<any>,
  productId: string,
  maxRetries = 3,
): Promise<ServiceAccount> {
  const serviceAccountEmail = `service-account_${productId}@refref.local`;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // First check if it already exists
      const existing = await findServiceAccountForProduct(db, productId);
      if (existing) {
        return existing;
      }

      // Get product details for the service account name
      const productDetails = await db
        .select({ name: product.name })
        .from(product)
        .where(eq(product.id, productId))
        .limit(1);

      const productName = productDetails[0]?.name ?? "Unknown Product";

      // Create the service account user
      const serviceAccountId = createId();

      await db.transaction(async (tx) => {
        // Insert user with role "service"
        await tx.insert(user).values({
          id: serviceAccountId,
          email: serviceAccountEmail,
          name: `Service Account - ${productName}`,
          emailVerified: true,
          role: "service",
        });

        // Add to product with "member" role
        await tx.insert(productUser).values({
          productId,
          userId: serviceAccountId,
          role: "member",
        });
      });

      // Fetch and return the created account
      const created = await findServiceAccountForProduct(db, productId);
      if (!created) {
        throw new Error("Failed to create service account");
      }

      return created;
    } catch (error: any) {
      // Check if it's a duplicate error
      if (
        error?.message?.includes("duplicate") ||
        error?.code === "23505" // PostgreSQL unique violation
      ) {
        // Another request created it, try to fetch
        const existing = await findServiceAccountForProduct(db, productId);
        if (existing) {
          return existing;
        }
      }

      // If last attempt, throw
      if (attempt === maxRetries - 1) {
        throw error;
      }

      // Wait with exponential backoff before retry
      await new Promise((resolve) =>
        setTimeout(resolve, Math.pow(2, attempt) * 100),
      );
    }
  }

  throw new Error("Failed to create service account after retries");
}

/**
 * Ensure service account exists for a product
 * Creates if missing (idempotent)
 * @returns Service account user ID
 */
export async function ensureServiceAccountForProduct(
  db: PostgresJsDatabase<any>,
  productId: string,
): Promise<string> {
  const serviceAccount = await createServiceAccount(db, productId);
  return serviceAccount.id;
}

/**
 * Get all API keys for a product
 * Redacts the key value to show only prefix and last 4 characters
 */
export async function getApiKeysForProduct(
  db: PostgresJsDatabase<any>,
  productId: string,
): Promise<ApiKeyWithMetadata[]> {
  // Get service account for this product
  const serviceAccount = await findServiceAccountForProduct(db, productId);

  if (!serviceAccount) {
    // No service account = no API keys
    return [];
  }

  // Fetch all API keys for the service account
  const keys = await db
    .select()
    .from(apikey)
    .where(eq(apikey.userId, serviceAccount.id))
    .orderBy(apikey.createdAt);

  // Redact keys and parse metadata
  return keys.map((key) => {
    // Redact the key: show only start (prefix) and last 4 characters
    const redactedKey = key.start
      ? `${key.start}${"*".repeat(20)}${key.key.slice(-4)}`
      : `${"*".repeat(24)}${key.key.slice(-4)}`;

    return {
      id: key.id,
      name: key.name,
      key: redactedKey,
      start: key.start,
      expiresAt: key.expiresAt,
      createdAt: key.createdAt,
      enabled: key.enabled,
      productId,
    };
  });
}

/**
 * Validate if a user has permission to manage API keys for a product
 * Only admin/owner of the product's organization can manage keys
 */
export async function validateApiKeyPermission(
  db: PostgresJsDatabase<any>,
  productId: string,
  userId: string,
): Promise<boolean> {
  // Get the product to find its organization
  const productDetails = await db
    .select({ orgId: product.orgId })
    .from(product)
    .where(eq(product.id, productId))
    .limit(1);

  if (!productDetails[0]?.orgId) {
    return false;
  }

  // Check if user is admin/owner of the organization
  const { orgUser } = await import("../schema");

  const membership = await db
    .select({ role: orgUser.role })
    .from(orgUser)
    .where(
      and(
        eq(orgUser.orgId, productDetails[0].orgId),
        eq(orgUser.userId, userId),
      ),
    )
    .limit(1);

  const userRole = membership[0]?.role;
  return userRole === "admin" || userRole === "owner";
}
