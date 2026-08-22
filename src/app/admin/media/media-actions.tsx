"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function MediaActions({ id, usage }: { id: string; usage: number }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");

  async function remove() {
    if (usage > 0 || !window.confirm("Bu R2 nesnesi kalıcı silme kuyruğuna alınacak. Devam edilsin mi?")) return;
    setPending(true);
    const response = await fetch("/api/admin/media/" + id, { method: "DELETE" });
    const result = await response.json();
    if (!response.ok) {
      setError(result.error || "Silme işi oluşturulamadı.");
      setPending(false);
      return;
    }
    router.refresh();
  }

  return (
    <div>
      <button type="button" disabled={pending || usage > 0} onClick={remove} className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#d40000] disabled:text-[#9da1a9]">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
        {usage > 0 ? "Kullanımda" : "Kalıcı Sil"}
      </button>
      {error && <p className="mt-2 text-xs text-red-700">{error}</p>}
    </div>
  );
}
