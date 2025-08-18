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

const slugGenerator = init({
  length: 7,
});

// Input validation schema for creating a project
const createProjectSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  url: z.string().url({ message: "Invalid URL" }),
});

// Input validation schema for creating a project with onboarding data
const createProjectWithOnboardingSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  url: z.string().url({ message: "Invalid URL" }),
  appType: z.enum(appTypes),
  paymentProvider: z.enum(paymentProviders),
  otherPaymentProvider: z.string().optional(),
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
});
