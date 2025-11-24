/**
 * Migration script to convert API keys from product-level to organization-level
 *
 * This script:
 * 1. Deletes all existing API keys (as per user requirement - no backward compatibility needed)
 * 2. Deletes all product-level service accounts
 * 3. Creates organization-level service accounts for existing organizations
 */

import { createDb } from "../src/index";
import { eq, like, and } from "drizzle-orm";
import { apikey, user, org, orgUser } from "../src/schema";
import { ensureServiceAccountForOrganization } from "../src/lib/organization-service-account";

async function main() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.error("DATABASE_URL environment variable is not set");
    process.exit(1);
  }

  const db = createDb(databaseUrl);
  console.log("Connected to database");

  try {
    console.log("Starting migration to organization-level API keys...");

    // Step 1: Delete all existing API keys
    console.log("\n1. Deleting all existing API keys...");
    const deletedKeys = await db.delete(apikey).returning({ id: apikey.id });
    console.log(`   Deleted ${deletedKeys.length} API keys`);

    // Step 2: Delete all product-level service accounts
    console.log("\n2. Deleting product-level service accounts...");
    const serviceAccounts = await db
      .select({ id: user.id, email: user.email })
      .from(user)
      .where(
        and(
          eq(user.role, "service"),
          like(user.email, "service-account_%@refref.local"),
        ),
      );

    // Filter to only delete product-level service accounts (not org-level ones)
    // Product IDs are typically CUIDs which are 24-25 chars, org IDs might differ
    const productServiceAccounts = serviceAccounts.filter((account) => {
      const match = account.email.match(/service-account_(.+)@refref\.local/);
      if (match) {
        const id = match[1];
        // Check if this looks like a product ID (CUID) vs an org ID
        // This is a heuristic - adjust based on your actual ID format
        return id.length >= 20; // CUIDs are typically longer
      }
      return false;
    });

    for (const account of productServiceAccounts) {
      await db.delete(user).where(eq(user.id, account.id));
      console.log(`   Deleted service account: ${account.email}`);
    }
    console.log(
      `   Total deleted: ${productServiceAccounts.length} service accounts`,
    );

    // Step 3: Create organization-level service accounts for all existing organizations
    console.log("\n3. Creating organization-level service accounts...");
    const organizations = await db.select().from(org);

    for (const organization of organizations) {
      try {
        const serviceAccountId = await ensureServiceAccountForOrganization(
          db,
          organization.id,
        );
        console.log(
          `   Created service account for org: ${organization.name} (${organization.id})`,
        );
      } catch (error) {
        console.error(
          `   Failed to create service account for org ${organization.name}:`,
          error,
        );
      }
    }
    console.log(
      `   Created service accounts for ${organizations.length} organizations`,
    );

    console.log("\n✅ Migration completed successfully!");
    console.log("\nNext steps:");
    console.log(
      "1. Update your application code to use organization-level API keys",
    );
    console.log("2. Test the new API key creation and authentication flow");
    console.log(
      "3. Users will need to create new API keys at the organization level",
    );
  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  } finally {
    // Close database connection
    process.exit(0);
  }
}

// Run the migration
main().catch((error) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
