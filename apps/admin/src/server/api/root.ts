import { postRouter } from "@/server/api/routers/post";
import { programRouter } from "@/server/api/routers/program";
import { programTemplateRouter } from "@/server/api/routers/program-template";
import { productRouter } from "@/server/api/routers/product";
import { productSecretsRouter } from "@/server/api/routers/product-secrets";
import { referralRouter } from "@/server/api/routers/referral";
import { participantsRouter } from "@/server/api/routers/participants";
import { rewardsRouter } from "@/server/api/routers/rewards";
import { eventsRouter } from "@/server/api/routers/events";
import { rewardRulesRouter } from "@/server/api/routers/reward-rules";
import { userRouter } from "@/server/api/routers/user";
import { productMembersRouter } from "@/server/api/routers/product-members";
import { searchRouter } from "@/server/api/routers/search";
import { analyticsRouter } from "@/server/api/routers/analytics";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  post: postRouter,
  program: programRouter,
  programTemplate: programTemplateRouter,
  product: productRouter,
  productSecrets: productSecretsRouter,
  referral: referralRouter,
  participants: participantsRouter,
  rewards: rewardsRouter,
  events: eventsRouter,
  rewardRules: rewardRulesRouter,
  user: userRouter,
  productMembers: productMembersRouter,
  search: searchRouter,
  analytics: analyticsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
