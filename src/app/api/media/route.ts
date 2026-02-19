import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    
    const { 
      project_id, 
      url, 
      category, 
      sort_order = 0
    } = body;

    if (!project_id || !url || !category) {
      return NextResponse.json({ 
        error: "project_id, url ve category zorunludur" 
      }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("project_media")
      .insert({
        project_id,
        url,
        category,
        sort_order,
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
