import "server-only";

import { and, count, eq, inArray, lte, or, sql } from "drizzle-orm";

import { db } from "@/db/client";
import {
  auditLogs,
  mediaAssets,
  projectMedia,
  projects,
  storageDeletionJobs,
} from "@/db/schema";
import { deleteR2Object, headR2Object, presignProjectUpload } from "@/lib/r2/storage";
import {
  allowedMediaTypes,
  MAX_MEDIA_FILE_SIZE,
  type mediaCompleteSchema,
  type mediaPresignSchema,
} from "@/lib/validation/media";

type PresignInput = typeof mediaPresignSchema._output;
type CompleteInput = typeof mediaCompleteSchema._output;

export const MEDIA_CATEGORY_LIMITS = {
  cover: 1,
  exterior: 20,
  interior: 30,
  location: 10,
} as const;

export class MediaLimitError extends Error {
  constructor(category: keyof typeof MEDIA_CATEGORY_LIMITS) {
    super(
      "Bu kategori en fazla " +
        MEDIA_CATEGORY_LIMITS[category] +
        " görsel içerebilir.",
    );
    this.name = "MediaLimitError";
  }
}

export class MediaNotFoundError extends Error {
  constructor() {
    super("Medya kaydı veya R2 nesnesi bulunamadı.");
    this.name = "MediaNotFoundError";
  }
}

export class MediaInUseError extends Error {
  constructor() {
    super("Bu medya bir projede kullanılıyor. Önce proje bağlantısını kaldırın.");
    this.name = "MediaInUseError";
  }
}

export class MediaVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaVerificationError";
  }
}

async function assertProjectAndCapacity(
  projectId: string,
  category: keyof typeof MEDIA_CATEGORY_LIMITS,
) {
  const [[project], [usage]] = await Promise.all([
    db.select({ id: projects.id }).from(projects).where(eq(projects.id, projectId)).limit(1),
    db
      .select({ value: count() })
      .from(projectMedia)
      .where(and(eq(projectMedia.projectId, projectId), eq(projectMedia.category, category))),
  ]);

  if (!project) throw new MediaNotFoundError();
  if (category !== "cover" && usage.value >= MEDIA_CATEGORY_LIMITS[category]) {
    throw new MediaLimitError(category);
  }
}

export async function reserveMediaUpload(actorUserId: string, input: PresignInput) {
  await assertProjectAndCapacity(input.projectId, input.category);
  const signedUpload = await presignProjectUpload(input);

  const [asset] = await db
    .insert(mediaAssets)
    .values({
      objectKey: signedUpload.objectKey,
      originalName: input.originalName,
      mimeType: input.contentType,
      sizeBytes: input.fileSize,
      status: "pending",
      uploadedBy: actorUserId,
    })
    .returning({ id: mediaAssets.id });

  return { ...signedUpload, mediaId: asset.id };
}

export async function completeMediaUpload(actorUserId: string, input: CompleteInput) {
  const [pendingAsset] = await db
    .select()
    .from(mediaAssets)
    .where(eq(mediaAssets.objectKey, input.objectKey))
    .limit(1);

  if (!pendingAsset) throw new MediaNotFoundError();
  if (
    pendingAsset.originalName !== input.originalName ||
    pendingAsset.uploadedBy !== actorUserId
  ) {
    throw new MediaVerificationError("Medya yükleme kaydı istekle eşleşmiyor.");
  }

  const head = await headR2Object(input.objectKey).catch(() => {
    throw new MediaNotFoundError();
  });
  const contentLength = Number(head.ContentLength ?? 0);
  const contentType = head.ContentType?.toLowerCase();

  if (
    contentLength <= 0 ||
    contentLength > MAX_MEDIA_FILE_SIZE ||
    contentLength !== pendingAsset.sizeBytes
  ) {
    throw new MediaVerificationError("R2 nesne boyutu yükleme kaydıyla eşleşmiyor.");
  }
  if (
    !contentType ||
    !allowedMediaTypes.includes(contentType as (typeof allowedMediaTypes)[number]) ||
    contentType !== pendingAsset.mimeType
  ) {
    throw new MediaVerificationError("R2 nesne türü yükleme kaydıyla eşleşmiyor.");
  }

  return db.transaction(async (transaction) => {
    await transaction.execute(
      sql`select pg_advisory_xact_lock(hashtextextended(${input.projectId}, 0))`,
    );

    const [asset] = await transaction
      .select()
      .from(mediaAssets)
      .where(eq(mediaAssets.id, pendingAsset.id))
      .limit(1);
    if (!asset) throw new MediaNotFoundError();

    const [existingLink] = await transaction
      .select()
      .from(projectMedia)
      .where(
        and(
          eq(projectMedia.projectId, input.projectId),
          eq(projectMedia.mediaAssetId, asset.id),
        ),
      )
      .limit(1);
    if (asset.status === "active" && existingLink) {
      return { asset, link: existingLink };
    }

    const [project] = await transaction
      .select({ id: projects.id })
      .from(projects)
      .where(eq(projects.id, input.projectId))
      .limit(1);
    if (!project) throw new MediaNotFoundError();

    if (input.category === "cover") {
      await transaction
        .delete(projectMedia)
        .where(
          and(
            eq(projectMedia.projectId, input.projectId),
            eq(projectMedia.category, "cover"),
          ),
        );
    } else {
      const [usage] = await transaction
        .select({ value: count() })
        .from(projectMedia)
        .where(
          and(
            eq(projectMedia.projectId, input.projectId),
            eq(projectMedia.category, input.category),
          ),
        );
      if (usage.value >= MEDIA_CATEGORY_LIMITS[input.category]) {
        throw new MediaLimitError(input.category);
      }
    }

    const [position] = await transaction
      .select({ value: count() })
      .from(projectMedia)
      .where(
        and(
          eq(projectMedia.projectId, input.projectId),
          eq(projectMedia.category, input.category),
        ),
      );
    const activatedAt = new Date();
    const [activatedAsset] = await transaction
      .update(mediaAssets)
      .set({
        status: "active",
        sizeBytes: contentLength,
        mimeType: contentType,
        etag: head.ETag?.replaceAll('"', "") ?? null,
        activatedAt,
        updatedAt: activatedAt,
      })
      .where(eq(mediaAssets.id, asset.id))
      .returning();
    const [link] = await transaction
      .insert(projectMedia)
      .values({
        projectId: input.projectId,
        mediaAssetId: asset.id,
        category: input.category,
        position: position.value,
        altText: input.altText,
      })
      .returning();

    await transaction.insert(auditLogs).values({
      actorUserId,
      action: "media.activated",
      entityType: "media_asset",
      entityId: asset.id,
      metadata: { projectId: input.projectId, category: input.category },
    });

    return { asset: activatedAsset, link };
  });
}

