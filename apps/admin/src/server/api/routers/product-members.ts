import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { schema, DBType } from "@/server/db";
import { eq, and } from "drizzle-orm";
import { count } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { TRPCError } from "@trpc/server";

const { user, productUser, invitation } = schema;

// Helper function to get member counts by role
async function getProductMemberCounts(db: DBType, productId: string) {
  const [totalResult, ownerResult, adminResult] = await Promise.all([
    db
      .select({ count: count() })
      .from(productUser)
      .where(eq(productUser.productId, productId)),
    db
      .select({ count: count() })
      .from(productUser)
      .where(
        and(
          eq(productUser.productId, productId),
          eq(productUser.role, "owner"),
        ),
      ),
    db
      .select({ count: count() })
      .from(productUser)
      .where(
        and(
          eq(productUser.productId, productId),
          eq(productUser.role, "admin"),
        ),
      ),
  ]);

  return {
    total: totalResult[0]?.count ?? 0,
    owners: ownerResult[0]?.count ?? 0,
    admins: adminResult[0]?.count ?? 0,
  };
}

// Helper to validate role changes
async function validateRoleChange(
  db: DBType,
  productId: string,
  userId: string,
  newRole: string,
  currentUserId: string,
) {
  // Get current user's role (the one making the change)
  const [currentUserMembership] = await db
    .select()
    .from(productUser)
    .where(
      and(
        eq(productUser.productId, productId),
        eq(productUser.userId, currentUserId),
      ),
    );

  if (!currentUserMembership) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You are not a member of this product",
    });
  }

  // Only owners and admins can change roles
  if (currentUserMembership.role === "member") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You don't have permission to change roles",
    });
  }

  // Get target user's current role
  const [targetUserMembership] = await db
    .select()
    .from(productUser)
    .where(
      and(eq(productUser.productId, productId), eq(productUser.userId, userId)),
    );

  if (!targetUserMembership) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User is not a member of this product",
    });
  }

  const counts = await getProductMemberCounts(db, productId);

  // Prevent demoting the last owner
  if (
    targetUserMembership.role === "owner" &&
    counts.owners === 1 &&
    newRole !== "owner"
  ) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        "Cannot demote the last owner. Promote another member to owner first.",
    });
  }

  // Prevent demoting the last admin if there are no owners
  if (
    targetUserMembership.role === "admin" &&
    counts.admins === 1 &&
    counts.owners === 0 &&
    newRole === "member"
  ) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Cannot demote the last admin when there are no owners.",
    });
  }

  // Only owners can promote to owner
  if (newRole === "owner" && currentUserMembership.role !== "owner") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Only owners can promote members to owner role",
    });
  }
}

// Helper to validate member removal
async function validateMemberRemoval(
  db: DBType,
  productId: string,
  userIdToRemove: string,
  currentUserId: string,
) {
  // Get current user's role
  const [currentUserMembership] = await db
    .select()
    .from(productUser)
    .where(
      and(
        eq(productUser.productId, productId),
        eq(productUser.userId, currentUserId),
      ),
    );

  if (!currentUserMembership) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You are not a member of this product",
    });
  }

  // Only owners and admins can remove members
  if (currentUserMembership.role === "member") {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "You don't have permission to remove members",
    });
  }

  // Get target user's role
  const [targetUserMembership] = await db
    .select()
    .from(productUser)
    .where(
      and(
        eq(productUser.productId, productId),
        eq(productUser.userId, userIdToRemove),
      ),
    );

  if (!targetUserMembership) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "User is not a member of this product",
    });
  }

  const counts = await getProductMemberCounts(db, productId);

  // Prevent removing the last member
  if (counts.total === 1) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Cannot remove the last member of the product",
    });
  }

  // Prevent removing the last owner
  if (targetUserMembership.role === "owner" && counts.owners === 1) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message:
        "Cannot remove the last owner. Promote another member to owner first.",
    });
  }

  // Prevent removing the last admin if there are no owners
  if (
    targetUserMembership.role === "admin" &&
    counts.admins === 1 &&
    counts.owners === 0
  ) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Cannot remove the last admin when there are no owners.",
    });
  }
}

