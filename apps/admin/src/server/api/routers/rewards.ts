import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db, schema } from "@/server/db";
const {
  reward: rewardTable,
  participant,
  program: programTable,
  rewardRule,
  event: eventTable,
  eventDefinition,
} = schema;
import { and, eq, ilike, sql, desc, asc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const rewardsRouter = createTRPCRouter({
  /**
   * Fetch paginated, filtered, and sorted rewards.
   * Input: page, pageSize, filter (search), sort (field, direction)
   * Output: { data: Reward[], total: number }
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
            field: z.enum([
              "rewardType",
              "amount",
              "currency",
              "status",
              "createdAt",
              "disbursedAt",
            ]), // Add more sortable fields as needed
            direction: z.enum(["asc", "desc"]),
          })
          .optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, filters, sort } = input;

      // Build where clause for all filters
      const whereConditions = [];

      if (filters && filters.length > 0) {
        filters.forEach((filter) => {
          // Filter by rewardType
          if (
            filter.id === "rewardType" &&
            filter.variant === "text" &&
            typeof filter.value === "string"
          ) {
            whereConditions.push(
              ilike(rewardTable.rewardType, `%${filter.value}%`),
            );
          }
          // Filter by status
          if (
            filter.id === "status" &&
            filter.variant === "text" &&
            typeof filter.value === "string"
          ) {
            whereConditions.push(
              ilike(rewardTable.status, `%${filter.value}%`),
            );
          }
          // Filter by currency
          if (
            filter.id === "currency" &&
            filter.variant === "text" &&
            typeof filter.value === "string"
          ) {
            whereConditions.push(
              ilike(rewardTable.currency, `%${filter.value}%`),
            );
          }
        });
      }

      // Add filter to only show rewards from user's active project
      // Join with program to check project ownership
      const projectFilter = sql`${rewardTable.programId} IN (
        SELECT id FROM ${programTable} 
        WHERE ${programTable.projectId} = ${ctx.activeProjectId}
      )`;
      whereConditions.push(projectFilter);

      const where =
        whereConditions.length > 0 ? and(...whereConditions) : undefined;

      // Map sort field to column
      const sortFieldMap = {
        rewardType: rewardTable.rewardType,
        amount: rewardTable.amount,
        currency: rewardTable.currency,
        status: rewardTable.status,
        createdAt: rewardTable.createdAt,
        disbursedAt: rewardTable.disbursedAt,
      };

      const orderByColumn = sort
        ? sortFieldMap[sort.field]
        : rewardTable.createdAt;
      const orderByDirection = sort?.direction ?? "desc";

      // Get total count
      const [totalResult] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(rewardTable)
        .where(where);

      const total = totalResult?.count ?? 0;

      // Get paginated data with related information
      const rewards = await ctx.db
        .select({
          reward: rewardTable,
          participant: participant,
          program: programTable,
          rewardRule: rewardRule,
          event: eventTable,
          eventDefinition: eventDefinition,
        })
        .from(rewardTable)
        .leftJoin(participant, eq(rewardTable.participantId, participant.id))
        .leftJoin(programTable, eq(rewardTable.programId, programTable.id))
        .leftJoin(rewardRule, eq(rewardTable.rewardRuleId, rewardRule.id))
        .leftJoin(eventTable, eq(rewardTable.eventId, eventTable.id))
        .leftJoin(
          eventDefinition,
          eq(eventTable.eventDefinitionId, eventDefinition.id),
        )
        .where(where)
        .orderBy(
          orderByDirection === "desc"
            ? desc(orderByColumn)
            : asc(orderByColumn),
        )
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      // Format the response
      const data = rewards.map((row) => ({
        id: row.reward.id,
        eventId: row.reward.eventId,
        eventType: row.eventDefinition?.type,
        participantId: row.reward.participantId,
        participantEmail: row.participant?.email,
        participantExternalId: row.participant?.externalId,
        participantName: row.participant?.name,
        programId: row.reward.programId,
        programName: row.program?.name,
        rewardType: row.reward.rewardType,
        amount: row.reward.amount,
        currency: row.reward.currency,
        status: row.reward.status,
        disbursedAt: row.reward.disbursedAt,
        createdAt: row.reward.createdAt,
        updatedAt: row.reward.updatedAt,
        metadata: row.reward.metadata,
        ruleName: row.rewardRule?.name,
      }));

      return { data, total };
    }),

  updateApprovalStatus: protectedProcedure
    .input(
      z.object({
        rewardId: z.string(),
        status: z.string(), // You might want a more specific enum/type for status
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify reward exists and belongs to user's project
      const [existingReward] = await ctx.db
        .select({
          reward: rewardTable,
          program: programTable,
        })
        .from(rewardTable)
        .innerJoin(programTable, eq(rewardTable.programId, programTable.id))
        .where(eq(rewardTable.id, input.rewardId))
        .limit(1);

      if (!existingReward) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Reward not found",
        });
      }

      if (existingReward.program.projectId !== ctx.activeProjectId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Reward does not belong to your project",
        });
      }

      // Update the reward status
      const [updatedReward] = await ctx.db
        .update(rewardTable)
        .set({
          status: input.status,
          updatedAt: new Date(),
        })
        .where(eq(rewardTable.id, input.rewardId))
        .returning();

      return {
        success: true,
        rewardId: input.rewardId,
        status: input.status,
        reward: updatedReward,
      };
    }),

  markAsDisbursed: protectedProcedure
    .input(z.object({ rewardId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify reward exists and belongs to user's project
      const [existingReward] = await ctx.db
        .select({
          reward: rewardTable,
          program: programTable,
        })
        .from(rewardTable)
        .innerJoin(programTable, eq(rewardTable.programId, programTable.id))
        .where(eq(rewardTable.id, input.rewardId))
        .limit(1);

      if (!existingReward) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Reward not found",
        });
      }

      if (existingReward.program.projectId !== ctx.activeProjectId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Reward does not belong to your project",
        });
      }

      // Check if reward is in a valid state to be disbursed
      if (existingReward.reward.status === "disbursed") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Reward has already been disbursed",
        });
      }

      if (existingReward.reward.status === "rejected") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Cannot disburse a rejected reward",
        });
      }

      const newStatus = "disbursed";
      const disbursedAt = new Date();

      // Update the reward to disbursed
      const [updatedReward] = await ctx.db
        .update(rewardTable)
        .set({
          status: newStatus,
          disbursedAt: disbursedAt,
          updatedAt: new Date(),
        })
        .where(eq(rewardTable.id, input.rewardId))
        .returning();

      return {
        success: true,
        rewardId: input.rewardId,
        status: newStatus,
        disbursedAt,
        reward: updatedReward,
      };
    }),

  // Get reward by ID
  getById: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input: rewardId }) => {
      const [rewardData] = await ctx.db
        .select({
          reward: rewardTable,
          participant: participant,
          program: programTable,
          rewardRule: rewardRule,
          event: eventTable,
        })
        .from(rewardTable)
        .leftJoin(participant, eq(rewardTable.participantId, participant.id))
        .leftJoin(programTable, eq(rewardTable.programId, programTable.id))
        .leftJoin(rewardRule, eq(rewardTable.rewardRuleId, rewardRule.id))
        .leftJoin(eventTable, eq(rewardTable.eventId, eventTable.id))
        .where(eq(rewardTable.id, rewardId))
        .limit(1);

      if (!rewardData) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Reward not found",
        });
      }

      // Verify reward belongs to user's project
      if (rewardData.program?.projectId !== ctx.activeProjectId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Reward does not belong to your project",
        });
      }

      return {
        ...rewardData.reward,
        participant: rewardData.participant,
        program: rewardData.program,
        rewardRule: rewardData.rewardRule,
        event: rewardData.event,
      };
    }),

  // Get rewards by participant
  getByParticipant: protectedProcedure
    .input(
      z.object({
        participantId: z.string(),
        page: z.number().min(1).default(1),
        pageSize: z.number().min(1).max(100).default(20),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { participantId, page, pageSize } = input;

      // Verify participant belongs to user's project
      const [participantRecord] = await ctx.db
        .select()
        .from(participant)
        .where(
          and(
            eq(participant.id, participantId),
            eq(participant.projectId, ctx.activeProjectId),
          ),
        )
        .limit(1);

      if (!participantRecord) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Participant not found or does not belong to your project",
        });
      }

      // Get total count
      const [totalResult] = await ctx.db
        .select({ count: sql<number>`count(*)` })
        .from(rewardTable)
        .where(eq(rewardTable.participantId, participantId));

      const total = totalResult?.count ?? 0;

      // Get paginated rewards
      const rewards = await ctx.db
        .select({
          reward: rewardTable,
          program: programTable,
          rewardRule: rewardRule,
          event: eventTable,
        })
        .from(rewardTable)
        .leftJoin(programTable, eq(rewardTable.programId, programTable.id))
        .leftJoin(rewardRule, eq(rewardTable.rewardRuleId, rewardRule.id))
        .leftJoin(eventTable, eq(rewardTable.eventId, eventTable.id))
        .where(eq(rewardTable.participantId, participantId))
        .orderBy(desc(rewardTable.createdAt))
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      return {
        data: rewards.map((row) => ({
          ...row.reward,
          program: row.program,
          rewardRule: row.rewardRule,
          event: row.event,
        })),
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      };
    }),

  // Get reward statistics for a program
  getStatsByProgram: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input: programId }) => {
      // Verify program belongs to user's project
      const [program] = await ctx.db
        .select()
        .from(programTable)
        .where(
          and(
            eq(programTable.id, programId),
            eq(programTable.projectId, ctx.activeProjectId),
          ),
        )
        .limit(1);

      if (!program) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Program not found or does not belong to your project",
        });
      }

      // Get reward counts by status
      const statusCounts = await ctx.db
        .select({
          status: rewardTable.status,
          count: sql<number>`count(*)`,
          totalAmount: sql<number>`sum(cast(${rewardTable.amount} as decimal))`,
        })
        .from(rewardTable)
        .where(eq(rewardTable.programId, programId))
        .groupBy(rewardTable.status);

      // Get reward counts by type
      const typeCounts = await ctx.db
        .select({
          type: rewardTable.rewardType,
          count: sql<number>`count(*)`,
          totalAmount: sql<number>`sum(cast(${rewardTable.amount} as decimal))`,
        })
        .from(rewardTable)
        .where(eq(rewardTable.programId, programId))
        .groupBy(rewardTable.rewardType);

      // Calculate totals
      const totalRewards = statusCounts.reduce(
        (sum, curr) => sum + curr.count,
        0,
      );
      const totalAmount = statusCounts.reduce(
        (sum, curr) => sum + (curr.totalAmount || 0),
        0,
      );
      const totalDisbursed = statusCounts
        .filter((sc) => sc.status === "disbursed")
        .reduce((sum, curr) => sum + (curr.totalAmount || 0), 0);

      return {
        statusCounts: statusCounts.reduce(
          (acc, curr) => {
            acc[curr.status] = {
              count: curr.count,
              amount: curr.totalAmount || 0,
            };
            return acc;
          },
          {} as Record<string, { count: number; amount: number }>,
        ),
        typeCounts: typeCounts.map((tc) => ({
          type: tc.type,
          count: tc.count,
          amount: tc.totalAmount || 0,
        })),
        summary: {
          totalRewards,
          totalAmount,
          totalDisbursed,
          pendingAmount: totalAmount - totalDisbursed,
        },
      };
    }),
});
