import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db, schema } from "@/server/db";
const {
  product,
  program: programTable,
  programTemplate,
  participant,
  referral,
} = schema;
import { eq, and, asc, sql, count } from "drizzle-orm";
import assert from "assert";
import { getSetupProgress, type SetupProgress } from "@/lib/program";
import {
  programConfigV1Schema,
  type ProgramConfigV1Type,
  configuredProgramTemplateSchema,
  type ConfiguredProgramTemplateType,
  WidgetConfigType,
  widgetConfigSchema,
  defaultWidgetConfig,
} from "@refref/types";
import { TRPCError } from "@trpc/server";
import {
  generateWidgetConfigFromTemplate,
  mergeWidgetConfig,
} from "@/lib/template-config-generator";

/**
 * Transforms input and template data into the final program config.
 * @param config - The validated user input.
 * @returns The final config object conforming to ProgramConfigV1Type.
 */
function transformInputToProgramConfig(
  config: ConfiguredProgramTemplateType,
): ProgramConfigV1Type {
  // Initialize the program config
  const finalConfig: ProgramConfigV1Type = {
    schemaVersion: 1,
    widgetConfig: defaultWidgetConfig,
    actions: undefined, // Legacy field, no longer used
    notification: {}, // Placeholder
  };

  // Validate the final config against the Zod schema
  const validationResult = programConfigV1Schema.safeParse(finalConfig);
  if (!validationResult.success) {
    console.error("❌ error", validationResult.error.issues);
    // Log the validation errors for debugging
    console.error(
      "Program config validation failed:",
      validationResult.error.flatten(),
    );
    // Throw an error or handle invalid config state appropriately
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Failed to generate valid program configuration.",
      cause: validationResult.error,
    });
  }

  // Return the validated config data
  return validationResult.data;
}

