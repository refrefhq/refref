import { createDb, schema } from "./index.js";
import type { ProgramTemplateConfigType } from "@refref/types";

// Get database URL from environment
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const db = createDb(DATABASE_URL);

// Fixed template ID from migration
export const TEMPLATE_IDS = {
  STANDARD: "ptmpl_crvqdeugnu5c",
} as const;

// Seed data matching the migration
export const SEED_DATA = {
  PROGRAM_TEMPLATES: [
    {
      id: TEMPLATE_IDS.STANDARD,
      templateName: "Standard Referral Program",
      description: "A simple referral program with customizable rewards",
      config: {
        schemaVersion: 1,
        steps: [
          {
            key: "brand",
            title: "Brand",
            description: "Set your brand color",
          },
          {
            key: "reward",
            title: "Rewards",
            description: "Configure reward structure",
          },
        ],
        meta: {},
      } satisfies ProgramTemplateConfigType,
    },
  ],
} as const;

/**
 * Seeds program templates into the database
 * Uses onConflictDoNothing() so running multiple times is safe
 */
const seedData = async () => {
  console.log("🌱 Seeding database...");

  try {
    await db.transaction(async (tx) => {
      console.log("📦 Creating program templates...");
      await tx
        .insert(schema.programTemplate)
        .values([...SEED_DATA.PROGRAM_TEMPLATES])
        .onConflictDoNothing();

      console.log(
        `   ✓ Inserted ${SEED_DATA.PROGRAM_TEMPLATES.length} program template(s)`
      );
    });

    // Verify insertion
    const count = await db.$count(schema.programTemplate);
    console.log(`\n📊 Total program templates in database: ${count}`);
    console.log("✅ Seed completed successfully\n");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
};

/**
 * Deletes all seeded program templates from the database
 */
const deleteSeedData = async () => {
  console.log("🧹 Cleaning seed data...");

  try {
    await db.transaction(async (tx) => {
      console.log("🗑️  Deleting program templates...");
      await tx.delete(schema.programTemplate);
      console.log("   ✓ Deleted all program templates");
    });

    console.log("✅ Delete completed successfully\n");
  } catch (error) {
    console.error("❌ Delete failed:", error);
    throw error;
  }
};

/**
 * Checks database connectivity and health
 */
const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await db.$count(schema.programTemplate);
    console.log("✅ Database connection is healthy\n");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
};

// CLI handler
const command = process.argv[2];

if (command === "seed") {
  checkDatabaseHealth()
    .then((isHealthy) => {
      if (!isHealthy) {
        console.error("❌ Database is not healthy. Aborting seed.");
        process.exit(1);
      }
      return seedData();
    })
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Seed operation failed:", error);
      process.exit(1);
    });
} else if (command === "delete") {
  checkDatabaseHealth()
    .then((isHealthy) => {
      if (!isHealthy) {
        console.error("❌ Database is not healthy. Aborting delete.");
        process.exit(1);
      }
      return deleteSeedData();
    })
    .then(() => process.exit(0))
    .catch((error) => {
      console.error("❌ Delete operation failed:", error);
      process.exit(1);
    });
} else if (command === "health") {
  checkDatabaseHealth()
    .then((isHealthy) => {
      process.exit(isHealthy ? 0 : 1);
    })
    .catch(() => {
      process.exit(1);
    });
} else {
  console.log(`
Usage: tsx src/seed.ts <command>

Commands:
  seed    - Seed program templates into the database
  delete  - Delete all seeded program templates
  health  - Check database connectivity

Examples:
  pnpm db:seed
  pnpm db:deleteseed
  tsx src/seed.ts health
`);
  process.exit(1);
}

export { seedData, deleteSeedData, checkDatabaseHealth };
