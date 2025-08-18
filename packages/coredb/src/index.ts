import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Cache the database connections in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  connections: Map<string, postgres.Sql>;
};

if (!globalForDb.connections) {
  globalForDb.connections = new Map();
}

/**
 * Creates a database connection with the provided URL
 * @param databaseUrl - The PostgreSQL connection string
 * @returns Drizzle database instance
 */
export function createDb(databaseUrl: string) {
  const isDev = process.env.NODE_ENV !== "production";

  let conn: postgres.Sql;

  if (isDev) {
    // In development, cache connections by URL
    const cachedConn = globalForDb.connections.get(databaseUrl);
    if (cachedConn) {
      conn = cachedConn;
    } else {
      conn = postgres(databaseUrl);
      globalForDb.connections.set(databaseUrl, conn);
    }
  } else {
    // In production, create new connection
    conn = postgres(databaseUrl);
  }

  return drizzle(conn, { schema });
}

export type DBType = ReturnType<typeof createDb>;

// Export schema for direct imports
export * as schema from "./schema";
