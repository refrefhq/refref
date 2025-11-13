/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - This is where all the tRPC server stuff is created and plugged in. The pieces you will
 * need to use are documented accordingly near the end.
 */
import { initTRPC, TRPCError } from "@trpc/server";
import superjson from "superjson";
import { ZodError } from "zod";

import { db, schema } from "@/server/db";
import { logger } from "@/lib/logger";
import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { eq } from "drizzle-orm";

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things when processing a request, like the database, the session, etc.
 *
 * This helper generates the "internals" for a tRPC context. The API handler and RSC clients each
 * wrap this and provides the required context.
 *
 * @see https://trpc.io/docs/server/context
 */

export const createTRPCContext = async (opts: { headers: Headers }) => {
  const { headers } = opts;
  const session = await auth.api.getSession({
    headers,
  });
  const organizationUser = await auth.api.getActiveMember({
    headers,
  });

  // Get the active product for the active organization (one product per org for now)
  let activeProductId: string | null = null;
  if (session?.session?.activeOrganizationId) {
    const product = await db.query.product.findFirst({
      where: eq(schema.product.orgId, session.session.activeOrganizationId),
    });
    activeProductId = product?.id ?? null;
  }

  return {
    db,
    headers,
    session: session?.session,
    activeOrganizationId: session?.session?.activeOrganizationId,
    organizationUserId: organizationUser?.id,
    organizationUserRole: organizationUser?.role as
      | "owner"
      | "admin"
      | "member",
    activeProductId,
    userId: session?.user?.id,
    logger: logger,
  };
};

/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */
const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    console.error(error);
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these a lot in the
 * "/src/server/api/routers" directory.
 */

/**
 * This is how you create new routers and sub-routers in your tRPC API.
 *
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Middleware for timing procedure execution and adding an artificial delay in development.
 *
 * You can remove this if you don't like it, but it can help catch unwanted waterfalls by simulating
 * network latency that would occur in production but not in local development.
 */
const timingMiddleware = t.middleware(async ({ next, path }) => {
  const start = Date.now();

  if (t._config.isDev) {
    // artificial delay in dev
    const waitMs = Math.floor(Math.random() * 400) + 100;
    await new Promise((resolve) => setTimeout(resolve, waitMs));
  }

  const result = await next();

  const end = Date.now();
  console.log(`[TRPC] ${path} took ${end - start}ms to execute`);

  return result;
});

/**
 * Public (unauthenticated) procedure
 *
 * This is the base piece you use to build new queries and mutations on your tRPC API. It does not
 * guarantee that a user querying is authorized, but you can still access user session data if they
 * are logged in.
 */
export const publicProcedure = t.procedure.use(timingMiddleware);

//! these require the presence of a session
export const onboardingProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session || !ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return next({
    ctx: {
      session: ctx.session,
      userId: ctx.userId,
    },
  });
});

//! these require the presence of an active organization id and active product
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  console.error("ctx is ", ctx.session);
  // check both cause ts :)
  if (!ctx.session || !ctx.userId) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  if (!ctx.activeOrganizationId || !ctx.organizationUserId) {
    throw new TRPCError({ code: "FORBIDDEN" });
  }
  if (!ctx.activeProductId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "No product found. Please complete onboarding.",
    });
  }

  return next({
    ctx: {
      session: ctx.session,
      activeOrganizationId: ctx.activeOrganizationId,
      organizationUserId: ctx.organizationUserId,
      organizationUserRole: ctx.organizationUserRole,
      activeProductId: ctx.activeProductId,
      userId: ctx.userId,
    },
  });
});
