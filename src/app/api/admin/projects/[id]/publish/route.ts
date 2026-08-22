import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireOwner } from "@/lib/auth/dal";
import { adminErrorResponse } from "@/lib/http/admin-error";
import { publishProject } from "@/lib/projects/repository";

const projectIdSchema = z.uuid();

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireOwner();
    const id = projectIdSchema.parse((await params).id);
    const project = await publishProject(id, session.user.id);
    return NextResponse.json({ project });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
