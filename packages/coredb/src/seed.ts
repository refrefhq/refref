import { createDb, schema } from "./index.js";
import type { ProgramTemplateConfigType } from "@refref/types";

// Get database URL from environment
const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

const db = createDb(DATABASE_URL);

// Fixed IDs for consistent, reproducible seed data
// Generated using @refref/id for all entity-specific prefixes
export const SEED_IDS = {
  // Users (usr_ prefix)
  USER_1: "usr_it6jtxh57r2mv3759be0boge",
  USER_2: "usr_syllkd9watxr9ekcpn00d15w",
  USER_3: "usr_vj6x2i2x1zf9osnkqhm4f3q7",

  // Organizations (org_ prefix)
  ORG_1: "org_r6jb3v9ut0blg2x7tgaz2ku9",
  ORG_2: "org_pbk5c11t42ggnzakb0eeuxy4",
  ORG_3: "org_b4jvy5tar1zjv3lpvtxa1qp4",

  // Organization Users (ou_ prefix)
  ORG_USER_1: "ou_hzcmyecjpmoigx953qpid0vp",
  ORG_USER_2: "ou_q1p5mtbfk988pk666kdzsj89",
  ORG_USER_3: "ou_thdya82iyl3t7njb72wtpobm",

  // Products (prd_ prefix)
  PRODUCT_1: "prd_rfl78apntmdzwuyxykqd7ait", // Fixed ID for main product
  PRODUCT_2: "prd_g83m2tqa1wfbn21zuioyfzjp",

  // Program Templates (pgt_ prefix)
  TEMPLATE_STANDARD: "pgt_yic2ws4jnnoo4dbps3017lda",

  // Programs (prg_ prefix)
  PROGRAM_1: "prg_yjuc7b0lplvfvtl1nmj3jqg1",
  PROGRAM_2: "prg_bi46lm8q7llax4khniewcvlb", // Fixed ID for main program

  // Event Definitions (evd_ prefix)
  EVENT_DEF_SIGNUP: "evd_zmytgr6hy33xdgofvzu94dja",
  EVENT_DEF_PURCHASE: "evd_gm8g1tab63gwy4m9rzzm8z87",

  // Participants (prt_ prefix)
  PARTICIPANT_1: "prt_na69t6s091jfb1dpqy1c48rv",
  PARTICIPANT_2: "prt_zvg6j40z06tlstpdo8h76qqc",

  // Refcodes (rc_ prefix)
  REFCODE_1: "rc_v66igvvf4yqs64peny0q7bdi",
  REFCODE_2: "rc_fbtquvp0gbg8fs3wrir9r79c",

  // Reward Rules (rwr_ prefix)
  REWARD_RULE_1: "rwr_tnx4mylzxecf6awiiql06lf1",
  REWARD_RULE_2: "rwr_nai97gilewykcgn42t4sik70",

  // Product Secrets (sec_ prefix)
  SECRET_1: "sec_eyzb132hgn3nbf9fon8p38xt",
  SECRET_2: "sec_nzj7t83rajafnd5secu2xyxl",

  // Referrals (ref_ prefix)
  REFERRAL_1: "ref_iqs3ezgj0jg76cr0enf87cwz",

  // Events (evt_ prefix)
  EVENT_1: "evt_en4jbqjj1fpc6rphj1juz6zp",

  // Rewards (rwd_ prefix)
  REWARD_1: "rwd_wr9yjll9fh9846p12jnt3rth",
} as const;

