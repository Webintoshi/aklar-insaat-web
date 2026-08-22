import { count, desc, eq } from "drizzle-orm";
import Image from "next/image";

import { db } from "@/db/client";
import { mediaAssets, projectMedia } from "@/db/schema";

import { MediaActions } from "./media-actions";

export const dynamic = "force-dynamic";

export default async function MediaCenterPage() {
  const rows = await db
    .select({
      id: mediaAssets.id,
      objectKey: mediaAssets.objectKey,
      originalName: mediaAssets.originalName,
      mimeType: mediaAssets.mimeType,
      sizeBytes: mediaAssets.sizeBytes,
      status: mediaAssets.status,
      createdAt: mediaAssets.createdAt,
      usage: count(projectMedia.projectId),
    })
    .from(mediaAssets)
    .leftJoin(projectMedia, eq(projectMedia.mediaAssetId, mediaAssets.id))
    .groupBy(mediaAssets.id)
    .orderBy(desc(mediaAssets.createdAt))
    .limit(200);
  const mediaBase = (
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL || "https://media.orduaklarinsaat.com"
  ).replace(/\/+$/, "");

  return (
    <div className="mx-auto max-w-[1180px]">
      <h1 className="text-[28px] font-semibold tracking-[-0.025em]">Medya Merkezi</h1>
      <p className="mt-1 text-sm text-[#707581]">
        Yalnızca bu sitede kullanılan Cloudflare R2 nesnelerini yönetin.
      </p>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rows.map((asset) => (
          <article key={asset.id} className="overflow-hidden rounded-md border border-[#dde0e5] bg-white">
            <div className="relative aspect-[4/3] bg-[#f1f2f4]">
              {asset.status !== "deleted" && (
                <Image src={mediaBase + "/" + asset.objectKey} alt={asset.originalName} fill className="object-cover" sizes="280px" />
              )}
            </div>
            <div className="p-4">
              <p className="truncate text-sm font-semibold">{asset.originalName}</p>
              <p className="mt-1 text-xs text-[#7b808b]">{(asset.sizeBytes / 1024 / 1024).toFixed(2)} MB · {asset.status}</p>
              <div className="mt-4"><MediaActions id={asset.id} usage={asset.usage} /></div>
            </div>
          </article>
        ))}
      </div>
      {rows.length === 0 && <p className="mt-7 rounded-md border border-[#dde0e5] bg-white p-12 text-center text-sm text-[#777c87]">Henüz medya yok.</p>}
    </div>
  );
}
