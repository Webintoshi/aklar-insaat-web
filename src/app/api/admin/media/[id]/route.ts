import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireOwner } from "@/lib/auth/dal";
import { adminErrorResponse } from "@/lib/http/admin-error";
import { enqueueMediaDeletion } from "@/lib/media/repository";

const mediaIdSchema = z.uuid();

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireOwner();
    const id = mediaIdSchema.parse((await params).id);
    const job = await enqueueMediaDeletion(session.user.id, id);
    return NextResponse.json({ job }, { status: 202 });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
