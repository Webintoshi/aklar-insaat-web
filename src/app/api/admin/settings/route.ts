import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db/client";
import { auditLogs, siteSettings } from "@/db/schema";
import { requireOwner } from "@/lib/auth/dal";
import { adminErrorResponse } from "@/lib/http/admin-error";

const inputSchema = z.object({
  key: z.enum(["seo", "site"]),
  value: z.record(z.string(), z.unknown()),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireOwner();
    const input = inputSchema.parse(await request.json());
    const now = new Date();
    const [setting] = await db
      .insert(siteSettings)
      .values({ ...input, updatedAt: now })
      .onConflictDoUpdate({
        target: siteSettings.key,
        set: { value: input.value, updatedAt: now },
      })
      .returning();
    await db.insert(auditLogs).values({
      actorUserId: session.user.id,
      action: "settings.updated",
      entityType: "site_setting",
      entityId: input.key,
      metadata: {},
    });
    return NextResponse.json({ setting });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
