import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db, schema } from "@/server/db";
import { and, ilike, or, eq } from "drizzle-orm";

const { participant, program } = schema;

export const searchRouter = createTRPCRouter({
  global: protectedProcedure
    .input(
      z.object({
        query: z.string().min(0).max(100),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { query } = input;
      const projectId = ctx.activeProjectId;

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
          .where(
            and(
              eq(participant.projectId, projectId),
              or(
                ilike(participant.email, searchPattern),
                ilike(participant.id, searchPattern),
                ilike(participant.name, searchPattern),
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
              eq(program.projectId, projectId),
              ilike(program.name, searchPattern),
            ),
          )
          .limit(5),
      ]);

      return {
        participants,
        programs,
      };
    }),
});
