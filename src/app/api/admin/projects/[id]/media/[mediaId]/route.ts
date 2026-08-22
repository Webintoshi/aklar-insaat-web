import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireOwner } from "@/lib/auth/dal";
import { adminErrorResponse } from "@/lib/http/admin-error";
import { detachProjectMedia, moveProjectMedia } from "@/lib/projects/repository";

type RouteContext = { params: Promise<{ id: string; mediaId: string }> };
const idSchema = z.uuid();
const moveSchema = z.object({ direction: z.union([z.literal(-1), z.literal(1)]) });

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireOwner();
    const params = await context.params;
    const input = moveSchema.parse(await request.json());
    const link = await moveProjectMedia(idSchema.parse(params.id), idSchema.parse(params.mediaId), input.direction, session.user.id);
    return NextResponse.json({ link });
  } catch (error) { return adminErrorResponse(error); }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const session = await requireOwner();
    const params = await context.params;
    await detachProjectMedia(idSchema.parse(params.id), idSchema.parse(params.mediaId), session.user.id);
    return new NextResponse(null, { status: 204 });
  } catch (error) { return adminErrorResponse(error); }
}
