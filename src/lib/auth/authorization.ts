export class OwnerAuthorizationError extends Error {
  readonly status = 401;

  constructor() {
    super("Bu işlem için sahip oturumu gereklidir.");
    this.name = "OwnerAuthorizationError";
  }
}

type OwnerSessionLike = {
  session: { id: string };
  user: { id: string; email: string; role?: string | null };
};

export function assertOwnerSession<T extends OwnerSessionLike>(
  session: T | null | undefined,
): T {
  if (!session || session.user.role !== "owner") {
    throw new OwnerAuthorizationError();
  }

  return session;
}
