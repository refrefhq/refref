import "server-only";

import { createHydrationHelpers } from "@trpc/react-query/rsc";
import { headers } from "next/headers";
import { cache } from "react";

import { createCaller, type AppRouter } from "@/server/api/root";
import { createTRPCContext } from "@/server/api/trpc";
import { createQueryClient } from "./query-client";

/**
 * This wraps the `createTRPCContext` helper and provides the required context for the tRPC API when
 * handling a tRPC call from a React Server Component.
 */
const createContext = cache(async () => {
  const heads = new Headers(await headers());
  heads.set("x-trpc-source", "rsc");

  return createTRPCContext({
    headers: heads,
  });
});

const getQueryClient = cache(createQueryClient);
const caller = createCaller(createContext);

const helpers = createHydrationHelpers<AppRouter>(caller, getQueryClient);

// Type assertion to workaround tRPC v11 type inference issue
export const api = helpers.trpc as ReturnType<
  typeof createHydrationHelpers<AppRouter>
>["trpc"];
export const HydrateClient = helpers.HydrateClient;
