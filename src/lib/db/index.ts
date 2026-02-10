import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL!;

// For edge environments (Next.js), use a single connection if possible
// or use the serverless driver if needed. Here we use postgres.js.
const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client, { schema });
