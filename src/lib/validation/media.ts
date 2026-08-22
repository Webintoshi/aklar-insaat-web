import { z } from "zod";

import { mediaCategories } from "@/lib/validation/project";

export const MAX_MEDIA_FILE_SIZE = 20 * 1024 * 1024;
export const allowedMediaTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
] as const;

const originalNameSchema = z
  .string()
  .trim()
  .min(1)
  .max(255)
  .refine((name) => !name.includes("/") && !name.includes("\\"), {
    message: "Dosya adı bir yol içeremez.",
  });

export const mediaPresignSchema = z.object({
  projectId: z.uuid(),
  category: z.enum(mediaCategories),
  contentType: z.enum(allowedMediaTypes),
  fileSize: z.number().int().positive().max(MAX_MEDIA_FILE_SIZE),
  originalName: originalNameSchema,
});

export const mediaCompleteSchema = z
  .object({
    projectId: z.uuid(),
    category: z.enum(mediaCategories),
    objectKey: z.string().trim().min(1).max(1024),
    originalName: originalNameSchema,
    altText: z.string().trim().max(240).nullable().optional(),
  })
  .superRefine((input, context) => {
    const prefix = "projects/" + input.projectId + "/" + input.category + "/";
    if (!input.objectKey.startsWith(prefix) || input.objectKey.includes("..")) {
      context.addIssue({
        code: "custom",
        path: ["objectKey"],
        message: "R2 nesne anahtarı proje kapsamı dışında.",
      });
    }
  });
