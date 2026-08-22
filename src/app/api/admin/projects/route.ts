import { NextRequest, NextResponse } from "next/server";

import { requireOwner } from "@/lib/auth/dal";
import { adminErrorResponse } from "@/lib/http/admin-error";
import { createProjectDraft, listAdminProjects } from "@/lib/projects/repository";
import { createProjectDraftSchema } from "@/lib/validation/project";

export async function GET() {
  try {
    await requireOwner();
    const projects = await listAdminProjects();
    return NextResponse.json({ projects });
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireOwner();
    const input = createProjectDraftSchema.parse(await request.json());
    const project = await createProjectDraft(session.user.id, input.projectType);
    return NextResponse.json({ project }, { status: 201 });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
