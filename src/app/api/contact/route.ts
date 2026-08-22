import { createHmac } from "node:crypto";

import { and, count, eq, gte } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db/client";
import { auditLogs, contactMessages } from "@/db/schema";
import { contactRequestSchema } from "@/lib/validation/contact";

const WINDOW_MINUTES = 15;
const MAX_MESSAGES_PER_WINDOW = 5;

function requestIp(request: NextRequest) {
  return (
    request.headers.get("cf-connecting-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

function hashIp(ip: string) {
  const secret = process.env.IP_HASH_SECRET;
  if (!secret) throw new Error("IP_HASH_SECRET ortam değişkeni tanımlı değil.");
  return createHmac("sha256", secret).update(ip).digest("hex");
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    if (
      typeof body === "object" &&
      body !== null &&
      "company" in body &&
      typeof body.company === "string" &&
      body.company.length > 0
    ) {
      return new NextResponse(null, { status: 204 });
    }

    const input = contactRequestSchema.parse(body);
    const ipHash = hashIp(requestIp(request));
    const windowStart = new Date(Date.now() - WINDOW_MINUTES * 60 * 1000);
    const [recent] = await db
      .select({ value: count() })
      .from(contactMessages)
      .where(
        and(
          eq(contactMessages.ipHash, ipHash),
          gte(contactMessages.createdAt, windowStart),
        ),
      );

    if (recent.value >= MAX_MESSAGES_PER_WINDOW) {
      return NextResponse.json(
        { error: "Çok fazla mesaj gönderildi. Lütfen daha sonra tekrar deneyin." },
        { status: 429, headers: { "Retry-After": String(WINDOW_MINUTES * 60) } },
      );
    }

    const [message] = await db
      .insert(contactMessages)
      .values({
        name: input.name,
        email: input.email.toLowerCase(),
        phone: input.phone || null,
        subject: input.subject || null,
        message: input.message,
        ipHash,
      })
      .returning({ id: contactMessages.id });
    await db.insert(auditLogs).values({
      action: "contact.received",
      entityType: "contact_message",
      entityId: message.id,
      metadata: {},
      ipHash,
    });

    return NextResponse.json(
      { id: message.id, message: "Mesajınız başarıyla alındı." },
      { status: 201 },
    );
  } catch (error) {
    if (error && typeof error === "object" && "issues" in error) {
      return NextResponse.json({ error: "Form alanlarını kontrol edin." }, { status: 400 });
    }
    console.error("Contact API error", error);
    return NextResponse.json({ error: "Mesaj gönderilemedi." }, { status: 500 });
  }
}
