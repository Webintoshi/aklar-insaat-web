import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const PROJECT_UPDATE_FIELDS = [
  "name",
  "title",
  "slug",
  "description",
  "about_text",
  "about_image_url",
  "status",
  "project_status",
  "location",
  "neighborhood",
  "location_description",
  "completion_date",
  "cta_text",
  "apartment_options",
  "is_published",
  "is_featured",
  "meta_title",
  "meta_desc",
  "sort_order",
];

// GET: Proje detay
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (projectError) {
      if (projectError.code === "PGRST116") {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json({ error: projectError.message }, { status: 500 });
    }

    if (!project) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const { data: media } = await supabase
      .from("project_media")
      .select("*")
      .eq("project_id", id)
      .order("sort_order", { ascending: true });

    return NextResponse.json({
      ...project,
      project_media: media || [],
    });
  } catch (error) {
    console.error("Project GET error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// PUT: Proje guncelle
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const payload: Record<string, unknown> = {};
    for (const key of PROJECT_UPDATE_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        payload[key] = body[key];
      }
    }

    if (typeof payload.slug === "string") {
      payload.slug = payload.slug.toLowerCase().trim();
    }

    const { data, error } = await supabase
      .from("projects")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Project update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Project PUT error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// DELETE: Proje sil
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    await supabase.from("project_media").select("id, r2_key").eq("project_id", id);

    const { error } = await supabase.from("projects").delete().eq("id", id);

    if (error) {
      console.error("Project delete error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Project DELETE error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
