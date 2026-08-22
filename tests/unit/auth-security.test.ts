import { describe, expect, it } from "vitest";

import {
  buildAuthSecurityOptions,
  ownerCredentialsSchema,
} from "@/lib/auth/security";

describe("ownerCredentialsSchema", () => {
  it("rejects owner passwords shorter than fourteen characters", () => {
    expect(
      ownerCredentialsSchema.safeParse({
        name: "Aklar İnşaat",
        email: "yonetim@example.com",
        password: "OnUcKarakter!",
      }).success,
    ).toBe(false);

    expect(
      ownerCredentialsSchema.safeParse({
        name: "Aklar İnşaat",
        email: "yonetim@example.com",
        password: "Guvenli-Parola-2026!",
      }).success,
    ).toBe(true);
  });
});

describe("buildAuthSecurityOptions", () => {
  it("keeps public registration closed and sessions hard-limited to twelve hours", () => {
    const options = buildAuthSecurityOptions(true);

    expect(options.emailAndPassword).toMatchObject({
      enabled: true,
      disableSignUp: true,
      minPasswordLength: 14,
    });
    expect(options.session).toMatchObject({
      expiresIn: 43_200,
      disableSessionRefresh: true,
    });
  });

  it("uses secure cookies and database-backed brute-force protection", () => {
    const options = buildAuthSecurityOptions(true);

    expect(options.advanced.defaultCookieAttributes).toMatchObject({
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });
    expect(options.advanced.database).toEqual({ generateId: "uuid" });
    expect(options.rateLimit).toMatchObject({
      enabled: true,
      storage: "database",
      customRules: {
        "/sign-in/email": { window: 900, max: 5 },
      },
    });
  });
});

