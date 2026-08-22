import { NextResponse } from "next/server";
import { ZodError } from "zod";

import { OwnerAuthorizationError } from "@/lib/auth/authorization";
import {
  MediaInUseError,
  MediaLimitError,
  MediaNotFoundError,
  MediaVerificationError,
} from "@/lib/media/repository";
import {
  ProjectNotFoundError,
  ProjectPublishValidationError,
  ProjectVersionConflictError,
} from "@/lib/projects/repository";

export function adminErrorResponse(error: unknown) {
  if (error instanceof OwnerAuthorizationError) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }

  if (error instanceof ProjectNotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  if (error instanceof MediaNotFoundError) {
    return NextResponse.json({ error: error.message }, { status: 404 });
  }

  if (error instanceof MediaInUseError || error instanceof MediaLimitError) {
    return NextResponse.json({ error: error.message }, { status: 409 });
  }

  if (error instanceof MediaVerificationError) {
    return NextResponse.json({ error: error.message }, { status: 422 });
  }

  if (error instanceof ProjectVersionConflictError) {
    return NextResponse.json({ error: error.message, code: "VERSION_CONFLICT" }, { status: 409 });
  }

  if (error instanceof ProjectPublishValidationError) {
    return NextResponse.json(
      {
        error: error.message,
        code: "PUBLISH_REQUIREMENTS",
        issues: error.validation.flatten(),
      },
      { status: 422 },
    );
  }

  if (error instanceof ZodError) {
    return NextResponse.json(
      { error: "Gönderilen veri geçersiz.", issues: error.flatten() },
      { status: 400 },
    );
  }

  console.error("Admin API error", error);
  return NextResponse.json({ error: "İşlem tamamlanamadı." }, { status: 500 });
}
