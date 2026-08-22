import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireOwner } from "@/lib/auth/dal";
import { adminErrorResponse } from "@/lib/http/admin-error";
import { getAdminProject, updateProject } from "@/lib/projects/repository";
import { projectPatchSchema } from "@/lib/validation/project";

const projectIdSchema = z.uuid();

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireOwner();
    const id = projectIdSchema.parse((await params).id);
    const project = await getAdminProject(id);
    return NextResponse.json({ project });
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireOwner();
    const id = projectIdSchema.parse((await params).id);
    const input = projectPatchSchema.parse(await request.json());
    const project = await updateProject(id, session.user.id, input);
    return NextResponse.json({ project });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
