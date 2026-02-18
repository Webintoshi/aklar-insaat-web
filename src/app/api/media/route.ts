import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { 
      projectId, 
      r2Key, 
      publicUrl, 
      category, 
      altText, 
      fileSize, 
      width, 
      height 
    } = await req.json();

    // Mevcut sıra sayısını bul
    const { count } = await supabase
      .from("project_media")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId)
      .eq("category", category);

    const { data, error } = await supabase
      .from("project_media")
      .insert({
        project_id: projectId,
        r2_key: r2Key,
        url: publicUrl,
        category,
        alt_text: altText || "",
        file_size: fileSize,
        width,
        height,
        sort_order: count ?? 0,
      })
      .select()
      .single();

    if (error) {
      console.error("Media insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("Media POST error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
