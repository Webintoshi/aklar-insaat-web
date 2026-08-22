import "server-only";

import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { auth, type AuthSession } from "@/lib/auth";
import { assertOwnerSession } from "@/lib/auth/authorization";

export async function getOwnerSession(): Promise<AuthSession | null> {
  const session = await auth.api.getSession({ headers: await headers() });

  try {
    return assertOwnerSession(session);
  } catch {
    return null;
  }
}

export async function requireOwner(): Promise<AuthSession> {
  const session = await auth.api.getSession({ headers: await headers() });
  return assertOwnerSession(session);
}

export async function requireOwnerPage(): Promise<AuthSession> {
  const session = await getOwnerSession();

  if (!session) {
    redirect("/auth/login");
  }

  return session;
}
