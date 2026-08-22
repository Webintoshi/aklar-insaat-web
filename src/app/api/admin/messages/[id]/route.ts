import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db/client";
import { auditLogs, contactMessages } from "@/db/schema";
import { requireOwner } from "@/lib/auth/dal";
import { adminErrorResponse } from "@/lib/http/admin-error";

const paramsSchema = z.object({ id: z.uuid() });
const inputSchema = z.object({ status: z.enum(["unread", "read", "archived"]) });

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireOwner();
    const { id } = paramsSchema.parse(await params);
    const input = inputSchema.parse(await request.json());
    const now = new Date();
    const [message] = await db
      .update(contactMessages)
      .set({
        status: input.status,
        readAt: input.status === "read" ? now : null,
        archivedAt: input.status === "archived" ? now : null,
        updatedAt: now,
      })
      .where(eq(contactMessages.id, id))
      .returning();

    if (!message) {
      return NextResponse.json({ error: "Mesaj bulunamadı." }, { status: 404 });
    }
    await db.insert(auditLogs).values({
      actorUserId: session.user.id,
      action: "contact.status_changed",
      entityType: "contact_message",
      entityId: id,
      metadata: { status: input.status },
    });

    return NextResponse.json({ message });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
