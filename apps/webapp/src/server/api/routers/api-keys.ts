import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import {
  ensureServiceAccountForOrganization,
  getApiKeysForOrganization,
  validateApiKeyPermission as validateOrgApiKeyPermission,
} from "@refref/coredb";
import { auth } from "@/lib/auth";

export const apiKeysRouter = createTRPCRouter({
  /**
   * List all API keys for the active organization
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.activeOrganizationId) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "No active organization",
      });
    }

    // Validate permission
    const hasPermission = await validateOrgApiKeyPermission(
      ctx.db,
      ctx.activeOrganizationId,
      ctx.userId!,
    );

    if (!hasPermission) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only organization admins/owners can manage API keys",
      });
    }

    // Get API keys for this organization
    const keys = await getApiKeysForOrganization(
      ctx.db,
      ctx.activeOrganizationId,
    );

    return keys;
  }),

  /**
   * Create a new API key for the active organization
   */
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "API key name is required"),
        expiresIn: z
          .number()
          .int()
          .nonnegative()
          .optional()
          .describe("Expiration time in seconds (0 for never)"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.activeOrganizationId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No active organization",
        });
      }

      // Validate permission
      const hasPermission = await validateOrgApiKeyPermission(
        ctx.db,
        ctx.activeOrganizationId,
        ctx.userId!,
      );

      if (!hasPermission) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only organization admins/owners can manage API keys",
        });
      }

      // Ensure service account exists for this organization
      const serviceAccountId = await ensureServiceAccountForOrganization(
        ctx.db,
        ctx.activeOrganizationId,
      );

      // Create the API key using Better Auth
      const apiKeyResponse = await auth.api.createApiKey({
        body: {
          name: input.name,
          userId: serviceAccountId,
          expiresIn:
            input.expiresIn === 0
              ? null
              : (input.expiresIn ?? 60 * 60 * 24 * 365), // Default: 1 year
          prefix: "org_refref_key_",
          permissions: {
            [ctx.activeOrganizationId]: ["full_access"],
          },
          metadata: {
            organizationId: ctx.activeOrganizationId,
            createdBy: ctx.userId,
            createdAt: new Date().toISOString(),
          },
        },
      });

      if (!apiKeyResponse) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create API key",
        });
      }

      // Return the full key (ONLY ONCE!)
      return {
        id: apiKeyResponse.id,
        name: apiKeyResponse.name,
        key: apiKeyResponse.key,
        start: apiKeyResponse.start,
        expiresAt: apiKeyResponse.expiresAt,
        createdAt: apiKeyResponse.createdAt,
      };
    }),

  /**
   * Revoke (delete) an API key
   */
  revoke: protectedProcedure
    .input(
      z.object({
        keyId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.activeOrganizationId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "No active organization",
        });
      }

      // Validate permission
      const hasPermission = await validateOrgApiKeyPermission(
        ctx.db,
        ctx.activeOrganizationId,
        ctx.userId!,
      );

      if (!hasPermission) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only organization admins/owners can manage API keys",
        });
      }

      // Delete the API key using Better Auth
      await auth.api.deleteApiKey({
        body: {
          keyId: input.keyId,
        },
      });

      return { success: true };
    }),
});
