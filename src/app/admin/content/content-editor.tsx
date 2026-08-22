"use client";

import { CheckCircle2, Loader2, Save } from "lucide-react";
import { useState } from "react";

type Section = {
  id: string;
  sectionKey: string;
  name: string;
  status: "draft" | "published" | "archived";
  content: Record<string, unknown>;
};

export function ContentEditor({ section }: { section: Section }) {
  const [name, setName] = useState(section.name);
  const [status, setStatus] = useState(section.status);
  const [content, setContent] = useState(JSON.stringify(section.content, null, 2));
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [error, setError] = useState("");

  async function save() {
    setState("saving");
    setError("");
    try {
      const parsed = JSON.parse(content);
      const response = await fetch("/api/admin/content/sections/" + section.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, status, content: parsed }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "İçerik kaydedilemedi.");
      setState("saved");
    } catch (reason) {
      setState("error");
      setError(reason instanceof Error ? reason.message : "İçerik kaydedilemedi.");
    }
  }

  return (
    <details className="group border-b border-[#e3e5e8] last:border-b-0">
      <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-5">
        <div>
          <p className="font-semibold text-[#292c33]">{name}</p>
          <p className="mt-1 text-xs text-[#7a808b]">{section.sectionKey} · {status}</p>
        </div>
        <span className="text-xs font-semibold text-[#d40000] group-open:hidden">Düzenle</span>
      </summary>
      <div className="space-y-4 px-5 pb-6">
        <label className="block text-sm font-semibold">
          Bölüm Adı
          <input value={name} onChange={(event) => setName(event.target.value)} className="admin-input mt-2" />
        </label>
        <label className="block text-sm font-semibold">
          Yayın Durumu
          <select value={status} onChange={(event) => setStatus(event.target.value as Section["status"])} className="admin-input mt-2">
            <option value="draft">Taslak</option>
            <option value="published">Yayında</option>
            <option value="archived">Arşiv</option>
          </select>
        </label>
        <label className="block text-sm font-semibold">
          Bölüm Verisi
          <textarea value={content} onChange={(event) => setContent(event.target.value)} spellCheck={false} className="mt-2 min-h-72 w-full rounded-md border border-[#cfd3d9] bg-[#f8f9fa] p-4 font-mono text-xs leading-6 outline-none focus:border-[#d40000]" />
        </label>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
        <button type="button" onClick={save} disabled={state === "saving"} className="inline-flex h-11 items-center gap-2 rounded-md bg-[#d40000] px-5 text-sm font-semibold text-white disabled:opacity-55">
          {state === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : state === "saved" ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
          {state === "saved" ? "Kaydedildi" : "Kaydet"}
        </button>
      </div>
    </details>
  );
}
