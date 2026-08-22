import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db/client";
import { auditLogs, siteSections } from "@/db/schema";
import { requireOwner } from "@/lib/auth/dal";
import { adminErrorResponse } from "@/lib/http/admin-error";

const inputSchema = z.object({
  name: z.string().trim().min(1).max(160),
  status: z.enum(["draft", "published", "archived"]),
  content: z.record(z.string(), z.unknown()),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireOwner();
    const id = z.uuid().parse((await params).id);
    const input = inputSchema.parse(await request.json());
    const now = new Date();
    const [section] = await db
      .update(siteSections)
      .set({
        ...input,
        publishedAt: input.status === "published" ? now : null,
        updatedAt: now,
      })
      .where(eq(siteSections.id, id))
      .returning();
    if (!section) return NextResponse.json({ error: "Bölüm bulunamadı." }, { status: 404 });
    await db.insert(auditLogs).values({
      actorUserId: session.user.id,
      action: "content.section_updated",
      entityType: "site_section",
      entityId: id,
      metadata: { status: input.status, sectionKey: section.sectionKey },
    });
    return NextResponse.json({ section });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
