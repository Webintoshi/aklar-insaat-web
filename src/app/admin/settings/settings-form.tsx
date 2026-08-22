"use client";

import { CheckCircle2, Loader2, Save } from "lucide-react";
import { useState } from "react";

export function SettingsForm({
  initialValue,
}: {
  initialValue: Record<string, unknown>;
}) {
  const [title, setTitle] = useState(String(initialValue.defaultTitle || ""));
  const [description, setDescription] = useState(String(initialValue.defaultDescription || ""));
  const [state, setState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  async function save() {
    setState("saving");
    const response = await fetch("/api/admin/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        key: "seo",
        value: { defaultTitle: title, defaultDescription: description },
      }),
    });
    setState(response.ok ? "saved" : "error");
  }

  return (
    <div className="space-y-5">
      <label className="block text-sm font-semibold">
        Varsayılan Site Başlığı
        <input value={title} onChange={(event) => setTitle(event.target.value)} className="admin-input mt-2" maxLength={70} />
      </label>
      <label className="block text-sm font-semibold">
        Varsayılan Meta Açıklaması
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} className="admin-input mt-2 min-h-28 py-3" maxLength={170} />
      </label>
      <button type="button" onClick={save} disabled={state === "saving"} className="inline-flex h-11 items-center gap-2 rounded-md bg-[#d40000] px-5 text-sm font-semibold text-white disabled:opacity-55">
        {state === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> : state === "saved" ? <CheckCircle2 className="h-4 w-4" /> : <Save className="h-4 w-4" />}
        {state === "saved" ? "Kaydedildi" : state === "error" ? "Tekrar Dene" : "Ayarları Kaydet"}
      </button>
    </div>
  );
}