// Comprehensive seed data
export const SEED_DATA = {
  // 1. Users
  USERS: [
    {
      id: SEED_IDS.USER_1,
      email: "test1@test.com",
      name: "Test User 1",
      emailVerified: true,
      image: null,
      role: null,
      banned: null,
      banReason: null,
      banExpires: null,
    },
    {
      id: SEED_IDS.USER_2,
      email: "test2@test.com",
      name: "Test User 2",
      emailVerified: true,
      image: null,
      role: null,
      banned: null,
      banReason: null,
      banExpires: null,
    },
    {
      id: SEED_IDS.USER_3,
      email: "test3@test.com",
      name: "Test User 3",
      emailVerified: true,
      image: null,
      role: null,
      banned: null,
      banReason: null,
      banExpires: null,
    },
  ],

  // 2. Organizations
  ORGANIZATIONS: [
    {
      id: SEED_IDS.ORG_1,
      name: "Test Organization 1",
      slug: "org-BJNkmt1D",
      logo: null,
      metadata: null,
    },
    {
      id: SEED_IDS.ORG_2,
      name: "Test Organization 2",
      slug: "org-5CI3GMsb",
      logo: null,
      metadata: null,
    },
    {
      id: SEED_IDS.ORG_3,
      name: "Test Organization 3",
      slug: "org-BFDT7JA0",
      logo: null,
      metadata: null,
    },
  ],

  // 3. Organization Users
  ORG_USERS: [
    {
      id: SEED_IDS.ORG_USER_1,
      orgId: SEED_IDS.ORG_1,
      userId: SEED_IDS.USER_1,
      role: "owner",
    },
    {
      id: SEED_IDS.ORG_USER_2,
      orgId: SEED_IDS.ORG_2,
      userId: SEED_IDS.USER_2,
      role: "owner",
    },
    {
      id: SEED_IDS.ORG_USER_3,
      orgId: SEED_IDS.ORG_3,
      userId: SEED_IDS.USER_3,
      role: "owner",
    },
  ],

  // 4. Products
  PRODUCTS: [
    {
      id: SEED_IDS.PRODUCT_1,
      orgId: SEED_IDS.ORG_1,
      name: "Demo SaaS Product",
      slug: "ftuaf1s",
      logo: null,
      url: "http://localhost:3000/auth/sign-in",
      metadata: null,
      appType: "saas",
      paymentProvider: "stripe",
      onboardingCompleted: true,
      onboardingStep: 4,
    },
    {
      id: SEED_IDS.PRODUCT_2,
      orgId: SEED_IDS.ORG_3,
      name: "Demo E-commerce Product",
      slug: "e7hcfmg",
      logo: null,
      url: "http://example.com",
      metadata: null,
      appType: "saas",
      paymentProvider: "stripe",
      onboardingCompleted: true,
      onboardingStep: 4,
    },
  ],

  // 5. Program Templates
  PROGRAM_TEMPLATES: [
    {
      id: SEED_IDS.TEMPLATE_STANDARD,
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

  // 6. Programs
  PROGRAMS: [
    {
      id: SEED_IDS.PROGRAM_1,
      productId: SEED_IDS.PRODUCT_1,
      programTemplateId: SEED_IDS.TEMPLATE_STANDARD,
      name: "Standard Referral Program",
      status: "pending_setup",
      startDate: null,
      endDate: null,
      config: null,
    },
    {
      id: SEED_IDS.PROGRAM_2,
      productId: SEED_IDS.PRODUCT_1,
      programTemplateId: SEED_IDS.TEMPLATE_STANDARD,
      name: "Standard Referral Program",
      status: "active",
      startDate: null,
      endDate: null,
      config: {
        schemaVersion: 1 as const,
        widgetConfig: {
          icon: "gift" as const,
          title: "Invite your friends",
          logoUrl: "",
          position: "bottom-right" as const,
          subtitle: "Earn $10 per referral • Friends get 20% off",
          textColor: "#1f2937",
          accentColor: "#3b82f6",
          productName: "refref-local",
          triggerText: "Refer & Earn",
          borderRadius: 25,
          modalBgColor: "#ffffff",
          referralLink: "",
          shareMessage:
            "Join refref-local! Get 20% off your first purchase and I'll earn $10",
          buttonBgColor: "#3b82f6",
          buttonTextColor: "#ffffff",
          enabledPlatforms: {
            email: true,
            twitter: true,
            facebook: true,
            linkedin: true,
            telegram: false,
            whatsapp: true,
            instagram: false,
          },
          modalBorderRadius: 12,
        },
        templateConfig: {
          schemaVersion: 1,
          steps: [
            {
              key: "brand" as const,
              title: "Brand",
              description: "Set your brand color",
            },
            {
              key: "reward" as const,
              title: "Rewards",
              description: "Configure reward structure",
            },
          ],
          meta: {},
        },
      },
    },
  ],

  // 7. Event Definitions
  EVENT_DEFINITIONS: [
    {
      id: SEED_IDS.EVENT_DEF_SIGNUP,
      name: "User Signup",
      type: "signup",
      description: "When a new user signs up using a referral link",
      config: { schemaVersion: 1 as const },
    },
    {
      id: SEED_IDS.EVENT_DEF_PURCHASE,
      name: "Purchase",
      type: "purchase",
      description: "When a user makes a purchase",
      config: { schemaVersion: 1 as const },
    },
  ],

  // 8. Participants
  PARTICIPANTS: [
    {
      id: SEED_IDS.PARTICIPANT_1,
      name: null,
      email: "test1@test.com",
      productId: SEED_IDS.PRODUCT_1,
      externalId: SEED_IDS.USER_1,
    },
    {
      id: SEED_IDS.PARTICIPANT_2,
      name: null,
      email: "test3@test.com",
      productId: SEED_IDS.PRODUCT_1,
      externalId: SEED_IDS.USER_3,
    },
  ],

  // 9. Refcodes
  REFCODES: [
    {
      id: SEED_IDS.REFCODE_1,
      code: "rpetnw5",
      participantId: SEED_IDS.PARTICIPANT_1,
      programId: SEED_IDS.PROGRAM_2,
      productId: SEED_IDS.PRODUCT_1,
      global: true,
    },
    {
      id: SEED_IDS.REFCODE_2,
      code: "rmxvvpd",
      participantId: SEED_IDS.PARTICIPANT_2,
      programId: SEED_IDS.PROGRAM_2,
      productId: SEED_IDS.PRODUCT_1,
      global: true,
    },
  ],

  // 10. Reward Rules
  REWARD_RULES: [
    {
      id: SEED_IDS.REWARD_RULE_1,
      programId: SEED_IDS.PROGRAM_2,
      name: "Referrer Cash Reward",
      description:
        "Cash reward for referrers when their referrals make a purchase",
      type: "referrer_purchase_reward",
      priority: 100,
      isActive: true,
      config: {
        schemaVersion: 1 as const,
        participantType: "referrer" as const,
        trigger: { event: "purchase" },
        reward: { type: "cash" as const, unit: "fixed" as const, amount: 10 },
      },
    },
    {
      id: SEED_IDS.REWARD_RULE_2,
      programId: SEED_IDS.PROGRAM_2,
      name: "Referee Discount",
      description: "Discount for new users who sign up using a referral link",
      type: "referee_signup_discount",
      priority: 90,
      isActive: true,
      config: {
        schemaVersion: 1 as const,
        participantType: "referee" as const,
        trigger: { event: "signup" },
        reward: {
          type: "discount" as const,
          unit: "percent" as const,
          amount: 20,
        },
      },
    },
  ],

  // 11. Product Secrets
  PRODUCT_SECRETS: [
    {
      id: SEED_IDS.SECRET_1,
      productId: SEED_IDS.PRODUCT_1,
      clientId: "ms3ln7fktdjqgu03uw46y91h",
      clientSecret:
        "a219bbc40001d76249a1ce8165d5032248f689e9c7fc2eb82553ff2be0374a98",
    },
    {
      id: SEED_IDS.SECRET_2,
      productId: SEED_IDS.PRODUCT_2,
      clientId: "ch1lv23z8h9qwsmjd3mu30a3",
      clientSecret:
        "7f5d0bac13c73d63f7c9ff70250972200323461895ac1c8cae506fc07fc103ff",
    },
  ],

  // 12. Referrals
  REFERRALS: [
    {
      id: SEED_IDS.REFERRAL_1,
      referrerId: SEED_IDS.PARTICIPANT_1,
      externalId: SEED_IDS.USER_3,
      email: "test3@test.com",
      name: null,
    },
  ],

  // 13. Events
  EVENTS: [
    {
      id: SEED_IDS.EVENT_1,
      productId: SEED_IDS.PRODUCT_1,
      programId: SEED_IDS.PROGRAM_2,
      participantId: SEED_IDS.PARTICIPANT_2,
      referralId: SEED_IDS.REFERRAL_1,
      eventDefinitionId: SEED_IDS.EVENT_DEF_SIGNUP,
      status: "processed",
      metadata: {
        schemaVersion: 1 as const,
        source: "auto" as const,
        reason: "Widget initialization with referral code",
      },
    },
  ],

  // 14. Rewards
  REWARDS: [
    {
      id: SEED_IDS.REWARD_1,
      participantId: SEED_IDS.PARTICIPANT_2,
      programId: SEED_IDS.PROGRAM_2,
      rewardRuleId: SEED_IDS.REWARD_RULE_2,
      eventId: SEED_IDS.EVENT_1,
      rewardType: "discount",
      amount: "20.00",
      currency: "USD",
      status: "approved",
      disbursedAt: null,
      metadata: {
        schemaVersion: 1 as const,
        notes: "Generated from User Signup event",
      },
    },
  ],
};

/**
 * Seeds all data into the database
 * Uses onConflictDoNothing() so running multiple times is safe
 */
const seedData = async () => {
  console.log("🌱 Seeding database...");

  try {
    await db.transaction(async (tx) => {
      // 1. Users
      console.log("👥 Creating users...");
      await tx
        .insert(schema.user)
        .values([...SEED_DATA.USERS])
        .onConflictDoNothing();
      console.log(`   ✓ Inserted ${SEED_DATA.USERS.length} user(s)`);

      // 2. Organizations
      console.log("🏢 Creating organizations...");
      await tx
        .insert(schema.org)
        .values([...SEED_DATA.ORGANIZATIONS])
        .onConflictDoNothing();
      console.log(
        `   ✓ Inserted ${SEED_DATA.ORGANIZATIONS.length} organization(s)`,
      );

      // 3. Organization Users
      console.log("👤 Creating organization memberships...");
      await tx
        .insert(schema.orgUser)
        .values([...SEED_DATA.ORG_USERS])
        .onConflictDoNothing();
      console.log(
        `   ✓ Inserted ${SEED_DATA.ORG_USERS.length} organization membership(s)`,
      );

      // 4. Products
      console.log("📦 Creating products...");
      await tx
        .insert(schema.product)
        .values([...SEED_DATA.PRODUCTS])
        .onConflictDoNothing();
      console.log(`   ✓ Inserted ${SEED_DATA.PRODUCTS.length} product(s)`);

      // 5. Program Templates
      console.log("📋 Creating program templates...");
      await tx
        .insert(schema.programTemplate)
        .values([...SEED_DATA.PROGRAM_TEMPLATES])
        .onConflictDoNothing();
      console.log(
        `   ✓ Inserted ${SEED_DATA.PROGRAM_TEMPLATES.length} program template(s)`,
      );

      // 6. Programs
      console.log("🎯 Creating programs...");
      await tx
        .insert(schema.program)
        .values([...SEED_DATA.PROGRAMS])
        .onConflictDoNothing();
      console.log(`   ✓ Inserted ${SEED_DATA.PROGRAMS.length} program(s)`);

      // 7. Event Definitions
      console.log("📊 Creating event definitions...");
      await tx
        .insert(schema.eventDefinition)
        .values([...SEED_DATA.EVENT_DEFINITIONS])
        .onConflictDoNothing();
      console.log(
        `   ✓ Inserted ${SEED_DATA.EVENT_DEFINITIONS.length} event definition(s)`,
      );

      // 8. Participants
      console.log("🙋 Creating participants...");
      await tx
        .insert(schema.participant)
        .values([...SEED_DATA.PARTICIPANTS])
        .onConflictDoNothing();
      console.log(
        `   ✓ Inserted ${SEED_DATA.PARTICIPANTS.length} participant(s)`,
      );

      // 9. Refcodes
      console.log("🔗 Creating referral codes...");
      await tx
        .insert(schema.refcode)
        .values([...SEED_DATA.REFCODES])
        .onConflictDoNothing();
      console.log(
        `   ✓ Inserted ${SEED_DATA.REFCODES.length} referral code(s)`,
      );

      // 10. Reward Rules
      console.log("💰 Creating reward rules...");
      await tx
        .insert(schema.rewardRule)
        .values([...SEED_DATA.REWARD_RULES])
        .onConflictDoNothing();
      console.log(
        `   ✓ Inserted ${SEED_DATA.REWARD_RULES.length} reward rule(s)`,
      );

      // 11. Product Secrets
      console.log("🔐 Creating product secrets...");
      await tx
        .insert(schema.productSecrets)
        .values([...SEED_DATA.PRODUCT_SECRETS])
        .onConflictDoNothing();
      console.log(
        `   ✓ Inserted ${SEED_DATA.PRODUCT_SECRETS.length} product secret(s)`,
      );

      // 12. Referrals
      console.log("👫 Creating referrals...");
      await tx
        .insert(schema.referral)
        .values([...SEED_DATA.REFERRALS])
        .onConflictDoNothing();
      console.log(`   ✓ Inserted ${SEED_DATA.REFERRALS.length} referral(s)`);

      // 13. Events
      console.log("📝 Creating events...");
      await tx
        .insert(schema.event)
        .values([...SEED_DATA.EVENTS])
        .onConflictDoNothing();
      console.log(`   ✓ Inserted ${SEED_DATA.EVENTS.length} event(s)`);

      // 14. Rewards
      console.log("🎁 Creating rewards...");
      await tx
        .insert(schema.reward)
        .values([...SEED_DATA.REWARDS])
        .onConflictDoNothing();
      console.log(`   ✓ Inserted ${SEED_DATA.REWARDS.length} reward(s)`);
    });

    // Verify insertion
    console.log("\n📊 Verification:");
    const userCount = await db.$count(schema.user);
    const orgCount = await db.$count(schema.org);
    const productCount = await db.$count(schema.product);
    const programCount = await db.$count(schema.program);
    const participantCount = await db.$count(schema.participant);
    const refcodeCount = await db.$count(schema.refcode);
    const eventCount = await db.$count(schema.event);
    const rewardCount = await db.$count(schema.reward);

    console.log(`   Users: ${userCount}`);
    console.log(`   Organizations: ${orgCount}`);
    console.log(`   Products: ${productCount}`);
    console.log(`   Programs: ${programCount}`);
    console.log(`   Participants: ${participantCount}`);
    console.log(`   Referral Codes: ${refcodeCount}`);
    console.log(`   Events: ${eventCount}`);
    console.log(`   Rewards: ${rewardCount}`);

    console.log("\n✅ Seed completed successfully\n");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    throw error;
  }
};

/**
 * Deletes all seeded data from the database
 * Note: This deletes in reverse order to respect foreign key constraints
 */
const deleteSeedData = async () => {
  console.log("🧹 Cleaning seed data...");

  try {
    await db.transaction(async (tx) => {
      // Delete in reverse order due to foreign key constraints
      console.log("🗑️  Deleting rewards...");
      await tx.delete(schema.reward);

      console.log("🗑️  Deleting events...");
      await tx.delete(schema.event);

      console.log("🗑️  Deleting referrals...");
      await tx.delete(schema.referral);

      console.log("🗑️  Deleting product secrets...");
      await tx.delete(schema.productSecrets);

      console.log("🗑️  Deleting reward rules...");
      await tx.delete(schema.rewardRule);

      console.log("🗑️  Deleting referral codes...");
      await tx.delete(schema.refcode);

      console.log("🗑️  Deleting participants...");
      await tx.delete(schema.participant);

      console.log("🗑️  Deleting event definitions...");
      await tx.delete(schema.eventDefinition);

      console.log("🗑️  Deleting programs...");
      await tx.delete(schema.program);

      console.log("🗑️  Deleting program templates...");
      await tx.delete(schema.programTemplate);

      console.log("🗑️  Deleting products...");
      await tx.delete(schema.product);

      console.log("🗑️  Deleting organization memberships...");
      await tx.delete(schema.orgUser);

      console.log("🗑️  Deleting organizations...");
      await tx.delete(schema.org);

      console.log("🗑️  Deleting users...");
      await tx.delete(schema.user);

      console.log("   ✓ Deleted all seed data");
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
    await db.$count(schema.user);
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
  seed    - Seed all data into the database (users, organizations, products, programs, etc.)
  delete  - Delete all seeded data from the database
  health  - Check database connectivity

Examples:
  pnpm db:seed
  pnpm db:deleteseed
  tsx src/seed.ts health
`);
  process.exit(1);
}

export { seedData, deleteSeedData, checkDatabaseHealth };
