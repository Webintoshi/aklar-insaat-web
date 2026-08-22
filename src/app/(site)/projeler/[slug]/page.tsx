import { and, asc, eq } from "drizzle-orm";
import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  Clock3,
  ExternalLink,
  MapPin,
  Maximize,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { db } from "@/db/client";
import {
  mediaAssets,
  projectFeatures,
  projectMedia,
  projects,
  projectUnitTypes,
} from "@/db/schema";

import { MediaGallerySection } from "./MediaGallerySection";

export const revalidate = 300;

async function getProjectDetail(slug: string) {
  const [project] = await db
    .select()
    .from(projects)
    .where(
      and(
        eq(projects.slug, slug),
        eq(projects.publicationStatus, "published"),
      ),
    )
    .limit(1);
  if (!project) return null;

  const [media, units, features] = await Promise.all([
    db
      .select({
        id: mediaAssets.id,
        objectKey: mediaAssets.objectKey,
        category: projectMedia.category,
        altText: projectMedia.altText,
      })
      .from(projectMedia)
      .innerJoin(
        mediaAssets,
        and(
          eq(projectMedia.mediaAssetId, mediaAssets.id),
          eq(mediaAssets.status, "active"),
        ),
      )
      .where(eq(projectMedia.projectId, project.id))
      .orderBy(asc(projectMedia.category), asc(projectMedia.position)),
    db
      .select()
      .from(projectUnitTypes)
      .where(eq(projectUnitTypes.projectId, project.id))
      .orderBy(asc(projectUnitTypes.position)),
    db
      .select()
      .from(projectFeatures)
      .where(eq(projectFeatures.projectId, project.id))
      .orderBy(asc(projectFeatures.position)),
  ]);
  const mediaBase = (
    process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
    "https://media.orduaklarinsaat.com"
  ).replace(/\/+$/, "");

  return {
    project,
    units,
    features,
    media: media.map((item) => ({
      ...item,
      url: mediaBase + "/" + item.objectKey,
    })),
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const detail = await getProjectDetail((await params).slug);
  if (!detail) return { title: "Proje Bulunamadı" };

  const cover = detail.media.find((item) => item.category === "cover");
  return {
    title: detail.project.seoTitle || detail.project.name,
    description:
      detail.project.seoDescription || detail.project.shortDescription || undefined,
    alternates: { canonical: "/projeler/" + detail.project.slug },
    openGraph: {
      title: detail.project.seoTitle || detail.project.name,
      description:
        detail.project.seoDescription || detail.project.shortDescription || undefined,
      images: cover ? [{ url: cover.url }] : undefined,
    },
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const detail = await getProjectDetail((await params).slug);
  if (!detail) notFound();

  const { project, media, units, features } = detail;
  const cover = media.find((item) => item.category === "cover");
  const exterior = media.filter((item) => item.category === "exterior");
  const interior = media.filter((item) => item.category === "interior");
  const location = media.find((item) => item.category === "location");

  return (
    <main className="min-h-screen bg-[#f5f7fa]">
      <section className="relative overflow-hidden bg-[#132a44] text-white">
        {cover && (
          <Image
            src={cover.url}
            alt=""
            fill
            className="object-cover opacity-25"
            sizes="100vw"
            priority
          />
        )}
        <div className="container relative z-10 mx-auto px-4 py-12 sm:px-6 lg:px-8 lg:py-20">
          <Link href="/projeler" className="inline-flex items-center text-sm text-white/80">
            <ArrowLeft className="mr-2 h-4 w-4" /> Projelere Dön
          </Link>
          <div className="mt-9 max-w-4xl">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm font-semibold">
              {project.constructionStage === "completed" ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Clock3 className="h-4 w-4" />
              )}
              {project.constructionStage === "completed" ? "Tamamlandı" : "Devam Ediyor"}
            </span>
            <h1 className="mt-5 text-4xl font-semibold leading-tight md:text-6xl">
              {project.name}
            </h1>
            <p className="mt-5 max-w-3xl text-lg leading-8 text-white/85">
              {project.shortDescription}
            </p>
          </div>
        </div>
      </section>

      <div className="container mx-auto space-y-12 px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        <section className="grid gap-8 lg:grid-cols-12">
          <div className="overflow-hidden rounded-3xl bg-white shadow-xl lg:col-span-7">
            {cover ? (
              <div className="relative aspect-[4/3] min-h-[340px]">
                <Image src={cover.url} alt={cover.altText || project.name} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 58vw" />
              </div>
            ) : (
              <div className="flex min-h-[430px] items-center justify-center bg-slate-100">
                <Building2 className="h-16 w-16 text-slate-300" />
              </div>
            )}
          </div>
          <div className="rounded-3xl bg-white p-8 shadow-xl lg:col-span-5">
            <h2 className="text-3xl font-semibold text-[#0F1D2F]">Proje Hakkında</h2>
            <p className="mt-5 whitespace-pre-line leading-7 text-slate-600">
              {project.longDescription}
            </p>
            <div className="mt-7 space-y-3">
              {units.map((unit) => (
                <div key={unit.id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
                  <span className="font-semibold">{unit.label}</span>
                  <span className="flex items-center gap-2 text-slate-600">
                    <Maximize className="h-4 w-4" />
                    {unit.areaMin === unit.areaMax
                      ? String(unit.areaMin)
                      : String(unit.areaMin) + "–" + String(unit.areaMax)} m²
                  </span>
                </div>
              ))}
            </div>
            {features.length > 0 && (
              <ul className="mt-6 grid gap-2 sm:grid-cols-2">
                {features.map((feature) => (
                  <li key={feature.id} className="flex items-center gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="h-4 w-4 text-[#CF000C]" /> {feature.name}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {exterior.length > 0 && (
          <MediaGallerySection
            title="Dış Mekân"
            projectName={project.name}
            imageType="dış mekan"
            images={exterior}
          />
        )}
        {interior.length > 0 && (
          <MediaGallerySection
            title="İç Mekân"
            projectName={project.name}
            imageType="iç mekan"
            images={interior}
          />
        )}

        <section id="konum" className="grid gap-8 lg:grid-cols-12">
          <div className="overflow-hidden rounded-3xl bg-white shadow-xl lg:col-span-7">
            {location ? (
              <div className="relative min-h-[360px]">
                <Image src={location.url} alt={location.altText || project.name + " konum"} fill className="object-cover" sizes="(max-width: 1024px) 100vw, 58vw" />
              </div>
            ) : (
              <div className="flex min-h-[360px] items-center justify-center bg-slate-100">
                <MapPin className="h-16 w-16 text-slate-300" />
              </div>
            )}
          </div>
          <div className="rounded-3xl bg-white p-8 shadow-xl lg:col-span-5">
            <h2 className="text-3xl font-semibold text-[#0F1D2F]">Konum</h2>
            <p className="mt-5 text-slate-600">
              {[project.neighborhood, project.district, project.city]
                .filter(Boolean)
                .join(", ")}
            </p>
            <p className="mt-2 text-sm leading-6 text-slate-500">{project.address}</p>
            {project.mapsUrl && (
              <a href={project.mapsUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#CF000C] px-5 py-3 text-sm font-semibold text-white">
                Google Maps’te Aç <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
