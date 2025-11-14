import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { db, schema } from "@/server/db";
const { product, productSecrets } = schema;
import { eq, and } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

export const productSecretsRouter = createTRPCRouter({
  get: protectedProcedure.input(z.string()).query(async ({ ctx, input }) => {
    const [secrets] = await ctx.db
      .select()
      .from(productSecrets)
      .where(eq(productSecrets.productId, input))
      .limit(1);

    if (!secrets) {
      throw new TRPCError({
        code: "NOT_FOUND",
        message: "No secrets found for this product",
      });
    }

    // Verify product belongs to active organization
    const [productRecord] = await ctx.db
      .select()
      .from(product)
      .where(
        and(
          eq(product.id, secrets.productId),
          eq(product.id, ctx.activeProductId),
        ),
      )
      .limit(1);

    if (!productRecord) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Product does not belong to your organization",
      });
    }

    // Return client ID and client secret
    return {
      clientId: secrets.clientId,
      clientSecret: secrets.clientSecret,
    };
  }),
});
