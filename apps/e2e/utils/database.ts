import { getTestConfig } from "./config";
import { createDb } from "@refref/coredb";
import { schema } from "@refref/coredb";
import { eq, like, or } from "drizzle-orm";
import type { DBType } from "@refref/coredb";

export class TestDatabase {
  private config = getTestConfig();
  private db: DBType | null = null;

  /**
   * Get or create database connection
   */
  private getDb(): DBType {
    if (!this.db) {
      this.db = createDb(this.config.database.url);
    }
    return this.db;
  }

  /**
   * Setup test database
   * Database is already set up locally, this just verifies connection
   */
  async setup() {
    console.log("Setting up test database...");
    const db = this.getDb();

    // Verify database connection by running a simple query
    try {
      await db.select().from(schema.user).limit(1);
      console.log("✓ Database connection verified");
    } catch (error) {
      console.error("✗ Database connection failed:", error);
      throw new Error("Database setup failed: Unable to connect to database");
    }
  }

  /**
   * Seed test database with required data
   */
  async seed() {
    console.log("Seeding test database...");
    // Program templates are now defined as constants in code, no database seeding needed
    console.log("✓ Test database ready");
  }

  /**
   * Clean up test data by deleting test user and their orgs (cascade deletes everything)
   * Uses fixed test user email - deleting the user and their orgs cascades to all related data
   */
  async cleanup() {
    console.log("Cleaning up test database...");
    const db = this.getDb();
    const testUserEmail = this.config.testUser.email;

    try {
      // Find test user
      const testUser = await db
        .select()
        .from(schema.user)
        .where(eq(schema.user.email, testUserEmail))
        .limit(1);

      if (testUser.length === 0) {
        console.log("  - No test user found, nothing to clean up");
        console.log("✓ Database cleanup completed");
        return;
      }

      const userId = testUser[0].id;

      // Find all orgs the test user is part of
      const userOrgs = await db
        .select()
        .from(schema.orgUser)
        .where(eq(schema.orgUser.userId, userId));

      // Delete rewards first to avoid foreign key constraints
      for (const orgUser of userOrgs) {
        // Get all products for this org
        const products = await db
          .select()
          .from(schema.product)
          .where(eq(schema.product.orgId, orgUser.orgId));

        for (const product of products) {
          // Get all programs for this product
          const programs = await db
            .select()
            .from(schema.program)
            .where(eq(schema.program.productId, product.id));

          for (const program of programs) {
            // Delete all rewards for this program
            await db
              .delete(schema.reward)
              .where(eq(schema.reward.programId, program.id));
          }
        }
      }
      console.log(`  - Deleted rewards for ${userOrgs.length} org(s)`);

      // Now delete each org (cascade deletes products, programs, participants, etc.)
      for (const orgUser of userOrgs) {
        await db.delete(schema.org).where(eq(schema.org.id, orgUser.orgId));
      }
      console.log(`  - Deleted ${userOrgs.length} org(s) with cascade`);

      // Delete test user's sessions
      const deletedSessions = await db
        .delete(schema.session)
        .where(eq(schema.session.userId, userId));
      console.log(
        `  - Deleted user sessions: ${deletedSessions.rowCount ?? 0}`,
      );

      // Delete test user's accounts (OAuth, password, etc.)
      const deletedAccounts = await db
        .delete(schema.account)
        .where(eq(schema.account.userId, userId));
      console.log(
        `  - Deleted user accounts: ${deletedAccounts.rowCount ?? 0}`,
      );

      // Delete test user
      const deletedUsers = await db
        .delete(schema.user)
        .where(eq(schema.user.id, userId));
      console.log(`  - Deleted user: ${deletedUsers.rowCount ?? 0}`);

      console.log("✓ Database cleanup completed");
    } catch (error) {
      console.error("✗ Database cleanup failed:", error);
      throw error;
    }
  }

  /**
   * Clean up test data with optional failure handling
   */
  async cleanupTestData(onFailure: boolean = false) {
    const shouldCleanup = onFailure ? this.config.cleanupOnFailure : true;

    if (shouldCleanup) {
      await this.cleanup();
    } else {
      console.log("Skipping cleanup (CLEANUP_ON_FAILURE=false)");
    }
  }

  /**
   * Get test user from database
   */
  async getTestUser() {
    const db = this.getDb();
    const users = await db
      .select()
      .from(schema.user)
      .where(eq(schema.user.email, this.config.testUser.email))
      .limit(1);

    return users[0] || null;
  }

  /**
   * Create test user if it doesn't exist
   * This should be done via Better Auth, but this is a helper for verification
   */
  async ensureTestUserExists(): Promise<boolean> {
    const user = await this.getTestUser();
    if (user) {
      console.log("✓ Test user already exists");
      return true;
    }

    console.log(
      "⚠ Test user does not exist. It should be created via Better Auth signup flow.",
    );
    return false;
  }
}
