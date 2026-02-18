import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// GET: Tüm projeleri listele (admin için)
export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error("Auth error in GET:", authError);
      return NextResponse.json({ error: "Authentication error: " + authError.message }, { status: 401 });
    }
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized - No user found" }, { status: 401 });
    }

    console.log("GET /api/projects - User:", user.id);

    const { data, error } = await supabase
      .from("projects")
      .select("*, project_media(id, url, category)")
      .order("sort_order", { ascending: true })
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Projects fetch error:", error);
      return NextResponse.json({ 
        error: "Database error: " + error.message,
        code: error.code,
        details: error.details 
      }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error: any) {
    console.error("Projects GET error:", error);
    return NextResponse.json(
      { error: "Internal server error: " + (error.message || "Unknown error") },
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
      return NextResponse.json({ 
        error: "Auth error: " + userError.message,
        code: userError.code 
      }, { status: 401 });
    }
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized - No user found. Please login again." }, { status: 401 });
    }

    let body;
    try {
      body = await req.json();
    } catch (e) {
      return NextResponse.json({ error: "Invalid JSON in request body" }, { status: 400 });
    }
    
    console.log("Creating project with body:", body);
    console.log("User ID:", user.id);
    
    // Validasyon
    if (!body.name || body.name.trim() === '') {
      return NextResponse.json({ error: "Proje adı zorunludur" }, { status: 400 });
    }
    
    // Slug oluştur
    const slug = body.slug?.trim() || generateSlug(body.name);
    
    if (!slug || slug.trim() === '') {
      return NextResponse.json({ error: "Slug oluşturulamadı" }, { status: 400 });
    }
    
    // Temiz veri hazırla - sadece tabloda var olan kolonlar
    const insertData: any = {
      name: body.name.trim(),
      slug: slug.toLowerCase(),
      status: body.status || 'draft',
      is_featured: body.is_featured || false,
      created_by: user.id,
    };
    
    // Opsiyonel alanlar - sadece değer varsa ekle
    if (body.about_text?.trim()) insertData.about_text = body.about_text.trim();
    if (body.cta_text?.trim()) insertData.cta_text = body.cta_text.trim();
    if (body.apartment_options?.trim()) insertData.apartment_options = body.apartment_options.trim();
    if (body.neighborhood?.trim()) insertData.neighborhood = body.neighborhood.trim();
    if (body.location_description?.trim()) insertData.location_description = body.location_description.trim();
    if (body.meta_title?.trim()) insertData.meta_title = body.meta_title.trim();
    if (body.meta_desc?.trim()) insertData.meta_desc = body.meta_desc.trim();
    
    console.log("Insert data:", insertData);

    const { data, error } = await supabase
      .from("projects")
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error("Project insert error:", error);
      
      // Daha anlamlı hata mesajları
      let errorMessage = error.message;
      if (error.code === '23505') {
        errorMessage = "Bu slug ile bir proje zaten mevcut. Lütfen farklı bir proje adı deneyin.";
      } else if (error.code === '23503') {
        errorMessage = "Foreign key hatası: Geçersiz kullanıcı veya ilişkili kayıt.";
      } else if (error.code === '23502') {
        errorMessage = "Zorunlu alan eksik: " + error.details;
      } else if (error.code === '42501') {
        errorMessage = "Yetki hatası: RLS politikası bu işlemi engelliyor.";
      }
      
      return NextResponse.json({ 
        error: errorMessage, 
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
