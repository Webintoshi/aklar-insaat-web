"use client";

import { CheckCircle2, Loader2, Save } from "lucide-react";
import { useState } from "react";

type Page = { id: string; slug: string; title: string; excerpt: string | null; body: string; status: "draft" | "published" | "archived"; seoTitle: string | null; seoDescription: string | null };

export function ContentPageEditor({ page }: { page: Page }) {
  const [value, setValue] = useState(page);
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save() {
    setState("saving");
    const response = await fetch(`/api/admin/content/pages/${page.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: value.title, excerpt: value.excerpt, body: value.body, status: value.status, seoTitle: value.seoTitle, seoDescription: value.seoDescription }) });
    setState(response.ok ? "saved" : "error");
  }

  return <details className="group border-b border-[#e7e9ec] last:border-0">
    <summary className="flex cursor-pointer list-none items-center justify-between py-4"><div><p className="font-semibold">{value.title}</p><p className="mt-1 text-xs text-[#7a808b]">/{page.slug} · {value.status}</p></div><span className="text-xs font-semibold text-[#d40000] group-open:hidden">Düzenle</span></summary>
    <div className="grid gap-4 pb-6 md:grid-cols-2">
      <label className="text-sm font-semibold">Başlık<input className="admin-input mt-2 w-full" value={value.title} onChange={(e) => setValue({ ...value, title: e.target.value })} /></label>
      <label className="text-sm font-semibold">Yayın durumu<select className="admin-input mt-2 w-full" value={value.status} onChange={(e) => setValue({ ...value, status: e.target.value as Page["status"] })}><option value="draft">Taslak</option><option value="published">Yayında</option><option value="archived">Arşiv</option></select></label>
      <label className="text-sm font-semibold md:col-span-2">Özet<textarea className="admin-input mt-2 min-h-20 w-full" value={value.excerpt || ""} onChange={(e) => setValue({ ...value, excerpt: e.target.value || null })} /></label>
      <label className="text-sm font-semibold md:col-span-2">Metin<textarea className="admin-input mt-2 min-h-80 w-full" value={value.body} onChange={(e) => setValue({ ...value, body: e.target.value })} /></label>
      <label className="text-sm font-semibold">SEO başlığı<input className="admin-input mt-2 w-full" maxLength={70} value={value.seoTitle || ""} onChange={(e) => setValue({ ...value, seoTitle: e.target.value || null })} /></label>
      <label className="text-sm font-semibold">SEO açıklaması<textarea className="admin-input mt-2 min-h-20 w-full" maxLength={170} value={value.seoDescription || ""} onChange={(e) => setValue({ ...value, seoDescription: e.target.value || null })} /></label>
      <div className="md:col-span-2"><button type="button" onClick={save} disabled={state === "saving"} className="inline-flex h-11 items-center gap-2 rounded-md bg-[#d40000] px-5 text-sm font-semibold text-white disabled:opacity-55">{state === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : state === "saved" ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}{state === "saved" ? "Kaydedildi" : state === "error" ? "Tekrar dene" : "Sayfayı kaydet"}</button></div>
    </div>
  </details>;
}
