import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { r2Client, R2_BUCKET } from "./client";

interface PresignOptions {
  projectId: string;
  category: "about" | "exterior" | "interior" | "location";
  contentType: string;
  fileExtension: string;
}

export async function generatePresignedUploadUrl(opts: PresignOptions) {
  const { projectId, category, contentType, fileExtension } = opts;

  // Güvenli dosya path'i
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 10);
  const key = `projects/${projectId}/${category}/${timestamp}-${random}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: key,
    ContentType: contentType,
  });

  const presignedUrl = await getSignedUrl(r2Client, command, {
    expiresIn: 300, // 5 dakika
  });

  const publicUrl = `${process.env.NEXT_PUBLIC_R2_PUBLIC_URL}/${key}`;

  return { presignedUrl, key, publicUrl };
}
