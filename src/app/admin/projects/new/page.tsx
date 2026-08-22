"use client";

import { Blocks, Building2, Home, Loader2, Store } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

const projectTypes = [
  {
    value: "housing",
    label: "Konut Projesi",
    description: "Apartman, rezidans ve toplu konut projeleri",
    icon: Building2,
  },
  {
    value: "villa",
    label: "Villa Projesi",
    description: "Tekil veya birden fazla villa projesi",
    icon: Home,
  },
  {
    value: "commercial",
    label: "Ticari Proje",
    description: "Ofis, mağaza ve iş merkezi projeleri",
    icon: Store,
  },
  {
    value: "mixed",
    label: "Karma Proje",
    description: "Konut ve ticari alanları birlikte sunan projeler",
    icon: Blocks,
  },
] as const;

export default function NewProjectPage() {
  const router = useRouter();
  const [pendingType, setPendingType] = useState<string>();
  const [error, setError] = useState("");

  async function createDraft(projectType: (typeof projectTypes)[number]["value"]) {
    setPendingType(projectType);
    setError("");
    try {
      const response = await fetch("/api/admin/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectType }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Taslak oluşturulamadı.");
      router.push("/admin/projects/edit/" + result.project.id);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Taslak oluşturulamadı.");
      setPendingType(undefined);
    }
  }

  return (
    <div className="mx-auto max-w-[1040px]">
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold tracking-[-0.025em]">Yeni Proje Ekle</h1>
        <p className="mt-1 text-sm text-[#707581]">
          İlk seçimle birlikte taslağınız oluşturulur ve otomatik kaydetme başlar.
        </p>
      </div>

      <div className="mb-9 flex items-center">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#d40000] text-sm font-semibold text-white">
          1
        </span>
        <span className="ml-3 text-sm font-semibold text-[#d40000]">Proje Türü</span>
        <span className="mx-4 h-px flex-1 bg-[#d9dce1]" />
        <span className="text-xs text-[#858a94]">2 Temel Bilgiler · 3 Konum · 4 Medya · 5 Yayın</span>
      </div>

      {error && (
        <p role="alert" className="mb-5 rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </p>
      )}

      <section className="rounded-md border border-[#dde0e5] bg-white p-6 sm:p-8">
        <h2 className="text-xl font-semibold">İlanınıza uygun proje türünü seçin</h2>
        <p className="mt-1 text-sm text-[#737985]">
          Bu seçim daha sonra temel bilgiler adımından değiştirilebilir.
        </p>

        <div className="mt-7 grid gap-4 sm:grid-cols-2">
          {projectTypes.map((type) => (
            <button
              key={type.value}
              type="button"
              disabled={Boolean(pendingType)}
              onClick={() => createDraft(type.value)}
              className="group flex min-h-32 items-center gap-5 rounded-md border border-[#d9dce1] p-5 text-left transition hover:border-[#d40000] hover:bg-[#fffafa] disabled:opacity-55"
            >
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-[#fff0f0] text-[#d40000]">
                {pendingType === type.value ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <type.icon className="h-6 w-6 stroke-[1.7]" />
                )}
              </span>
              <span>
                <span className="block font-semibold text-[#24272e]">{type.label}</span>
                <span className="mt-1.5 block text-sm leading-5 text-[#747a85]">
                  {type.description}
                </span>
              </span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
