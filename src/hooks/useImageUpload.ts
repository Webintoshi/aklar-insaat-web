"use client";

import { useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";

export type UploadCategory = "exterior" | "interior" | "location";

export interface UploadResult {
  id: string;
  image_url: string;
  image_type: string;
  caption: string | null;
}

export interface UseImageUploadReturn {
  upload: (
    file: File,
    projectId: string,
    category: UploadCategory
  ) => Promise<UploadResult>;
  isUploading: boolean;
  error: string | null;
  progress: number;
  reset: () => void;
}

// Helper to get file extension
function getFileExtension(filename: string): string {
  return filename.split(".").pop()?.toLowerCase() || "";
}

// Validate file before upload
function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: "Sadece JPG, PNG, WebP veya GIF dosyaları yüklenebilir." };
  }

  // Check file size (10MB limit)
  const maxSize = 10 * 1024 * 1024; // 10MB in bytes
  if (file.size > maxSize) {
    return { valid: false, error: "Dosya boyutu 10MB'dan küçük olmalıdır." };
  }

  return { valid: true };
}

export function useImageUpload(): UseImageUploadReturn {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const supabase = createClient();

  const reset = useCallback(() => {
    setIsUploading(false);
    setError(null);
    setProgress(0);
  }, []);

  const upload = useCallback(
    async (
      file: File,
      projectId: string,
      category: UploadCategory
    ): Promise<UploadResult> => {
      // Reset state
      setError(null);
      setProgress(0);

      // Validate file
      const validation = validateFile(file);
      if (!validation.valid) {
        setError(validation.error!);
        throw new Error(validation.error);
      }

      setIsUploading(true);

      try {
        const fileExtension = getFileExtension(file.name);

        // Step 1: Get presigned URL from our API
        setProgress(10);
        const presignResponse = await fetch(`/api/projects/${projectId}/presign`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            category,
            contentType: file.type,
            fileExtension,
          }),
        });

        if (!presignResponse.ok) {
          const errorData = await presignResponse.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Presign failed: ${presignResponse.status}`
          );
        }

        const { presignedUrl, publicUrl, key } = await presignResponse.json();
        setProgress(30);

        // Step 2: Upload directly to R2 using presigned URL
        const uploadResponse = await fetch(presignedUrl, {
          method: "PUT",
          headers: {
            "Content-Type": file.type,
          },
          body: file,
        });

        if (!uploadResponse.ok) {
          throw new Error(
            `Upload to R2 failed: ${uploadResponse.status} ${uploadResponse.statusText}`
          );
        }

        setProgress(70);

        // Step 3: Save to database
        const { data: dbRecord, error: dbError } = await supabase
          .from("project_images")
          .insert({
            project_id: projectId,
            image_url: publicUrl,
            image_type: category,
          })
          .select()
          .single();

        if (dbError) {
          // Attempt to clean up R2 file on DB error
          console.error("[UPLOAD] DB insert failed, R2 cleanup needed:", key);
          throw new Error(`Database error: ${dbError.message}`);
        }

        setProgress(100);

        return {
          id: dbRecord.id,
          image_url: dbRecord.image_url,
          image_type: dbRecord.image_type,
          caption: dbRecord.caption ?? null,
        };
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Bilinmeyen bir hata oluştu";
        setError(errorMessage);
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    [supabase]
  );

  return { upload, isUploading, error, progress, reset };
}
