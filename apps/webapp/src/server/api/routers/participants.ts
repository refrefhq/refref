import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { schema } from "@/server/db";
const { participant, referral, refcode, event } = schema;
import { and, count, eq, ilike, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const participantsRouter = createTRPCRouter({
  /**
   * Fetch paginated, filtered, and sorted participants.
   * Input: page, pageSize, filter (search), sort (field, direction)
   * Output: { data: Participant[], total: number }
   */
  getAll: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1),
        pageSize: z.number().min(1).max(100),
        filters: z
          .array(
            z.object({
              id: z.string(),
              value: z.union([z.string(), z.array(z.string())]),
              variant: z.string(),
              operator: z.string(),
            }),
          )
          .optional(),
        sort: z
          .object({
            field: z.enum(["name", "email", "createdAt"]),
            direction: z.enum(["asc", "desc"]),
          })
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, filters, sort } = input;
      // Build where clause for all filters
      let where = undefined;
      if (filters && filters.length > 0) {
        where = and(
          ...filters
            .map((filter) => {
              if (
                filter.id === "name" &&
                filter.variant === "text" &&
                typeof filter.value === "string"
              ) {
                return ilike(participant.name, `%${filter.value}%`);
              }
              if (
                filter.id === "email" &&
                filter.variant === "text" &&
                typeof filter.value === "string"
              ) {
                return ilike(participant.email, `%${filter.value}%`);
              }
              if (
                filter.id === "createdAt" &&
                filter.variant === "date" &&
                typeof filter.value === "string"
              ) {
                // Example: filter by date (exact match)
                return ilike(participant.createdAt, `%${filter.value}%`);
              }
              // Add more filter types/fields as needed
              return undefined;
            })
            .filter(Boolean),
        );
      }

      // Map sort field to column using a record
      const sortFieldMap = {
        name: participant.name,
        email: participant.email,
        createdAt: participant.createdAt,
      };
      const orderByColumn = sort
        ? sortFieldMap[sort.field]
        : participant.createdAt;
      const orderByDirection = sort?.direction ?? "desc";

      // Get total count
      const totalResult = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(participant)
        .where(where)
        .limit(1);
      const total = totalResult[0]?.count ?? 0;
      // Get paginated data
      const data = await ctx.db
        .select()
        .from(participant)
        .where(where)
        .orderBy(sql`${orderByColumn} ${sql.raw(orderByDirection)}`)
        .limit(pageSize)
        .offset((page - 1) * pageSize);
      return { data, total };
    }),
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;

      // Get participant with product validation
      const [participantData] = await ctx.db
        .select()
        .from(participant)
        .where(eq(participant.id, id))
        .limit(1);

      if (!participantData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Participant not found",
        });
      }

      // Get refcode for this participant (most recent one)
      const [refcodeData] = await ctx.db
        .select()
        .from(refcode)
        .where(eq(refcode.participantId, id))
        .orderBy(sql`${refcode.createdAt} DESC`)
        .limit(1);

      // Get referral count (how many people this participant has referred)
      const [referralCountResult] = await ctx.db
        .select({ count: count() })
        .from(referral)
        .where(eq(referral.referrerId, id));

      // Get events count for this participant
      const [eventsCountResult] = await ctx.db
        .select({ count: count() })
        .from(event)
        .where(eq(event.participantId, id));

      // Get recent referrals (last 5)
      const recentReferrals = await ctx.db
        .select({
          id: referral.id,
          name: referral.name,
          email: referral.email,
          externalId: referral.externalId,
          createdAt: referral.createdAt,
        })
        .from(referral)
        .where(eq(referral.referrerId, id))
        .orderBy(sql`${referral.createdAt} DESC`)
        .limit(5);

      return {
        ...participantData,
        refcode: refcodeData,
        referralCount: referralCountResult?.count ?? 0,
        eventsCount: eventsCountResult?.count ?? 0,
        recentReferrals,
      };
    }),
});
