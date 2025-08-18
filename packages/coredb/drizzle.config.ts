import { type Config } from "drizzle-kit";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is required for migrations",
  );
}

export default {
  schema: "./src/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
} satisfies Config;
