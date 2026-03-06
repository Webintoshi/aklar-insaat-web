import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_CATEGORIES = ["about", "exterior", "interior", "location"];

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    const projectId = body.project_id || body.projectId;
    const url = body.url || body.publicUrl;
    const r2Key = body.r2_key || body.r2Key || (typeof url === "string" ? url.replace(/^https?:\/\/[^/]+\//, "") : null);
    const category = body.category;
    const sortOrder = Number.isFinite(body.sort_order) ? body.sort_order : Number.isFinite(body.sortOrder) ? body.sortOrder : 0;

    if (!projectId || !url || !category) {
      return NextResponse.json(
        { error: "project_id/projectId, url/publicUrl ve category zorunludur" },
        { status: 400 }
      );
    }

    if (!ALLOWED_CATEGORIES.includes(category)) {
      return NextResponse.json({ error: "Gecersiz kategori" }, { status: 400 });
    }

    const insertPayload: Record<string, unknown> = {
      project_id: projectId,
      url,
      r2_key: r2Key,
      category,
      sort_order: sortOrder,
    };

    if (body.file_name) insertPayload.file_name = body.file_name;
    if (body.fileName) insertPayload.file_name = body.fileName;
    if (body.file_size) insertPayload.file_size = body.file_size;
    if (body.fileSize) insertPayload.file_size = body.fileSize;
    if (body.width) insertPayload.width = body.width;
    if (body.height) insertPayload.height = body.height;
    if (body.alt_text) insertPayload.alt_text = body.alt_text;
    if (body.altText) insertPayload.alt_text = body.altText;

    const { data, error } = await supabase
      .from("project_media")
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      console.error("Media insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Media POST error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
