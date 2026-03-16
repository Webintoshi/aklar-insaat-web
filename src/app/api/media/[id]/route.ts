import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteFromR2 } from "@/lib/r2/delete";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // DB'den medya kaydını al
    const { data: media } = await supabase
      .from("project_media")
      .select("id, project_id, url, r2_key")
      .eq("id", id)
      .single();

    if (!media) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // R2'den sil (bozuk eski kayıtlarda işlem başarısız olsa da DB silmeyi engelleme)
    const rawR2Key = typeof media.r2_key === "string" ? media.r2_key.trim() : "";
    const fallbackKeyFromUrl =
      typeof media.url === "string" ? media.url.replace(/^https?:\/\/[^/]+\//, "") : "";
    const r2Key = (rawR2Key || fallbackKeyFromUrl).replace(/^https?:\/\/[^/]+\//, "");
    const shouldDeleteFromR2 =
      r2Key.length > 0 &&
      !r2Key.startsWith("blob:") &&
      !r2Key.startsWith("data:");

    if (shouldDeleteFromR2) {
      try {
        await deleteFromR2(r2Key);
      } catch (r2Error) {
        console.warn("R2 delete warning:", r2Error);
      }
    }

    // DB'den sil
    const { error: deleteError } = await supabase.from("project_media").delete().eq("id", id);
    if (deleteError) {
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Silinen görsel kapak ise, otomatik fallback kapak ata
    const { data: projectData } = await supabase
      .from("projects")
      .select("about_image_url")
      .eq("id", media.project_id)
      .maybeSingle();

    if (projectData?.about_image_url && projectData.about_image_url === media.url) {
      const { data: fallbackMedia } = await supabase
        .from("project_media")
        .select("url")
        .eq("project_id", media.project_id)
        .order("created_at", { ascending: true })
        .order("sort_order", { ascending: true })
        .limit(1)
        .maybeSingle();

      await supabase
        .from("projects")
        .update({ about_image_url: fallbackMedia?.url || null })
        .eq("id", media.project_id);
    }

    return NextResponse.json({ success: true, id });
  } catch (error) {
    console.error("Media delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
