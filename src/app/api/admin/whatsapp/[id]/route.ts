import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db/client";
import { auditLogs, whatsappAgents } from "@/db/schema";
import { requireOwner } from "@/lib/auth/dal";
import { adminErrorResponse } from "@/lib/http/admin-error";
import { whatsappAgentInputSchema } from "@/lib/validation/whatsapp";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const session = await requireOwner();
    const { id } = await context.params;
    const input = whatsappAgentInputSchema.parse(await request.json());
    const [agent] = await db.update(whatsappAgents).set({ ...input, updatedAt: new Date() }).where(eq(whatsappAgents.id, id)).returning();
    if (!agent) return NextResponse.json({ error: "Danışman bulunamadı." }, { status: 404 });
    await db.insert(auditLogs).values({ actorUserId: session.user.id, action: "whatsapp_agent.updated", entityType: "whatsapp_agent", entityId: id, metadata: {} });
    return NextResponse.json({ agent });
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export async function DELETE(_request: NextRequest, context: RouteContext) {
  try {
    const session = await requireOwner();
    const { id } = await context.params;
    const [agent] = await db.delete(whatsappAgents).where(eq(whatsappAgents.id, id)).returning({ id: whatsappAgents.id });
    if (!agent) return NextResponse.json({ error: "Danışman bulunamadı." }, { status: 404 });
    await db.insert(auditLogs).values({ actorUserId: session.user.id, action: "whatsapp_agent.deleted", entityType: "whatsapp_agent", entityId: id, metadata: {} });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
