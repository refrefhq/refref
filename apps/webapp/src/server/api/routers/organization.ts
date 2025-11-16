import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { schema } from "@/server/db";
const { org, orgUser } = schema;
import { eq, and } from "drizzle-orm";

// Input validation schema for updating organization
const updateOrganizationSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  logo: z.string().url({ message: "Invalid logo URL" }).optional().nullable(),
});

export const organizationRouter = createTRPCRouter({
  // Get the current active organization
  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    const [currentOrg] = await ctx.db
      .select()
      .from(org)
      .where(eq(org.id, ctx.activeOrganizationId))
      .limit(1);

    if (!currentOrg) {
      throw new Error("Organization not found");
    }

    return currentOrg;
  }),

  // Update organization information
  update: protectedProcedure
    .input(updateOrganizationSchema)
    .mutation(async ({ ctx, input }) => {
      // Verify user has permission to update (must be owner or admin)
      const [membership] = await ctx.db
        .select()
        .from(orgUser)
        .where(
          and(
            eq(orgUser.orgId, ctx.activeOrganizationId),
            eq(orgUser.userId, ctx.userId),
          ),
        )
        .limit(1);

      if (!membership || (membership.role !== "owner" && membership.role !== "admin")) {
        throw new Error("You don't have permission to update this organization");
      }

      const [updatedOrg] = await ctx.db
        .update(org)
        .set({
          name: input.name,
          logo: input.logo,
          updatedAt: new Date(),
        })
        .where(eq(org.id, ctx.activeOrganizationId))
        .returning();

      if (!updatedOrg) {
        throw new Error("Failed to update organization");
      }

      return updatedOrg;
    }),

  // Get all members of the current organization
  getMembers: protectedProcedure.query(async ({ ctx }) => {
    const members = await ctx.db
      .select()
      .from(orgUser)
      .where(eq(orgUser.orgId, ctx.activeOrganizationId));

    return members;
  }),
});
