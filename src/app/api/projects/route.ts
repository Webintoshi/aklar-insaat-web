import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function isSchemaCacheTableMissingError(error: unknown): boolean {
  const message = String(error?.message || "").toLowerCase();
  const code = String(error?.code || "");
  return code === "PGRST205" || (message.includes("schema cache") && message.includes("projects"));
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error || "Unknown");
}

// GET: Tüm projeleri listele
export async function GET() {
  console.log("[API] === GET /api/projects START ===");

  try {
    const supabase = await createClient();
    console.log("[API] Supabase client created");

    // Auth kontrolü
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    console.log("[API] Auth result:", { userId: user?.id, error: authError?.message });

    if (authError) {
      console.error("[API] Auth error:", authError);
      return NextResponse.json({ error: "Unauthorized: " + authError.message }, { status: 401 });
    }

    if (!user) {
      console.log("[API] No user found");
      return NextResponse.json({ error: "Unauthorized - No user" }, { status: 401 });
    }

    console.log("[API] User authenticated:", user.id);

    // Projeleri çek
    console.log("[API] Querying projects...");
    const { data: projects, error } = await supabase
      .from("projects")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[API] Database error:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });

      if (isSchemaCacheTableMissingError(error)) {
        return NextResponse.json({
          error: "Supabase'te projects tablosu bulunamadi. SQL Editor'de web/supabase/fix-missing-projects-table.sql dosyasini calistirin.",
          code: "DB_SCHEMA_MISSING_PROJECTS"
        }, { status: 503 });
      }

      return NextResponse.json({
        error: "Database error: " + error.message,
        code: error.code
      }, { status: 500 });
    }

    console.log("[API] Projects fetched:", projects?.length || 0);

    // Her proje için görselleri çek
    const projectsWithImages = await Promise.all(
      (projects || []).map(async (project) => {
        const { data: images, error: imgError } = await supabase
          .from("project_media")
          .select("*")
          .eq("project_id", project.id)
          .order("sort_order", { ascending: true });

        if (imgError) {
          console.error(`[API] Images error for ${project.id}:`, imgError.message);
        }

        return {
          ...project,
          name: project.name || project.title || "",
          slug: project.slug || "",
          about_image_url: project.about_image_url || images?.find((img) => img.category === "about")?.url || null,
          project_images: images || [],
          project_media: images || []
        };
      })
    );

    console.log("[API] === SUCCESS ===");
    return NextResponse.json(projectsWithImages);

  } catch (error: unknown) {
    console.error("[API] === UNEXPECTED ERROR ===", error);
    return NextResponse.json(
      { error: "Internal server error: " + getErrorMessage(error) },
      { status: 500 }
    );
  }
}

// POST: Yeni proje oluştur
export async function POST(req: NextRequest) {
  console.log("[API] === POST /api/projects START ===");

  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.log("[API] Unauthorized POST attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    console.log("[API] Request body:", body);

    const rawName = typeof body.name === "string" ? body.name.trim() : "";
    const rawTitle = typeof body.title === "string" ? body.title.trim() : "";
    const nameOrTitle = rawName || rawTitle;

    if (!nameOrTitle) {
      return NextResponse.json({ error: "Proje adı zorunludur" }, { status: 400 });
    }

    // Slug oluştur
    const slug = nameOrTitle
      .toLowerCase()
      .replace(/[ıİ]/g, "i")
      .replace(/[ğĞ]/g, "g")
      .replace(/[üÜ]/g, "u")
      .replace(/[şŞ]/g, "s")
      .replace(/[öÖ]/g, "o")
      .replace(/[çÇ]/g, "c")
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 50);

    const insertData: Record<string, unknown> = {
      name: rawName || undefined,
      title: rawTitle || undefined,
      slug,
      status: body.status || "published",
      project_status: body.project_status || undefined,
      about_text: body.about_text || null,
      about_image_url: body.about_image_url || null,
      description: body.description || null,
      location: body.location || null,
      is_featured: body.is_featured ?? false,
      is_published: body.is_published ?? true,
      cta_text: body.cta_text || "Devamı",
    };

    console.log("[API] Inserting:", insertData);

    let { data, error } = await supabase
      .from("projects")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("[API] Insert error:", error);

      if (isSchemaCacheTableMissingError(error)) {
        return NextResponse.json({
          error: "Supabase'te projects tablosu bulunamadi. SQL Editor'de web/supabase/fix-missing-projects-table.sql dosyasini calistirin.",
          code: "DB_SCHEMA_MISSING_PROJECTS"
        }, { status: 503 });
      }

      // Eski şema uyumu için fallback (title/status + completed/ongoing)
      if (error.code === "23514" || error.code === "42703" || error.code === "23502") {
        const legacyStatus = body.project_status || body.status;
        const normalizedLegacyStatus =
          legacyStatus === "completed" || legacyStatus === "ongoing" ? legacyStatus : "ongoing";

        const legacyInsert: Record<string, unknown> = {
          title: nameOrTitle,
          description: body.description || body.about_text || null,
          status: normalizedLegacyStatus,
          location: body.location || null,
          is_published: body.is_published ?? true,
        };

        console.log("[API] Retrying insert with legacy schema:", legacyInsert);

        const legacyResult = await supabase
          .from("projects")
          .insert(legacyInsert)
          .select()
          .single();

        data = legacyResult.data;
        error = legacyResult.error;
      }
    }

    if (error) {
      console.error("[API] Insert error (final):", error);

      if (error.code === '23505') {
        return NextResponse.json({ error: "Bu isimde proje zaten var" }, { status: 409 });
      }

      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("[API] === POST SUCCESS ===");
    return NextResponse.json(data, { status: 201 });

  } catch (error: unknown) {
    console.error("[API] POST unexpected error:", error);
    return NextResponse.json(
      { error: getErrorMessage(error) || "Internal error" },
      { status: 500 }
    );
  }
}
