import { z } from "zod";
import {
  createTRPCRouter,
  onboardingProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { schema } from "@/server/db";
import { eq, and, count } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const { user, productUser } = schema;

// Input validation schema for updating user profile
const updateProfileSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  email: z.string().email({ message: "Invalid email address" }),
});

export const userRouter = createTRPCRouter({
  // Get current user profile
  getProfile: onboardingProcedure.query(async ({ ctx }) => {
    const currentUser = await ctx.db
      .select()
      .from(user)
      .where(eq(user.id, ctx.userId))
      .limit(1);

    if (!currentUser.length) {
      throw new Error("User not found");
    }

    return currentUser[0];
  }),

  // Update current user profile
  updateProfile: onboardingProcedure
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const [updatedUser] = await ctx.db
        .update(user)
        .set({
          name: input.name,
          email: input.email,
          updatedAt: new Date(),
        })
        .where(eq(user.id, ctx.userId))
        .returning();

      if (!updatedUser) {
        throw new Error("Failed to update user profile");
      }

      return updatedUser;
    }),

  // Get user by ID (for admin purposes)
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const foundUser = await ctx.db
        .select()
        .from(user)
        .where(eq(user.id, input.id))
        .limit(1);

      if (!foundUser.length) {
        throw new Error("User not found");
      }

      return foundUser[0];
    }),

  // Check if user can leave the current product
  canLeaveProduct: protectedProcedure.query(async ({ ctx }) => {
    // Get current user's role in the product
    const currentUserMembership = await ctx.db
      .select()
      .from(productUser)
      .where(
        and(
          eq(productUser.productId, ctx.activeProductId),
          eq(productUser.userId, ctx.userId),
        ),
      )
      .limit(1);

    if (!currentUserMembership.length) {
      throw new Error("User is not a member of this product");
    }

    const userRole = currentUserMembership[0]!.role;

    // Count total members in the product
    const totalMembersResult = await ctx.db
      .select({ count: count() })
      .from(productUser)
      .where(eq(productUser.productId, ctx.activeProductId));

    const totalMembers = totalMembersResult[0]?.count ?? 0;

    // Count admin members in the product
    const adminMembersResult = await ctx.db
      .select({ count: count() })
      .from(productUser)
      .where(
        and(
          eq(productUser.productId, ctx.activeProductId),
          eq(productUser.role, "admin"),
        ),
      );

    const adminMembers = adminMembersResult[0]?.count ?? 0;

    // User cannot leave if they are the only member
    if (totalMembers === 1) {
      return {
        canLeave: false,
        reason:
          "You cannot leave the product as you are the only member. Please add another member or delete the product.",
      };
    }

    // User cannot leave if they are the only admin
    if (userRole === "admin" && adminMembers === 1) {
      return {
        canLeave: false,
        reason:
          "You cannot leave the product as you are the only admin. Please promote another member to admin first.",
      };
    }

    return {
      canLeave: true,
      reason: null,
    };
  }),

  // Leave the current product
  leaveProduct: protectedProcedure.mutation(async ({ ctx }) => {
    // First check if user can leave
    const canLeaveCheck = await ctx.db
      .select()
      .from(productUser)
      .where(
        and(
          eq(productUser.productId, ctx.activeProductId),
          eq(productUser.userId, ctx.userId),
        ),
      )
      .limit(1);

    if (!canLeaveCheck.length) {
      throw new Error("User is not a member of this product");
    }

    const userRole = canLeaveCheck[0]!.role;

    // Count total members in the product
    const totalMembersResult = await ctx.db
      .select({ count: count() })
      .from(productUser)
      .where(eq(productUser.productId, ctx.activeProductId));

    const totalMembers = totalMembersResult[0]?.count ?? 0;

    // Count admin members in the product
    const adminMembersResult = await ctx.db
      .select({ count: count() })
      .from(productUser)
      .where(
        and(
          eq(productUser.productId, ctx.activeProductId),
          eq(productUser.role, "admin"),
        ),
      );

    const adminMembers = adminMembersResult[0]?.count ?? 0;

    // Validate that user can leave
    if (totalMembers === 1) {
      throw new Error("Cannot leave product as you are the only member");
    }

    if (userRole === "admin" && adminMembers === 1) {
      throw new Error("Cannot leave product as you are the only admin");
    }

    // Remove user from product
    await ctx.db
      .delete(productUser)
      .where(
        and(
          eq(productUser.productId, ctx.activeProductId),
          eq(productUser.userId, ctx.userId),
        ),
      );

    // If user has other products, set the first one as active
    const otherProducts = await ctx.db
      .select()
      .from(productUser)
      .where(eq(productUser.userId, ctx.userId))
      .limit(1);

    if (otherProducts.length > 0) {
      await auth.api.setActiveOrganization({
        body: {
          organizationId: otherProducts[0]!.productId,
        },
        headers: await headers(),
      });
    }

    return { success: true };
  }),
});
