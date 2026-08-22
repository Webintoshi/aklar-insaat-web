import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/db/schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL ortam değişkeni tanımlı değil.");
}

const globalDatabase = globalThis as typeof globalThis & {
  aklarPostgres?: ReturnType<typeof postgres>;
};

const queryClient =
  globalDatabase.aklarPostgres ??
  postgres(databaseUrl, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
    onnotice: () => undefined,
  });

if (process.env.NODE_ENV !== "production") {
  globalDatabase.aklarPostgres = queryClient;
}

export const db = drizzle(queryClient, { schema });
export { queryClient };