export async function enqueueMediaDeletion(actorUserId: string, mediaAssetId: string) {
  return db.transaction(async (transaction) => {
    const [asset] = await transaction
      .select()
      .from(mediaAssets)
      .where(eq(mediaAssets.id, mediaAssetId))
      .limit(1);
    const [usage] = await transaction
      .select({ value: count() })
      .from(projectMedia)
      .where(eq(projectMedia.mediaAssetId, mediaAssetId));
    const [existingJob] = await transaction
      .select()
      .from(storageDeletionJobs)
      .where(eq(storageDeletionJobs.mediaAssetId, mediaAssetId))
      .limit(1);

    if (!asset) throw new MediaNotFoundError();
    if (usage.value > 0) throw new MediaInUseError();
    if (existingJob) {
      if (existingJob.status !== "failed") return existingJob;
      const [retriedJob] = await transaction
        .update(storageDeletionJobs)
        .set({
          status: "pending",
          lastError: null,
          nextAttemptAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(storageDeletionJobs.id, existingJob.id))
        .returning();
      return retriedJob;
    }

    await transaction
      .update(mediaAssets)
      .set({ status: "deleting", updatedAt: new Date() })
      .where(eq(mediaAssets.id, mediaAssetId));
    const [job] = await transaction
      .insert(storageDeletionJobs)
      .values({
        mediaAssetId,
        objectKey: asset.objectKey,
      })
      .returning();
    await transaction.insert(auditLogs).values({
      actorUserId,
      action: "media.deletion_queued",
      entityType: "media_asset",
      entityId: mediaAssetId,
      metadata: { objectKey: asset.objectKey },
    });

    return job;
  });
}

export async function processStorageDeletionJob(jobId: string) {
  const [job] = await db
    .select()
    .from(storageDeletionJobs)
    .where(eq(storageDeletionJobs.id, jobId))
    .limit(1);
  if (!job) throw new MediaNotFoundError();

  await deleteR2Object(job.objectKey);
  const completedAt = new Date();
  await db.transaction(async (transaction) => {
    await transaction
      .update(storageDeletionJobs)
      .set({ status: "completed", completedAt, updatedAt: completedAt })
      .where(eq(storageDeletionJobs.id, jobId));
    await transaction
      .update(mediaAssets)
      .set({ status: "deleted", deletedAt: completedAt, updatedAt: completedAt })
      .where(eq(mediaAssets.id, job.mediaAssetId));
  });
}

export async function processPendingStorageDeletions(limit = 20) {
  const now = new Date();
  const staleProcessing = new Date(now.getTime() - 15 * 60 * 1000);
  const jobs = await db
    .select()
    .from(storageDeletionJobs)
    .where(
      or(
        and(
          inArray(storageDeletionJobs.status, ["pending", "failed"]),
          lte(storageDeletionJobs.nextAttemptAt, now),
        ),
        and(
          eq(storageDeletionJobs.status, "processing"),
          lte(storageDeletionJobs.updatedAt, staleProcessing),
        ),
      ),
    )
    .orderBy(storageDeletionJobs.nextAttemptAt)
    .limit(Math.min(Math.max(limit, 1), 100));

  const results = [];
  for (const job of jobs) {
    const claimedAt = new Date();
    const [claimed] = await db
      .update(storageDeletionJobs)
      .set({
        status: "processing",
        attempts: job.attempts + 1,
        updatedAt: claimedAt,
      })
      .where(
        and(
          eq(storageDeletionJobs.id, job.id),
          inArray(storageDeletionJobs.status, ["pending", "failed", "processing"]),
        ),
      )
      .returning();
    if (!claimed) continue;

    try {
      await processStorageDeletionJob(job.id);
      results.push({ id: job.id, status: "completed" as const });
    } catch (error) {
      const attempt = job.attempts + 1;
      const retryMinutes = Math.min(2 ** attempt, 24 * 60);
      await db
        .update(storageDeletionJobs)
        .set({
          status: "failed",
          lastError: error instanceof Error ? error.message.slice(0, 1000) : "Bilinmeyen hata",
          nextAttemptAt: new Date(Date.now() + retryMinutes * 60 * 1000),
          updatedAt: new Date(),
        })
        .where(eq(storageDeletionJobs.id, job.id));
      results.push({ id: job.id, status: "failed" as const });
    }
  }

  return results;
}