export const productMembersRouter = createTRPCRouter({
  /**
   * Get all members for the active organization.
   */
  listMembers: protectedProcedure.query(async ({ ctx }) => {
    const { orgUser } = schema;

    const rows = await ctx.db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.image,
        role: orgUser.role,
        joinedAt: orgUser.createdAt,
      })
      .from(orgUser)
      .innerJoin(user, eq(orgUser.userId, user.id))
      .where(eq(orgUser.orgId, ctx.activeOrganizationId));

    // Get member counts by role
    const [totalResult, ownerResult, adminResult] = await Promise.all([
      ctx.db
        .select({ count: count() })
        .from(orgUser)
        .where(eq(orgUser.orgId, ctx.activeOrganizationId)),
      ctx.db
        .select({ count: count() })
        .from(orgUser)
        .where(
          and(
            eq(orgUser.orgId, ctx.activeOrganizationId),
            eq(orgUser.role, "owner"),
          ),
        ),
      ctx.db
        .select({ count: count() })
        .from(orgUser)
        .where(
          and(
            eq(orgUser.orgId, ctx.activeOrganizationId),
            eq(orgUser.role, "admin"),
          ),
        ),
    ]);

    const counts = {
      total: totalResult[0]?.count ?? 0,
      owners: ownerResult[0]?.count ?? 0,
      admins: adminResult[0]?.count ?? 0,
    };

    // Format joinedAt to readable string
    return {
      members: rows.map((row) => ({
        id: row.id,
        name: row.name,
        email: row.email,
        avatar: row.avatar ?? undefined,
        role: row.role as "admin" | "member" | "owner",
        joinedAt: row.joinedAt.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        isCurrentUser: row.id === ctx.userId, // Add flag to identify current user
      })),
      counts, // Include counts for UI validations
      currentUserId: ctx.userId, // Explicitly provide current user ID
      currentUserRole: ctx.organizationUserRole, // Provide current user's role for UI permissions
    };
  }),

  /**
   * Get pending/expired invitations for the active organization.
   */
  listInvitations: protectedProcedure.query(async ({ ctx }) => {
    const data = await ctx.db
      .select()
      .from(invitation)
      .innerJoin(user, eq(user.id, invitation.inviterId))
      .where(
        and(
          eq(invitation.organizationId, ctx.activeOrganizationId),
          eq(invitation.status, "pending"),
        ),
      );

    if (!data) return [];

    return data.map(({ invitation, user }) => ({
      id: invitation.id,
      email: invitation.email,
      role: (invitation.role as "admin" | "member" | "owner") ?? "member",
      invitedBy: user.name ?? user.email ?? "System",
      invitedAt: new Date(invitation.createdAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      expiresAt: new Date(invitation.expiresAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
      status: invitation.status as "pending" | "accepted" | "expired",
    }));
  }),

  /**
   * Invite a member (creates invitation).
   */
  invite: protectedProcedure
    .input(
      z.object({
        email: z.string().email(),
        role: z.enum(["admin", "member", "owner"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to invite
      if (ctx.organizationUserRole === "member") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "You don't have permission to invite members. Only owners and admins can invite.",
        });
      }

      // Only owners can invite other owners
      if (ctx.organizationUserRole === "admin" && input.role === "owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only owners can invite other owners",
        });
      }

      // Create invitation entry
      const invitation = await auth.api.createInvitation({
        body: {
          organizationId: ctx.activeOrganizationId,
          email: input.email,
          role: input.role,
        },
        headers: ctx.headers,
      });

      return { id: invitation };
    }),

  /**
   * Change role of a member with validation.
   */
  changeRole: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
        role: z.enum(["admin", "member", "owner"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Use Better Auth's API to update the role
      await auth.api.updateMemberRole({
        body: {
          organizationId: ctx.activeOrganizationId,
          memberId: input.userId,
          role: input.role,
        },
        headers: ctx.headers,
      });

      return { success: true };
    }),

  /**
   * Remove member from organization with validation.
   */
  remove: protectedProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Use Better Auth's API to remove the member
      await auth.api.removeMember({
        body: {
          organizationId: ctx.activeOrganizationId,
          memberIdOrEmail: input.userId,
        },
        headers: ctx.headers,
      });

      return { success: true };
    }),

  /**
   * Cancel invitation.
   */
  cancelInvitation: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to cancel invitations
      if (ctx.organizationUserRole === "member") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "You don't have permission to cancel invitations. Only owners and admins can cancel invitations.",
        });
      }

      await auth.api.cancelInvitation({
        body: {
          invitationId: input.id,
        },
        headers: ctx.headers,
      });
      await ctx.db.delete(invitation).where(eq(invitation.id, input.id));

      return { success: true };
    }),

  resendInvitation: protectedProcedure
    .input(
      z.object({
        email: z.string(),
        role: z.enum(["admin", "member", "owner"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has permission to resend invitations
      if (ctx.organizationUserRole === "member") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "You don't have permission to resend invitations. Only owners and admins can resend invitations.",
        });
      }

      // Only owners can invite other owners
      if (ctx.organizationUserRole === "admin" && input.role === "owner") {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only owners can invite other owners",
        });
      }

      const invitation = await auth.api.createInvitation({
        body: {
          email: input.email,
          role: input.role,
          organizationId: ctx.activeOrganizationId,
          resend: true,
        },
        headers: ctx.headers,
      });

      return { id: invitation };
    }),
  acceptInvitation: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await auth.api.acceptInvitation({
        body: { invitationId: input.id },
        headers: ctx.headers,
      });

      return { success: true };
    }),
});
