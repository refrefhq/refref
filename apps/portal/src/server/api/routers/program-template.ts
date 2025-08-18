import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db, schema } from "@/server/db";
const { programTemplate: programTemplateTable } = schema;
import { eq } from "drizzle-orm";
import { programTemplateConfigSchema } from "@refref/types";
import { TRPCError } from "@trpc/server";

// Input validation schema for program templates
const createProgramTemplateSchema = z.object({
  templateName: z
    .string()
    .min(1, "Template name is required")
    .max(100, "Template name is too long"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(255, "Description is too long"),
  config: programTemplateConfigSchema,
});

export const programTemplateRouter = createTRPCRouter({
  // Get all program templates
  getAll: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.select().from(programTemplateTable);
  }),

  // Get a single program template by ID
  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const [template] = await ctx.db
        .select()
        .from(programTemplateTable)
        .where(eq(programTemplateTable.id, input))
        .limit(1);

      if (!template) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Template not found",
        });
      }

      return template;
    }),

  // Create a new program template
  create: protectedProcedure
    .input(createProgramTemplateSchema)
    .mutation(async ({ ctx, input }) => {
      const [template] = await ctx.db
        .insert(programTemplateTable)
        .values({
          templateName: input.templateName,
          description: input.description,
          config: input.config,
        })
        .returning();

      if (!template) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create template",
        });
      }

      return template;
    }),

  // Update a program template
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        templateName: z.string().min(1).max(100).optional(),
        description: z.string().min(1).max(255).optional(),
        config: programTemplateConfigSchema.optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;

      const [template] = await ctx.db
        .update(programTemplateTable)
        .set(updateData)
        .where(eq(programTemplateTable.id, id))
        .returning();

      if (!template) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Template not found",
        });
      }

      return template;
    }),

  // Delete a program template
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const [template] = await ctx.db
        .delete(programTemplateTable)
        .where(eq(programTemplateTable.id, input))
        .returning();

      if (!template) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Template not found",
        });
      }

      return template;
    }),
});
