import { NextRequest, NextResponse } from "next/server";

import { requireOwner } from "@/lib/auth/dal";
import { adminErrorResponse } from "@/lib/http/admin-error";
import { reserveMediaUpload } from "@/lib/media/repository";
import { mediaPresignSchema } from "@/lib/validation/media";

export async function POST(request: NextRequest) {
  try {
    const session = await requireOwner();
    const input = mediaPresignSchema.parse(await request.json());
    const upload = await reserveMediaUpload(session.user.id, input);
    return NextResponse.json(upload, { status: 201 });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