export const programRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z
          .string()
          .min(1, "Name is required")
          .max(100, "Name is too long"),
        description: z.string().max(255, "Description is too long").optional(),
        productId: z.string().min(1, "Product is required"),
        templateId: z.string().min(1, "Template is required"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify product belongs to active organization
      const [selectedProduct] = await ctx.db
        .select()
        .from(product)
        .where(
          and(
            eq(product.id, input.productId),
            eq(product.id, ctx.activeProductId),
          ),
        )
        .limit(1);

      if (!selectedProduct) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Product not found or does not belong to your organization",
        });
      }

      // Get the selected template
      const [selectedTemplate] = await ctx.db
        .select()
        .from(programTemplate)
        .where(eq(programTemplate.id, input.templateId))
        .limit(1);

      if (!selectedTemplate) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Template not found",
        });
      }

      // Check if a program with this template already exists for this product
      const [existingProgram] = await ctx.db
        .select()
        .from(programTable)
        .where(
          and(
            eq(programTable.productId, input.productId),
            eq(programTable.programTemplateId, input.templateId),
          ),
        )
        .limit(1);

      if (existingProgram) {
        throw new TRPCError({
          code: "CONFLICT",
          message: `A program with the "${selectedTemplate.templateName}" template already exists in this product. Each template can only be used once per product.`,
        });
      }

      // Create a new program with initial pending state and template config
      const [program] = await ctx.db
        .insert(programTable)
        .values({
          name: input.name,
          productId: input.productId,
          programTemplateId: input.templateId,
          status: "pending_setup", // Initial status
          config: undefined,
        })
        .returning();

      assert(program, "Program not created");
      return {
        ...program,
        setup: getSetupProgress(program.config),
      };
    }),

  saveTemplateConfiguration: protectedProcedure
    .input(
      z.object({
        id: z.string(), // ID of the program to configure
        templateConfig: configuredProgramTemplateSchema,
        brandConfig: z
          .object({
            primaryColor: z
              .string()
              .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
          })
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      console.error("input", input);
      const { id, templateConfig, brandConfig } = input;

      // Get required modules from the already imported schema
      const { eventDefinition, rewardRule } = schema;

      // get the program along with the template
      const program = await ctx.db.query.program.findFirst({
        where: and(
          eq(programTable.id, input.id),
          eq(programTable.productId, ctx.activeProductId),
        ),
        with: {
          programTemplate: true,
        },
      });

      assert(program);

      // Use a transaction for the entire configuration save operation
      const result = await ctx.db.transaction(async (tx) => {
        // Check if we have the reward configuration
        const rewardConfig = templateConfig.rewardConfig;

        if (rewardConfig) {
          // Create default event definitions if they don't exist
          const eventTypes = [
            {
              type: "signup",
              name: "User Signup",
              description: "When a new user signs up using a referral link",
            },
            {
              type: "purchase",
              name: "Purchase",
              description: "When a user makes a purchase",
            },
          ];

          for (const eventType of eventTypes) {
            const [existing] = await tx
              .select()
              .from(eventDefinition)
              .where(eq(eventDefinition.type, eventType.type))
              .limit(1);

            if (!existing) {
              await tx.insert(eventDefinition).values({
                type: eventType.type,
                name: eventType.name,
                description: eventType.description,
                config: { schemaVersion: 1 },
              });
            }
          }

          // Create reward rules based on the configuration
          const rules = [];

          // Create rule for referrer reward on purchase
          if (rewardConfig.referrer) {
            const referrerRule = {
              programId: program.id,
              name: "Referrer Cash Reward",
              description:
                "Cash reward for referrers when their referrals make a purchase",
              type: "referrer_purchase_reward",
              config: {
                schemaVersion: 1 as const,
                trigger: { event: "purchase" },
                participantType: "referrer" as const,
                reward: {
                  type: "cash" as const,
                  amount: rewardConfig.referrer.value,
                  unit: rewardConfig.referrer.valueType as "fixed" | "percent",
                },
              },
              priority: 100,
              isActive: true,
            };
            rules.push(referrerRule);
          }

          // Create rule for referee discount on signup
          if (rewardConfig.referee) {
            const refereeRule = {
              programId: program.id,
              name: "Referee Discount",
              description:
                "Discount for new users who sign up using a referral link",
              type: "referee_signup_discount",
              config: {
                schemaVersion: 1 as const,
                trigger: { event: "signup" },
                participantType: "referee" as const,
                reward: {
                  type: "discount" as const,
                  amount: rewardConfig.referee.value,
                  unit: rewardConfig.referee.valueType as "fixed" | "percent",
                },
              },
              priority: 90,
              isActive: true,
            };
            rules.push(refereeRule);
          }

          // Insert all rules within the transaction
          if (rules.length > 0) {
            await tx.insert(rewardRule).values(rules);
          }
        }

        // 2. Generate widget config from brand and reward settings
        let widgetConfig: WidgetConfigType;

        if (brandConfig && rewardConfig) {
          // Get product details for product name
          const [productData] = await tx
            .select()
            .from(product)
            .where(eq(product.id, ctx.activeProductId))
            .limit(1);

          const productName = productData?.name || "Our Platform";

          // Generate widget config from template settings
          widgetConfig = generateWidgetConfigFromTemplate(
            brandConfig,
            rewardConfig,
            productName,
          );

          // Set the referral link (will be populated later by the system)
          widgetConfig.referralLink = "";
        } else {
          // Use existing config or default
          widgetConfig = program.config?.widgetConfig || defaultWidgetConfig;
        }

        // 3. Create the final program config
        const finalProgramConfig: ProgramConfigV1Type = {
          schemaVersion: 1,
          widgetConfig,
          actions: undefined,
          notification: undefined,
          templateConfig: program.programTemplate?.config || undefined,
        };

        // 4. Update the program record within the transaction
        const [updatedProgram] = await tx
          .update(programTable)
          .set({
            config: finalProgramConfig,
            status: "active",
          })
          .where(eq(programTable.id, input.id))
          .returning({ id: programTable.id });

        return { id };
      });

      return result;
    }),

  // Add a new procedure to list available templates
  listTemplates: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(programTemplate);
  }),

  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const program = await ctx.db.query.program.findFirst({
        where: eq(programTable.id, input),
        with: {
          programTemplate: true,
        },
      });

      if (!program) {
        throw new Error("Program not found");
      }

      // Verify program belongs to active organization through product
      const [productRecord] = await ctx.db
        .select()
        .from(product)
        .where(
          and(
            eq(product.id, program.productId),
            eq(product.id, ctx.activeProductId),
          ),
        )
        .limit(1);

      if (!productRecord) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Program does not belong to your organization",
        });
      }

      return {
        ...program,
        setup: getSetupProgress(program.config),
      };
    }),

  getSetupProgress: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const [program] = await ctx.db
        .select()
        .from(programTable)
        .where(eq(programTable.id, input))
        .limit(1);

      if (!program) {
        throw new Error("Program not found");
      }

      // Verify program belongs to active organization through product
      const [productRecord] = await ctx.db
        .select()
        .from(product)
        .where(
          and(
            eq(product.id, program.productId),
            eq(product.id, ctx.activeProductId),
          ),
        )
        .limit(1);

      if (!productRecord) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Program does not belong to your organization",
        });
      }

      return getSetupProgress(program.config);
    }),

  updateConfig: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        config: programConfigV1Schema,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [program] = await ctx.db
        .select()
        .from(programTable)
        .where(eq(programTable.id, input.id))
        .limit(1);

      if (!program) {
        throw new Error("Program not found");
      }

      // Verify program belongs to active organization through product
      const [productRecord] = await ctx.db
        .select()
        .from(product)
        .where(
          and(
            eq(product.id, program.productId),
            eq(product.id, ctx.activeProductId),
          ),
        )
        .limit(1);

      if (!productRecord) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Program does not belong to your organization",
        });
      }

      // Get setup progress to determine if all required steps are complete
      const setupProgress = getSetupProgress(input.config);
      const allRequiredComplete = setupProgress.steps
        .filter((step) => step.isRequired)
        .every((step) => step.isComplete);

      const [updatedProgram] = await ctx.db
        .update(programTable)
        .set({
          config: input.config,
        })
        .where(eq(programTable.id, input.id))
        .returning();

      assert(updatedProgram, "Program not updated");
      return {
        ...updatedProgram,
        setup: getSetupProgress(updatedProgram.config),
      };
    }),

  /* Deprecated - use new reward configuration through saveTemplateConfiguration
  updateRewardConfig: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        reward: z.any(), // Legacy schema removed
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [program] = await ctx.db
        .select()
        .from(programTable)
        .where(eq(programTable.id, input.id))
        .limit(1);

      if (!program) {
        throw new Error("Program not found");
      }

      // Verify program belongs to active organization through product
      const [productRecord] = await ctx.db
        .select()
        .from(product)
        .where(
          and(
            eq(product.id, program.productId),
            eq(product.id, ctx.activeProductId),
          ),
        )
        .limit(1);

      if (!productRecord) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Program does not belong to your organization",
        });
      }

      // Get current config
      const currentConfig = program.config as ProgramConfigV1Type;
      
      // Update the referral action's reward configuration
      const updatedActions = currentConfig.actions?.map(action => {
        if (action.actionId === "referral") {
          return {
            ...action,
            reward: {
              ...input.reward,
            },
          };
        }
        return action;
      });

      // Create updated config
      const updatedConfig: ProgramConfigV1Type = {
        ...currentConfig,
        actions: updatedActions,
      };

      const [updatedProgram] = await ctx.db
        .update(programTable)
        .set({
          config: updatedConfig,
        })
        .where(eq(programTable.id, input.id))
        .returning();

      assert(updatedProgram, "Program not updated");
      return {
        ...updatedProgram,
        setup: getSetupProgress(updatedProgram.config),
      };
    }),
  */

  getAll: protectedProcedure.query(async ({ ctx }) => {
    // Get all programs through products belonging to the active organization
    const programs = await ctx.db
      .select()
      .from(programTable)
      .innerJoin(product, eq(product.id, programTable.productId))
      .where(eq(product.id, ctx.activeProductId))
      .orderBy(asc(programTable.createdAt));

    // Get participant and referral counts for each program
    const programsWithCounts = await Promise.all(
      programs.map(async ({ program }) => {
        // Get participant count for this product
        const [participantCount] = await ctx.db
          .select({ count: count() })
          .from(participant)
          .where(eq(participant.productId, program.productId));

        // Get referral count through participants in this product
        const [referralCount] = await ctx.db
          .select({ count: count() })
          .from(referral)
          .innerJoin(participant, eq(participant.id, referral.referrerId))
          .where(eq(participant.productId, program.productId));

        return {
          ...program,
          setup: getSetupProgress(program.config),
          participantCount: participantCount?.count || 0,
          referralCount: referralCount?.count || 0,
        };
      }),
    );

    return programsWithCounts;
  }),

  /**
   * Delete a program by ID. Verifies program belongs to active organization.
   */
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Find the program and verify it belongs to the active organization
      const [program] = await ctx.db
        .select()
        .from(programTable)
        .where(eq(programTable.id, input.id))
        .limit(1);

      if (!program) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Program not found",
        });
      }

      // Verify program belongs to active organization through product
      const [productRecord] = await ctx.db
        .select()
        .from(product)
        .where(
          and(
            eq(product.id, program.productId),
            eq(product.id, ctx.activeProductId),
          ),
        )
        .limit(1);

      if (!productRecord) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Program does not belong to your organization",
        });
      }

      // Delete the program
      await ctx.db.delete(programTable).where(eq(programTable.id, input.id));
      return { id: input.id };
    }),
});
