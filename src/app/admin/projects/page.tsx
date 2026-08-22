import { desc } from "drizzle-orm";
import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";

import { db } from "@/db/client";
import { projects } from "@/db/schema";

export const dynamic = "force-dynamic";

const typeLabels = {
  housing: "Konut",
  villa: "Villa",
  commercial: "Ticari",
  mixed: "Karma",
} as const;

const statusLabels = {
  draft: "Taslak",
  published: "Yayında",
  archived: "Arşiv",
} as const;

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export default async function ProjectsPage() {
  const projectRows = await db
    .select()
    .from(projects)
    .orderBy(desc(projects.updatedAt))
    .limit(100);

  return (
    <div className="mx-auto max-w-[1180px]">
      <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-[28px] font-semibold tracking-[-0.025em]">Projeler</h1>
          <p className="mt-1 text-sm text-[#707581]">
            Taslakları tamamlayın, önizleyin ve yayına alın.
          </p>
        </div>
        <Link
          href="/admin/projects/new"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-md bg-[#d40000] px-5 text-sm font-semibold text-white hover:bg-[#b90000]"
        >
          <Plus className="h-4 w-4" /> Yeni Proje Ekle
        </Link>
      </div>

      <section className="overflow-hidden rounded-md border border-[#dde0e5] bg-white">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="h-11 border-b border-[#e3e5e8] text-xs text-[#777c87]">
                <th className="px-5 font-medium">Proje</th>
                <th className="font-medium">Tür</th>
                <th className="font-medium">Aşama</th>
                <th className="font-medium">Durum</th>
                <th className="font-medium">Son Güncelleme</th>
                <th aria-label="İşlem" />
              </tr>
            </thead>
            <tbody>
              {projectRows.map((project) => (
                <tr
                  key={project.id}
                  className="h-16 border-b border-[#eceef1] text-sm last:border-b-0 hover:bg-[#fcfcfd]"
                >
                  <td className="px-5">
                    <p className="font-semibold text-[#252830]">{project.name}</p>
                    <p className="mt-0.5 text-xs text-[#858a94]">{project.slug}</p>
                  </td>
                  <td className="text-[#555b66]">{typeLabels[project.projectType]}</td>
                  <td className="text-[#555b66]">
                    {project.constructionStage === "completed"
                      ? "Tamamlandı"
                      : project.constructionStage === "ongoing"
                        ? "Devam Ediyor"
                        : "Belirtilmedi"}
                  </td>
                  <td>
                    <span className="rounded bg-[#f1f2f4] px-2.5 py-1 text-xs text-[#5e646f]">
                      {statusLabels[project.publicationStatus]}
                    </span>
                  </td>
                  <td className="text-xs text-[#777c87]">{formatDate(project.updatedAt)}</td>
                  <td className="pr-5 text-right">
                    <Link
                      href={"/admin/projects/edit/" + project.id}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#d40000]"
                    >
                      Düzenle <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {projectRows.length === 0 && (
          <div className="px-5 py-20 text-center text-sm text-[#777c87]">
            Henüz proje yok. İlk taslağınızı oluşturarak başlayın.
          </div>
        )}
      </section>
    </div>
  );
}
