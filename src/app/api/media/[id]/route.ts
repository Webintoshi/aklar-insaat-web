import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteFromR2 } from "@/lib/r2/delete";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // DB'den r2_key'i al
    const { data: media } = await supabase
      .from("project_media")
      .select("r2_key")
      .eq("id", params.id)
      .single();

    if (!media) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // R2'den sil
    await deleteFromR2(media.r2_key);

    // DB'den sil
    await supabase.from("project_media").delete().eq("id", params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Media delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
