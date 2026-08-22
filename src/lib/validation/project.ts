import { z } from "zod";

export const projectTypes = ["housing", "villa", "commercial", "mixed"] as const;
export const projectStatuses = ["draft", "published", "archived"] as const;
export const constructionStages = ["ongoing", "completed"] as const;
export const mediaCategories = ["cover", "exterior", "interior", "location"] as const;

const projectTypeSchema = z.enum(projectTypes);
const projectStatusSchema = z.enum(projectStatuses);
const constructionStageSchema = z.enum(constructionStages);
const mediaCategorySchema = z.enum(mediaCategories);

const slugSchema = z
  .string()
  .trim()
  .min(1, "Slug zorunludur.")
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Slug yalnızca küçük harf, rakam ve tire içerebilir.",
  );

function hasAllowedHost(value: string, allowedHosts: string[]) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && allowedHosts.some(
      (host) => url.hostname === host || url.hostname.endsWith("." + host),
    );
  } catch {
    return false;
  }
}

const mapsUrlSchema = z
  .url()
  .refine(
    (value) =>
      hasAllowedHost(value, ["google.com", "google.com.tr", "goo.gl"]) &&
      (new URL(value).hostname.includes("maps") || new URL(value).pathname.includes("/maps")),
    "Yalnızca güvenli bir Google Maps bağlantısı kullanılabilir.",
  );

const videoUrlSchema = z
  .url()
  .refine(
    (value) => hasAllowedHost(value, ["youtube.com", "youtu.be", "vimeo.com"]),
    "Yalnızca YouTube veya Vimeo bağlantısı kullanılabilir.",
  );

export const projectUnitTypeSchema = z
  .object({
    label: z.string().trim().min(1, "Daire tipi zorunludur.").max(80),
    areaMin: z.number().positive("Minimum metrekare sıfırdan büyük olmalıdır."),
    areaMax: z.number().positive("Maksimum metrekare sıfırdan büyük olmalıdır."),
  })
  .refine((unit) => unit.areaMax >= unit.areaMin, {
    message: "Maksimum metrekare minimumdan küçük olamaz.",
    path: ["areaMax"],
  });

export const projectMediaInputSchema = z.object({
  category: mediaCategorySchema,
  objectKey: z.string().trim().min(1),
});

const projectFieldsSchema = z.object({
  name: z.string().trim().min(1, "Proje adı zorunludur.").max(160),
  slug: slugSchema,
  projectType: projectTypeSchema,
  status: projectStatusSchema.default("draft"),
  constructionStage: constructionStageSchema,
  shortDescription: z.string().trim().min(1, "Kısa açıklama zorunludur.").max(320),
  longDescription: z.string().trim().min(1, "Uzun açıklama zorunludur."),
  completionDate: z.iso.date().nullable().optional(),
  city: z.string().trim().min(1, "İl zorunludur.").max(120),
  district: z.string().trim().min(1, "İlçe zorunludur.").max(120),
  neighborhood: z.string().trim().min(1, "Mahalle zorunludur.").max(160),
  address: z.string().trim().min(1, "Açık adres zorunludur.").max(500),
  mapsUrl: mapsUrlSchema.nullable().optional(),
  videoUrl: videoUrlSchema.nullable().optional(),
  unitTypes: z
    .array(projectUnitTypeSchema)
    .min(1, "Yayınlamak için en az bir daire tipi zorunludur."),
  media: z.array(projectMediaInputSchema),
});

export const projectPublishSchema = projectFieldsSchema.superRefine((project, context) => {
  const categoryCounts = project.media.reduce<Record<(typeof mediaCategories)[number], number>>(
    (counts, media) => {
      counts[media.category] += 1;
      return counts;
    },
    { cover: 0, exterior: 0, interior: 0, location: 0 },
  );

  if (categoryCounts.cover < 1) {
    context.addIssue({
      code: "custom",
      path: ["media"],
      message: "Yayınlamak için bir kapak görseli zorunludur.",
    });
  }

  if (project.media.length < 3) {
    context.addIssue({
      code: "custom",
      path: ["media"],
      message: "Yayınlamak için toplam en az üç görsel zorunludur.",
    });
  }

  const limits = {
    cover: { value: 1, message: "Kapak görseli en fazla 1 adet olabilir." },
    exterior: {
      value: 20,
      message: "Dış mekân görselleri en fazla 20 adet olabilir.",
    },
    interior: {
      value: 30,
      message: "İç mekân görselleri en fazla 30 adet olabilir.",
    },
    location: { value: 10, message: "Konum görselleri en fazla 10 adet olabilir." },
  } as const;

  for (const category of mediaCategories) {
    if (categoryCounts[category] > limits[category].value) {
      context.addIssue({
        code: "custom",
        path: ["media"],
        message: limits[category].message,
      });
    }
  }
});

export const projectPatchSchema = z.object({
  version: z.number().int().positive(),
  name: z.string().trim().max(160).optional(),
  slug: slugSchema.optional(),
  projectType: projectTypeSchema.optional(),
  status: z.enum(["draft", "archived"]).optional(),
  constructionStage: constructionStageSchema.nullable().optional(),
  shortDescription: z.string().trim().max(320).optional(),
  longDescription: z.string().trim().optional(),
  completionDate: z.iso.date().nullable().optional(),
  city: z.string().trim().max(120).optional(),
  district: z.string().trim().max(120).optional(),
  neighborhood: z.string().trim().max(160).optional(),
  address: z.string().trim().max(500).optional(),
  mapsUrl: mapsUrlSchema.nullable().optional(),
  videoUrl: videoUrlSchema.nullable().optional(),
  seoTitle: z.string().trim().max(70).optional(),
  seoDescription: z.string().trim().max(170).optional(),
  unitTypes: z.array(projectUnitTypeSchema).optional(),
  featureNames: z.array(z.string().trim().min(1).max(120)).optional(),
});

export const createProjectDraftSchema = z.object({
  projectType: projectTypeSchema,
});

export type ProjectPatchInput = z.infer<typeof projectPatchSchema>;
export type ProjectPublishInput = z.infer<typeof projectPublishSchema>;
