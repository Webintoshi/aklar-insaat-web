import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generatePresignedUploadUrl } from "@/lib/r2/presign";

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(req: NextRequest) {
  try {
    // Auth kontrolü
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Input validasyon
    const body = await req.json();
    const { projectId, category, contentType, fileSize, fileExtension } = body;

    if (!ALLOWED_TYPES.includes(contentType)) {
      return NextResponse.json(
        { error: "Sadece JPG, PNG, WebP, HEIC desteklenir" },
        { status: 400 }
      );
    }

    if (fileSize > MAX_SIZE) {
      return NextResponse.json(
        { error: "Maksimum dosya boyutu 10MB" },
        { status: 400 }
      );
    }

    if (!["about", "exterior", "interior", "location"].includes(category)) {
      return NextResponse.json({ error: "Geçersiz kategori" }, { status: 400 });
    }

    // Presigned URL üret
    const { presignedUrl, key, publicUrl } = await generatePresignedUploadUrl({
      projectId,
      category,
      contentType,
      fileExtension: fileExtension.toLowerCase().replace("jpg", "jpeg"),
    });

    return NextResponse.json({ presignedUrl, key, publicUrl });
  } catch (error) {
    console.error("Presign error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
