import { asc, count } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db/client";
import { auditLogs, whatsappAgents, whatsappClickEvents } from "@/db/schema";
import { requireOwner } from "@/lib/auth/dal";
import { adminErrorResponse } from "@/lib/http/admin-error";
import { whatsappAgentInputSchema } from "@/lib/validation/whatsapp";

export async function GET() {
  try {
    await requireOwner();
    const [agents, [{ totalClicks }]] = await Promise.all([
      db.select().from(whatsappAgents).orderBy(asc(whatsappAgents.position)),
      db.select({ totalClicks: count() }).from(whatsappClickEvents),
    ]);
    return NextResponse.json({ agents, totalClicks });
  } catch (error) {
    return adminErrorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireOwner();
    const input = whatsappAgentInputSchema.parse(await request.json());
    const [agent] = await db.insert(whatsappAgents).values(input).returning();
    await db.insert(auditLogs).values({
      actorUserId: session.user.id,
      action: "whatsapp_agent.created",
      entityType: "whatsapp_agent",
      entityId: agent.id,
      metadata: {},
    });
    return NextResponse.json({ agent }, { status: 201 });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
