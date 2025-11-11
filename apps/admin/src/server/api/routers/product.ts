import { z } from "zod";
import {
  createTRPCRouter,
  onboardingProcedure,
  protectedProcedure,
} from "@/server/api/trpc";
import { schema } from "@/server/db";
const { product, productSecrets, productUser } = schema;
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

// Input validation schema for creating a product
const createProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  url: z.string().url({ message: "Invalid URL" }),
});

// Input validation schema for creating a product with onboarding data
export const createProductWithOnboardingSchema = z
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

// Input validation schema for updating product
const updateProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  url: z.string().url({ message: "Invalid URL" }),
});

export const productRouter = createTRPCRouter({
  create: onboardingProcedure
    .input(createProductSchema)
    .mutation(async ({ ctx, input }) => {
      // Get active organization from session
      const activeOrgId = ctx.activeOrganizationId;
      if (!activeOrgId) {
        throw new Error(
          "No active organization. Please create an organization first.",
        );
      }

      // Create the product within the organization
      const [newProduct] = await ctx.db
        .insert(product)
        .values({
          name: input.name,
          url: input.url,
          slug: slugGenerator(),
          orgId: activeOrgId,
        })
        .returning();

      assert(newProduct, "Product not created");

      // Generate and create product secrets
      const clientId = createId();
      const clientSecret = randomBytes(32).toString("hex");

      const [secrets] = await ctx.db
        .insert(productSecrets)
        .values({
          productId: newProduct.id,
          clientId,
          clientSecret,
        })
        .returning();

      assert(secrets, "Product secrets not created");

      return {
        ...newProduct,
        clientId: secrets.clientId,
        clientSecret: secrets.clientSecret, // Only returned once during creation
      };
    }),

  createWithOnboarding: onboardingProcedure
    .input(createProductWithOnboardingSchema)
    .mutation(async ({ ctx, input }) => {
      // Get active organization from session
      const activeOrgId = ctx.activeOrganizationId;
      if (!activeOrgId) {
        throw new Error(
          "No active organization. Please create an organization first.",
        );
      }

      // Create the product with onboarding data within the organization
      const [newProduct] = await ctx.db
        .insert(product)
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

      assert(newProduct, "Product not created");

      // Generate and create product secrets
      const clientId = createId();
      const clientSecret = randomBytes(32).toString("hex");

      const [secrets] = await ctx.db
        .insert(productSecrets)
        .values({
          productId: newProduct.id,
          clientId,
          clientSecret,
        })
        .returning();

      assert(secrets, "Product secrets not created");

      return {
        ...newProduct,
        clientId: secrets.clientId,
        clientSecret: secrets.clientSecret, // Only returned once during creation
      };
    }),

  // Get all products in the active organization
  getAll: protectedProcedure.query(async ({ ctx }) => {
    const products = await ctx.db
      .select()
      .from(product)
      .where(eq(product.orgId, ctx.activeOrganizationId));

    return products;
  }),

  // Get the first product in the active organization
  getCurrent: protectedProcedure.query(async ({ ctx }) => {
    const [firstProduct] = await ctx.db
      .select()
      .from(product)
      .where(eq(product.orgId, ctx.activeOrganizationId))
      .limit(1);

    if (!firstProduct) {
      throw new Error("No products found in your organization");
    }

    return firstProduct;
  }),

  // Get a specific product by ID
  getById: protectedProcedure
    .input(z.object({ productId: z.string() }))
    .query(async ({ ctx, input }) => {
      const [productData] = await ctx.db
        .select()
        .from(product)
        .where(
          and(
            eq(product.id, input.productId),
            eq(product.orgId, ctx.activeOrganizationId),
          ),
        )
        .limit(1);

      if (!productData) {
        throw new Error(
          "Product not found or does not belong to your organization",
        );
      }

      return productData;
    }),

  // Update product information
  update: protectedProcedure
    .input(
      updateProductSchema.extend({
        productId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [updatedProduct] = await ctx.db
        .update(product)
        .set({
          name: input.name,
          url: input.url,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(product.id, input.productId),
            eq(product.orgId, ctx.activeOrganizationId),
          ),
        )
        .returning();

      if (!updatedProduct) {
        throw new Error("Failed to update product or product not found");
      }

      return updatedProduct;
    }),
});
