import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

export const hasDatabase = Boolean(process.env.DATABASE_URL);

let database: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  if (!hasDatabase) return null;
  if (!database) {
    database = drizzle(neon(process.env.DATABASE_URL!), { schema });
  }
  return database;
}

export function requireDb() {
  const database = getDb();
  if (!database) {
    throw new Error("DATABASE_URL is required for database operations");
  }
  return database;
}