import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "@/db/schema";

export const hasDatabase = Boolean(process.env.DATABASE_URL);

const sql = hasDatabase ? neon(process.env.DATABASE_URL!) : null;

export const db = sql ? drizzle(sql, { schema }) : null;

export function requireDb() {
  if (!db) {
    throw new Error("DATABASE_URL is required for database operations");
  }

  return db;
}
