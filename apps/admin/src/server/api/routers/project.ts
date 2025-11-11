import { z } from "zod";
import {
  createTRPCRouter,
  onboardingProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { schema } from "@/server/db";
const { project, projectSecrets, projectUser } = schema;
import assert from "assert";
import { createId, init } from "@paralleldrive/cuid2";
import { randomBytes } from "crypto";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { appTypes, paymentProviders } from "@/lib/validations/onboarding";
import { and, eq } from "drizzle-orm";

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
      // Get active organization from session
      const activeOrgId = ctx.activeOrganizationId;
      if (!activeOrgId) {
        throw new Error(
          "No active organization. Please create an organization first.",
        );
      }

      // Create the project within the organization
      const [newProject] = await ctx.db
        .insert(project)
        .values({
          name: input.name,
          url: input.url,
          slug: slugGenerator(),
          orgId: activeOrgId,
        })
        .returning();

      assert(newProject, "Project not created");

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
      // Get active organization from session
      const activeOrgId = ctx.activeOrganizationId;
      if (!activeOrgId) {
        throw new Error(
          "No active organization. Please create an organization first.",
        );
      }

      // Create the project with onboarding data within the organization
      const [newProject] = await ctx.db
        .insert(project)
        .values({
          name: input.name,
          url: input.url,
          slug: slugGenerator(),
          orgId: activeOrgId,
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

  // Get all projects in the active organization
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const projects = await ctx.db
      .select()
      .from(project)
      .where(eq(project.orgId, ctx.activeOrganizationId));

    return projects;
  }),

  // Get the first project in the active organization
  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    const [firstProject] = await ctx.db
      .select()
      .from(project)
      .where(eq(project.orgId, ctx.activeOrganizationId))
      .limit(1);

    if (!firstProject) {
      throw new Error("No projects found in your organization");
    }

    return firstProject;
  }),

  // Get a specific project by ID
  getById: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [projectData] = await ctx.db
        .select()
        .from(project)
        .where(
          and(
            eq(project.id, input.projectId),
            eq(project.orgId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);

      if (!projectData) {
        throw new Error(
          "Project not found or does not belong to your organization",
        );
      }

      return projectData;
    }),

  // Update project information
  update: protectedProcedure
    .input(
      updateProjectSchema.extend({
        projectId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updatedProject] = await ctx.db
        .update(project)
        .set({
          name: input.name,
          url: input.url,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(project.id, input.projectId),
            eq(project.orgId, ctx.activeOrganizationId),
          ),
        )
        .returning();

      if (!updatedProject) {
        throw new Error("Failed to update project or project not found");
      }

      return updatedProject;
    }),
});
