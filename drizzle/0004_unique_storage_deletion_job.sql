DROP INDEX "storage_deletion_jobs_media_asset_id_idx";--> statement-breakpoint
ALTER TABLE "storage_deletion_jobs" ADD CONSTRAINT "storage_deletion_jobs_media_asset_unique" UNIQUE("media_asset_id");