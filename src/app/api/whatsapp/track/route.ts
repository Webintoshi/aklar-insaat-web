import { createHmac } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/db/client";
import { whatsappClickEvents } from "@/db/schema";

const inputSchema = z.object({
  agentId: z.uuid(),
  pagePath: z.string().startsWith("/").max(500),
  referrer: z.string().max(2_000).nullable().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const input = inputSchema.parse(await request.json());
    const ip =
      request.headers.get("cf-connecting-ip") ??
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      "unknown";
    const secret = process.env.IP_HASH_SECRET;
    if (!secret) throw new Error("IP_HASH_SECRET ortam değişkeni tanımlı değil.");

    await db.insert(whatsappClickEvents).values({
      agentId: input.agentId,
      pagePath: input.pagePath,
      referrer: input.referrer,
      ipHash: createHmac("sha256", secret).update(ip).digest("hex"),
      userAgent: request.headers.get("user-agent"),
    });
    return new NextResponse(null, { status: 204 });
  } catch {
    return new NextResponse(null, { status: 204 });
  }
}
