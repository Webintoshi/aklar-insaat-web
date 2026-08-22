import { asc } from "drizzle-orm";

import { db } from "@/db/client";
import { contentPages, siteSections } from "@/db/schema";

import { ContentEditor } from "./content-editor";
import { ContentPageEditor } from "./content-page-editor";

export const dynamic = "force-dynamic";

export default async function SiteContentPage() {
  const [sections, pages] = await Promise.all([
    db.select().from(siteSections).orderBy(asc(siteSections.position)),
    db.select().from(contentPages).orderBy(asc(contentPages.title)),
  ]);

  return (
    <div className="mx-auto max-w-[1040px]">
      <h1 className="text-[28px] font-semibold tracking-[-0.025em]">Site İçerikleri</h1>
      <p className="mt-1 text-sm text-[#707581]">
        Ana sayfa bölümlerini ve yasal metinlerin yayın durumunu yönetin.
      </p>

      <section className="mt-7 overflow-hidden rounded-md border border-[#dde0e5] bg-white">
        <div className="border-b border-[#dde0e5] px-5 py-4">
          <h2 className="font-semibold">Ana Sayfa Bölümleri</h2>
        </div>
        {sections.map((section) => (
          <ContentEditor
            key={section.id}
            section={{
              id: section.id,
              sectionKey: section.sectionKey,
              name: section.name,
              status: section.status,
              content: section.content,
            }}
          />
        ))}
        {sections.length === 0 && <p className="p-8 text-center text-sm text-[#777c87]">İçerik bölümleri veri göçüyle oluşturulacak.</p>}
      </section>

      <section className="mt-6 rounded-md border border-[#dde0e5] bg-white p-5">
        <h2 className="font-semibold">İçerik Sayfaları</h2>
        <div className="mt-4 divide-y divide-[#e7e9ec]">
          {pages.map((page) => <ContentPageEditor key={page.id} page={page} />)}
          {pages.length === 0 && <p className="py-7 text-sm text-[#777c87]">KVKK ve Gizlilik metinleri hukuk onayı gelene kadar taslak kalacak.</p>}
        </div>
      </section>
    </div>
  );
}
