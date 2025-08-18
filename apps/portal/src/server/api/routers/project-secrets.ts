import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db, schema } from "@/server/db";
const { project, projectSecrets } = schema;
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { createId } from "@paralleldrive/cuid2";
import { randomBytes } from "crypto";

export const projectSecretsRouter = createTRPCRouter({
  get: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const [secrets] = await ctx.db
      .select()
      .from(projectSecrets)
      .where(eq(projectSecrets.projectId, input))
      .limit(1);

    if (!secrets) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No secrets found for this project",
      });
    }

    // Verify project belongs to active organization
    const [projectRecord] = await ctx.db
      .select()
      .from(project)
      .where(
        and(
          eq(project.id, secrets.projectId),
          eq(project.id, ctx.activeProjectId),
        ),
      )
      .limit(1);

    if (!projectRecord) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Project does not belong to your organization",
      });
    }

    // Return only the client ID
    return {
      clientId: secrets.clientId,
    };
  }),
});
