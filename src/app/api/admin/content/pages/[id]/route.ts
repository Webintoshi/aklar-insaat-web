import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db/client";
import { auditLogs, contentPages } from "@/db/schema";
import { requireOwner } from "@/lib/auth/dal";
import { adminErrorResponse } from "@/lib/http/admin-error";

const inputSchema = z.object({
  title: z.string().trim().min(2).max(200),
  excerpt: z.string().trim().max(500).nullable(),
  body: z.string().max(100_000),
  status: z.enum(["draft", "published", "archived"]),
  seoTitle: z.string().trim().max(70).nullable(),
  seoDescription: z.string().trim().max(170).nullable(),
});

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireOwner();
    const { id } = await context.params;
    const input = inputSchema.parse(await request.json());
    const [page] = await db.update(contentPages).set({
      ...input,
      publishedAt: input.status === "published" ? new Date() : null,
      updatedAt: new Date(),
    }).where(eq(contentPages.id, id)).returning();
    if (!page) return NextResponse.json({ error: "İçerik sayfası bulunamadı." }, { status: 404 });
    await db.insert(auditLogs).values({ actorUserId: session.user.id, action: "content_page.updated", entityType: "content_page", entityId: id, metadata: { status: input.status } });
    return NextResponse.json({ page });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
