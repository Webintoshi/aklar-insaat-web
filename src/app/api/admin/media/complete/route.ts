import { NextRequest, NextResponse } from "next/server";

import { requireOwner } from "@/lib/auth/dal";
import { adminErrorResponse } from "@/lib/http/admin-error";
import { completeMediaUpload } from "@/lib/media/repository";
import { mediaCompleteSchema } from "@/lib/validation/media";

export async function POST(request: NextRequest) {
  try {
    const session = await requireOwner();
    const input = mediaCompleteSchema.parse(await request.json());
    const media = await completeMediaUpload(session.user.id, input);
    return NextResponse.json(media);
  } catch (error) {
    return adminErrorResponse(error);
  }
}
