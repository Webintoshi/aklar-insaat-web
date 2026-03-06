import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generatePresignedUploadUrl } from "@/lib/r2/presign";
import { z } from "zod";

// Validation schema
const presignRequestSchema = z.object({
  category: z.enum(["exterior", "interior", "location"]),
  contentType: z.string().regex(/^image\/(jpeg|jpg|png|webp|gif)$/i),
  fileExtension: z.enum(["jpg", "jpeg", "png", "webp", "gif"]),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Auth check
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized", code: "AUTH_REQUIRED" },
        { status: 401 }
      );
    }

    // 2. Parse and validate project ID
    const { id: projectId } = await params;
    if (!projectId || !/^[0-9a-f-]{36}$/i.test(projectId)) {
      return NextResponse.json(
        { error: "Invalid project ID", code: "INVALID_PROJECT_ID" },
        { status: 400 }
      );
    }

    // 3. Validate request body
    const body = await req.json();
    const validation = presignRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { 
          error: "Invalid request body", 
          code: "VALIDATION_ERROR",
          details: validation.error.format() 
        },
        { status: 400 }
      );
    }

    const { category, contentType, fileExtension } = validation.data;

    // 4. Verify project exists and user has access
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .single();

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Project not found", code: "PROJECT_NOT_FOUND" },
        { status: 404 }
      );
    }

    // 5. Generate presigned URL
    const { presignedUrl, key, publicUrl } = await generatePresignedUploadUrl({
      projectId,
      category,
      contentType,
      fileExtension,
    });

    // 6. Return response
    return NextResponse.json({
      presignedUrl,
      publicUrl,
      key,
      expiresIn: 300, // 5 minutes in seconds
    });

  } catch (error) {
    console.error("[PRESIGN_ERROR]", error);
    
    return NextResponse.json(
      { 
        error: "Internal server error", 
        code: "INTERNAL_ERROR",
        requestId: crypto.randomUUID(),
      },
      { status: 500 }
    );
  }
}
