import { z } from "zod";

export const AUTH_SESSION_SECONDS = 12 * 60 * 60;

export const ownerCredentialsSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email(),
  password: z
    .string()
    .min(14, "Sahip parolası en az 14 karakter olmalıdır.")
    .max(128),
});

export function buildAuthSecurityOptions(isProduction: boolean) {
  return {
    emailAndPassword: {
      enabled: true as const,
      disableSignUp: true,
      minPasswordLength: 14,
      maxPasswordLength: 128,
    },
    session: {
      expiresIn: AUTH_SESSION_SECONDS,
      disableSessionRefresh: true,
    },
    rateLimit: {
      enabled: true,
      storage: "database" as const,
      modelName: "rateLimit",
      window: 60,
      max: 100,
      customRules: {
        "/sign-in/email": {
          window: 15 * 60,
          max: 5,
        },
      },
    },
    advanced: {
      useSecureCookies: isProduction,
      cookiePrefix: "aklar",
      defaultCookieAttributes: {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax" as const,
        path: "/",
      },
    },
  };
}
