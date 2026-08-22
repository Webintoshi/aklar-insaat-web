import { describe, expect, it } from "vitest";

import {
  OwnerAuthorizationError,
  assertOwnerSession,
} from "@/lib/auth/authorization";

const ownerSession = {
  session: { id: "session-id" },
  user: { id: "owner-id", email: "yonetim@example.com", role: "owner" },
};

describe("assertOwnerSession", () => {
  it("accepts only an authenticated owner session", () => {
    expect(assertOwnerSession(ownerSession)).toBe(ownerSession);
  });

  it("rejects missing and non-owner sessions", () => {
    expect(() => assertOwnerSession(null)).toThrow(OwnerAuthorizationError);
    expect(() =>
      assertOwnerSession({
        ...ownerSession,
        user: { ...ownerSession.user, role: "none" },
      }),
    ).toThrow(OwnerAuthorizationError);
  });
});
