import { createDb } from "../index";
import { programTemplate } from "../schema";
import { eq } from "drizzle-orm";
import {
  programTemplateConfigSchema,
  ProgramTemplateConfigType,
} from "@refref/types";

async function seedTemplates() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL environment variable is required");
  }
  const db = createDb(process.env.DATABASE_URL);
  const templates = [
    {
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
      },
    },
    {
      templateName: "Tiered Rewards Program",
      description:
        "A multi-level program with increasing rewards for top performers",
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
      },
    },
    {
      templateName: "Early Access Program",
      description: "Exclusive program for early adopters and beta testers",
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
      },
    },
  ] satisfies Array<{
    templateName: string;
    description: string;
    config: ProgramTemplateConfigType;
  }>;

  for (const template of templates) {
    // Validate config at runtime using Zod
    try {
      programTemplateConfigSchema.parse(template.config);
    } catch (err) {
      console.error(`Invalid config for template: ${template.templateName}`);
      throw err;
    }

    // Check if template already exists by templateName
    const exists = await db
      .select()
      .from(programTemplate)
      .where(eq(programTemplate.templateName, template.templateName));
    if (exists.length === 0) {
      await db.insert(programTemplate).values({
        ...template,
        config: template.config,
      });
      console.log(`Inserted template: ${template.templateName}`);
    } else {
      // Update existing template with new config
      await db
        .update(programTemplate)
        .set({
          description: template.description,
          config: template.config,
        })
        .where(eq(programTemplate.templateName, template.templateName));
      console.log(`Updated template: ${template.templateName}`);
    }
  }
  process.exit(0);
}

seedTemplates().catch((err) => {
  console.error(err);
  process.exit(1);
});
