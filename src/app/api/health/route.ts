import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

import { db } from "@/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1 as healthy`);
    return NextResponse.json({ status: "healthy", database: "healthy" });
  } catch {
    return NextResponse.json(
      { status: "unhealthy", database: "unavailable" },
      { status: 503 },
    );
  }
}
