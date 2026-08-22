import { timingSafeEqual } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { processPendingStorageDeletions } from "@/lib/media/repository";

function validBearerToken(request: NextRequest) {
  const expected = process.env.INTERNAL_CRON_SECRET;
  const authorization = request.headers.get("authorization");
  const received = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";

  if (!expected || received.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(received), Buffer.from(expected));
}

export async function POST(request: NextRequest) {
  if (!validBearerToken(request)) {
    return NextResponse.json({ error: "Yetkisiz." }, { status: 401 });
  }

  const results = await processPendingStorageDeletions();
  return NextResponse.json({ processed: results.length, results });
}
