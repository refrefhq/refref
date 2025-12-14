import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db, schema } from "@/server/db";
import { and, ilike, or, eq } from "drizzle-orm";

const { participant, program, refcode } = schema;

const settingsPages = [
  {
    id: "profile-settings",
    name: "Profile",
    href: `/settings/account/profile`,
  },
  {
    id: "appearance-settings",
    name: "Appearance",
    href: `/settings/account/appearance`,
  },
  {
    id: "organization-settings",
    name: "Organization",
    href: `/settings/organization/general`,
  },
  {
    id: "organization-members-settings",
    name: "Organization Members",
    href: `/settings/organization/members`,
  },
  {
    id: "product-settings",
    name: "Product",
    href: `/settings/product/general`,
  },
  {
    id: "product-secrets-settings",
    name: "Product Secrets",
    href: "/settings/product/secrets",
  },
  {
    id: "api-settings",
    name: "API",
    href: "/settings/organization/api-keys",
  },
];

export const searchRouter = createTRPCRouter({
  global: protectedProcedure
    .input(
      z.object({
        query: z.string().min(0).max(100),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { query } = input;
      const productId = ctx.activeProductId;

      // Return empty results if query is empty
      if (!query || query.trim().length === 0) {
        return {
          participants: [],
          programs: [],
        };
      }

      const searchPattern = `%${query}%`;

      const [participants, programs] = await Promise.all([
        db
          .select({
            id: participant.id,
            email: participant.email,
            name: participant.name,
          })
          .from(participant)
          .leftJoin(refcode, eq(participant.id, refcode.participantId))
          .where(
            and(
              eq(participant.productId, productId),
              or(
                ilike(participant.email, searchPattern),
                ilike(participant.id, searchPattern),
                ilike(participant.name, searchPattern),
                ilike(participant.externalId, searchPattern),
                ilike(refcode.code, searchPattern),
              ),
            ),
          )
          .limit(5),

        db
          .select({
            id: program.id,
            name: program.name,
          })
          .from(program)
          .where(
            and(
              eq(program.productId, productId),
              ilike(program.name, searchPattern),
            ),
          )
          .limit(5),
      ]);
      const filteredSettingsPages = settingsPages.filter((page) => {
        return (
          page.name.toLowerCase().includes(query.toLowerCase()) ||
          page.href.toLowerCase().includes(query.toLowerCase())
        );
      });

      return {
        participants,
        programs,
        settingsPages: filteredSettingsPages,
      };
    }),
});
