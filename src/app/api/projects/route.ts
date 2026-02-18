import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: Tüm projeleri listele (admin için)
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("projects")
      .select("*, project_media(id, url, category)")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Projects fetch error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Projects GET error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST: Yeni proje oluştur
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error("Auth error:", userError);
      return NextResponse.json({ error: "Auth error: " + userError.message }, { status: 401 });
    }
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized - No user" }, { status: 401 });
    }

    const body = await req.json();
    console.log("Creating project with body:", body);
    console.log("User ID:", user.id);
    
    // Slug oluştur
    const slug = body.slug || generateSlug(body.name);
    
    // Temiz veri hazırla
    const insertData = {
      name: body.name,
      slug: slug,
      status: body.status || 'draft',
      is_featured: body.is_featured || false,
      about_text: body.about_text || null,
      cta_text: body.cta_text || 'Devamı',
      apartment_options: body.apartment_options || null,
      neighborhood: body.neighborhood || null,
      location_description: body.location_description || null,
      meta_title: body.meta_title || null,
      meta_desc: body.meta_desc || null,
      created_by: user.id,
    };
    
    console.log("Insert data:", insertData);

    const { data, error } = await supabase
      .from("projects")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Project insert error:", error);
      return NextResponse.json({ 
        error: error.message, 
        code: error.code,
        details: error.details,
        hint: error.hint
      }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error: any) {
    console.error("Project POST error:", error);
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}

function generateSlug(name: string): string {
  return name
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
}
