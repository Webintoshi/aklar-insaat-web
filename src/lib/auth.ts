import "server-only";

import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth/minimal";

import { db } from "@/db/client";
import * as schema from "@/db/schema";
import { buildAuthSecurityOptions } from "@/lib/auth/security";

const baseURL =
  process.env.BETTER_AUTH_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  "http://localhost:3000";
const secret = process.env.BETTER_AUTH_SECRET;

if (!secret) {
  throw new Error("BETTER_AUTH_SECRET ortam değişkeni tanımlı değil.");
}

const trustedOrigins = [
  "https://orduaklarinsaat.com",
  "https://www.orduaklarinsaat.com",
  ...(process.env.NODE_ENV === "production" ? [] : ["http://localhost:3000"]),
];

export const auth = betterAuth({
  appName: "Aklar İnşaat Yönetim",
  baseURL,
  secret,
  trustedOrigins,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  user: {
    additionalFields: {
      role: {
        type: ["none", "owner"],
        required: true,
        defaultValue: "none",
        input: false,
      },
    },
  },
  ...buildAuthSecurityOptions(process.env.NODE_ENV === "production"),
});

export type AuthSession = typeof auth.$Infer.Session;
