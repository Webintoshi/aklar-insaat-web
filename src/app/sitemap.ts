import { eq } from "drizzle-orm";
import type { MetadataRoute } from "next";

import { db } from "@/db/client";
import { contentPages, projects } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://orduaklarinsaat.com"
  ).replace(/\/+$/, "");
  const [publishedProjects, publishedPages] = await Promise.all([
    db
      .select({ slug: projects.slug, updatedAt: projects.updatedAt })
      .from(projects)
      .where(eq(projects.publicationStatus, "published")),
    db
      .select({ slug: contentPages.slug, updatedAt: contentPages.updatedAt })
      .from(contentPages)
      .where(eq(contentPages.status, "published")),
  ]);

  return [
    { url: baseUrl, changeFrequency: "weekly", priority: 1 },
    { url: baseUrl + "/projeler", changeFrequency: "weekly", priority: 0.9 },
    { url: baseUrl + "/kurumsal", changeFrequency: "monthly", priority: 0.7 },
    { url: baseUrl + "/taahhut", changeFrequency: "monthly", priority: 0.7 },
    { url: baseUrl + "/iletisim", changeFrequency: "monthly", priority: 0.8 },
    ...publishedProjects.map((project) => ({
      url: baseUrl + "/projeler/" + project.slug,
      lastModified: project.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...publishedPages.map((page) => ({
      url: baseUrl + "/" + page.slug,
      lastModified: page.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
  ];
}
