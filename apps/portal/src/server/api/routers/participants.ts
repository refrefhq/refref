import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db, schema } from "@/server/db";
const { participant } = schema;
import { and, ilike, sql } from "drizzle-orm";

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
});
