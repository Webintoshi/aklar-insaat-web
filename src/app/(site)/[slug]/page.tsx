import { and, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { db } from "@/db/client";
import { contentPages } from "@/db/schema";

async function getContentPage(slug: string) {
  const [page] = await db
    .select()
    .from(contentPages)
    .where(
      and(eq(contentPages.slug, slug), eq(contentPages.status, "published")),
    )
    .limit(1);
  return page;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const page = await getContentPage((await params).slug);
  if (!page) return { title: "Sayfa Bulunamadı" };
  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription || page.excerpt || undefined,
    alternates: { canonical: "/" + page.slug },
  };
}

export default async function ContentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const page = await getContentPage((await params).slug);
  if (!page) notFound();

  return (
    <main className="bg-white">
      <header className="bg-[#1E3A5F] px-4 py-16 text-white">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-semibold md:text-5xl">{page.title}</h1>
          {page.excerpt && <p className="mt-5 text-lg text-white/80">{page.excerpt}</p>}
        </div>
      </header>
      <article className="mx-auto max-w-4xl whitespace-pre-wrap px-4 py-14 text-[16px] leading-8 text-slate-700">
        {page.body}
      </article>
    </main>
  );
}
