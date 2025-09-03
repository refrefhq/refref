import { z } from "zod";
import { createTRPCRouter, onboardingProcedure } from "@/server/api/trpc";
import { schema } from "@/server/db";
const { project, projectSecrets, projectUser } = schema;
import assert from "assert";
import { createId, init } from "@paralleldrive/cuid2";
import { randomBytes } from "crypto";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { appTypes, paymentProviders } from "@/lib/validations/onboarding";
import { eq } from "drizzle-orm";

const slugGenerator = init({
  length: 7,
});

// Input validation schema for creating a project
const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  url: z.string().url({ message: "Invalid URL" }),
});

// Input validation schema for creating a project with onboarding data
export const createProjectWithOnboardingSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(100, "Name is too long"),
    url: z.string().min(1, "URL is required"),
    appType: z.enum(appTypes),
    paymentProvider: z.enum(paymentProviders),
    otherPaymentProvider: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.paymentProvider === "other") {
        return (
          data.otherPaymentProvider &&
          data.otherPaymentProvider.trim().length > 0
        );
      }
      return true;
    },
    {
      message: "Please specify your payment provider",
      path: ["otherPaymentProvider"],
    },
  );

// Input validation schema for updating project
const updateProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  url: z.string().url({ message: "Invalid URL" }),
});

export const projectRouter = createTRPCRouter({
  create: onboardingProcedure
    .input(createProjectSchema)
    .mutation(async ({ ctx, input }) => {
      // Create the project
      const [newProject] = await ctx.db
        .insert(project)
        .values({
          name: input.name,
          url: input.url,
          slug: slugGenerator(),
        })
        .returning();

      assert(newProject, "Project not created");

      // add membership to the project
      await ctx.db.insert(projectUser).values({
        projectId: newProject.id,
        userId: ctx.userId,
        role: "owner",
      });

      await auth.api.setActiveOrganization({
        body: {
          organizationId: newProject.id,
        },
        headers: await headers(),
      });

      // Generate and create project secrets
      const clientId = createId();
      const clientSecret = randomBytes(32).toString("hex");

      const [secrets] = await ctx.db
        .insert(projectSecrets)
        .values({
          projectId: newProject.id,
          clientId,
          clientSecret,
        })
        .returning();

      assert(secrets, "Project secrets not created");

      return {
        ...newProject,
        clientId: secrets.clientId,
        clientSecret: secrets.clientSecret, // Only returned once during creation
      };
    }),

  createWithOnboarding: onboardingProcedure
    .input(createProjectWithOnboardingSchema)
    .mutation(async ({ ctx, input }) => {
      // Create the project with onboarding data
      const [newProject] = await ctx.db
        .insert(project)
        .values({
          name: input.name,
          url: input.url,
          slug: slugGenerator(),
          appType: input.appType,
          paymentProvider:
            input.paymentProvider === "other"
              ? input.otherPaymentProvider || "other"
              : input.paymentProvider,
          onboardingCompleted: true,
          onboardingStep: 4,
        })
        .returning();

      assert(newProject, "Project not created");

      // add membership to the project
      await ctx.db.insert(projectUser).values({
        projectId: newProject.id,
        userId: ctx.userId,
        role: "owner",
      });

      await auth.api.setActiveOrganization({
        body: {
          organizationId: newProject.id,
        },
        headers: await headers(),
      });

      // Generate and create project secrets
      const clientId = createId();
      const clientSecret = randomBytes(32).toString("hex");

      const [secrets] = await ctx.db
        .insert(projectSecrets)
        .values({
          projectId: newProject.id,
          clientId,
          clientSecret,
        })
        .returning();

      assert(secrets, "Project secrets not created");

      return {
        ...newProject,
        clientId: secrets.clientId,
        clientSecret: secrets.clientSecret, // Only returned once during creation
      };
    }),

  // Get current project data
  getCurrent: onboardingProcedure.query(async ({ ctx }) => {
    if (!ctx.activeProjectId) {
      throw new Error("No active project");
    }

    const currentProject = await ctx.db
      .select()
      .from(project)
      .where(eq(project.id, ctx.activeProjectId))
      .limit(1);

    if (!currentProject.length) {
      throw new Error("Project not found");
    }

    return currentProject[0];
  }),

  // Update project information
  update: onboardingProcedure
    .input(updateProjectSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.activeProjectId) {
        throw new Error("No active project");
      }

      const [updatedProject] = await ctx.db
        .update(project)
        .set({
          name: input.name,
          url: input.url,
          updatedAt: new Date(),
        })
        .where(eq(project.id, ctx.activeProjectId))
        .returning();

      if (!updatedProject) {
        throw new Error("Failed to update project");
      }

      return updatedProject;
    }),
});
