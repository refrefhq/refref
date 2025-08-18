import { createDb } from "@refref/coredb";
import { env } from "@/env";

export const db = createDb(env.DATABASE_URL);
export { schema } from "@refref/coredb";
export type { DBType } from "@refref/coredb";
