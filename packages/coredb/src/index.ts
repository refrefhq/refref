import { drizzle } from "drizzle-orm/postgres-js";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import postgres from "postgres";
import Database from "better-sqlite3";
import { initializeApp, getApps } from "firebase/app";
import { getFirestore, collection, doc, getDoc, setDoc, getDocs, query, where } from "firebase/firestore";
import * as schema from "./schema";

// Simple Firebase adapter that mimics Drizzle interface for development
class FirebaseAdapter {
  private firestore: any;
  
  constructor(firestore: any) {
    this.firestore = firestore;
  }
  
  // Mock Drizzle methods for development
  insert(table: any) {
    return {
      values: (data: any) => ({
        returning: () => Promise.resolve([data])
      })
    };
  }
  
  select() {
    return {
      from: (table: any) => ({
        where: (condition: any) => Promise.resolve([])
      })
    };
  }
  
  update(table: any) {
    return {
      set: (data: any) => ({
        where: (condition: any) => Promise.resolve([data])
      })
    };
  }
  
  delete(table: any) {
    return {
      where: (condition: any) => Promise.resolve([])
    };
  }
}

/**
 * Cache the database connections in development. This avoids creating a new connection on every HMR
 * update.
 */
const globalForDb = globalThis as unknown as {
  connections: Map<string, postgres.Sql>;
  sqliteConnections: Map<string, Database.Database>;
  firestoreConnections: Map<string, any>;
};

if (!globalForDb.connections) {
  globalForDb.connections = new Map();
}
if (!globalForDb.sqliteConnections) {
  globalForDb.sqliteConnections = new Map();
}
if (!globalForDb.firestoreConnections) {
  globalForDb.firestoreConnections = new Map();
}

/**
 * Creates a database connection with the provided URL
 * @param databaseUrl - The database connection string (PostgreSQL, SQLite, or Firebase)
 * @returns Database instance (Drizzle for SQL, Firebase for Firestore)
 */
export function createDb(databaseUrl: string) {
  const isDev = process.env.NODE_ENV !== "production";

  // Check if it's a Firebase URL (firebase: protocol)
  if (databaseUrl.startsWith("firebase:")) {
    const projectId = databaseUrl.replace("firebase:", "");
    
    if (isDev) {
      // In development, cache Firestore connections by project ID
      const cachedConn = globalForDb.firestoreConnections.get(projectId);
      if (cachedConn) {
        return cachedConn;
      } else {
        // Initialize Firebase app if not already initialized
        const app = getApps().length === 0 
          ? initializeApp({ projectId })
          : getApps()[0];
        
        const firestore = getFirestore(app);
        const adapter = new FirebaseAdapter(firestore);
        globalForDb.firestoreConnections.set(projectId, adapter);
        return adapter;
      }
    } else {
      // In production, create new Firestore connection
      const app = getApps().length === 0 
        ? initializeApp({ projectId })
        : getApps()[0];
      
      const firestore = getFirestore(app);
      return new FirebaseAdapter(firestore);
    }
  }
  // Check if it's a SQLite URL (file: protocol)
  else if (databaseUrl.startsWith("file:")) {
    const dbPath = databaseUrl.replace("file:", "");
    
    if (isDev) {
      // In development, cache SQLite connections by path
      const cachedConn = globalForDb.sqliteConnections.get(dbPath);
      if (cachedConn) {
        return drizzleSqlite(cachedConn, { schema });
      } else {
        const sqliteDb = new Database(dbPath);
        globalForDb.sqliteConnections.set(dbPath, sqliteDb);
        return drizzleSqlite(sqliteDb, { schema });
      }
    } else {
      // In production, create new SQLite connection
      const sqliteDb = new Database(dbPath);
      return drizzleSqlite(sqliteDb, { schema });
    }
  } else {
    // PostgreSQL connection
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
}

export type DBType = ReturnType<typeof createDb>;

// Export schema for direct imports
export * as schema from "./schema";
