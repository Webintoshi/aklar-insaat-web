"use client";

import { Plus, Save, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { WhatsAppAgentInput } from "@/lib/validation/whatsapp";

type Agent = WhatsAppAgentInput & { id: string; createdAt: string; updatedAt: string };
const emptyAgent: WhatsAppAgentInput = { name: "Satış Danışmanı", phone: "+90", messageTemplate: "Merhaba, projeleriniz hakkında bilgi almak istiyorum.", enabled: true, position: 0 };

export function WhatsAppAgentsEditor({ initialAgents }: { initialAgents: Agent[] }) {
  const router = useRouter();
  const [agents, setAgents] = useState(initialAgents);
  const [draft, setDraft] = useState<WhatsAppAgentInput>(emptyAgent);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function updateAgent(id: string, patch: Partial<WhatsAppAgentInput>) {
    setAgents((current) => current.map((agent) => agent.id === id ? { ...agent, ...patch } : agent));
  }

  async function request(path: string, method: "POST" | "PATCH" | "DELETE", body?: WhatsAppAgentInput) {
    const response = await fetch(path, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || "İşlem tamamlanamadı.");
    }
  }

  async function createAgent() {
    setPendingId("new"); setNotice(null);
    try { await request("/api/admin/whatsapp", "POST", draft); setDraft(emptyAgent); setNotice("Danışman eklendi."); router.refresh(); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Danışman eklenemedi."); }
    finally { setPendingId(null); }
  }

  async function saveAgent(agent: Agent) {
    setPendingId(agent.id); setNotice(null);
    try { await request(`/api/admin/whatsapp/${agent.id}`, "PATCH", agent); setNotice("Değişiklikler kaydedildi."); router.refresh(); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Kaydedilemedi."); }
    finally { setPendingId(null); }
  }

  async function deleteAgent(id: string) {
    if (!window.confirm("Bu danışmanı silmek istediğinize emin misiniz? Geçmiş tıklamalar korunur.")) return;
    setPendingId(id); setNotice(null);
    try { await request(`/api/admin/whatsapp/${id}`, "DELETE"); setAgents((current) => current.filter((agent) => agent.id !== id)); setNotice("Danışman silindi."); router.refresh(); }
    catch (error) { setNotice(error instanceof Error ? error.message : "Silinemedi."); }
    finally { setPendingId(null); }
  }

  const fields = (value: WhatsAppAgentInput, onChange: (patch: Partial<WhatsAppAgentInput>) => void) => (
    <div className="grid gap-4 md:grid-cols-12">
      <label className="md:col-span-3"><span className="mb-1 block text-xs font-semibold text-[#555b66]">Danışman adı</span><input className="admin-input w-full" value={value.name} onChange={(e) => onChange({ name: e.target.value })} /></label>
      <label className="md:col-span-3"><span className="mb-1 block text-xs font-semibold text-[#555b66]">Telefon (E.164)</span><input className="admin-input w-full" value={value.phone} onChange={(e) => onChange({ phone: e.target.value })} placeholder="+905551234567" /></label>
      <label className="md:col-span-1"><span className="mb-1 block text-xs font-semibold text-[#555b66]">Sıra</span><input type="number" min="0" className="admin-input w-full" value={value.position} onChange={(e) => onChange({ position: Number(e.target.value) })} /></label>
      <label className="flex items-end gap-2 pb-2 md:col-span-2"><input type="checkbox" checked={value.enabled} onChange={(e) => onChange({ enabled: e.target.checked })} /><span className="text-sm text-[#343942]">Sitede göster</span></label>
      <label className="md:col-span-12"><span className="mb-1 block text-xs font-semibold text-[#555b66]">Açılış mesajı</span><textarea className="admin-input min-h-20 w-full resize-y" maxLength={500} value={value.messageTemplate} onChange={(e) => onChange({ messageTemplate: e.target.value })} /></label>
    </div>
  );

  return <div className="space-y-4">
    {notice && <p role="status" className="rounded-md border border-[#e3e5e8] bg-white px-4 py-3 text-sm text-[#343942]">{notice}</p>}
    {agents.map((agent) => <section key={agent.id} className="rounded-lg border border-[#e3e5e8] bg-white p-5">{fields(agent, (patch) => updateAgent(agent.id, patch))}<div className="mt-4 flex justify-end gap-2"><button type="button" className="inline-flex items-center gap-2 rounded-md border border-[#d9dce1] px-3 py-2 text-sm text-[#555b66]" disabled={pendingId === agent.id} onClick={() => deleteAgent(agent.id)}><Trash2 className="h-4 w-4" />Sil</button><button type="button" className="inline-flex items-center gap-2 rounded-md bg-[#d40000] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={pendingId === agent.id} onClick={() => saveAgent(agent)}><Save className="h-4 w-4" />Kaydet</button></div></section>)}
    <section className="rounded-lg border border-dashed border-[#c9cdd3] bg-[#fafafa] p-5"><h2 className="mb-4 text-sm font-bold text-[#20242c]">Yeni danışman</h2>{fields(draft, (patch) => setDraft((current) => ({ ...current, ...patch })))}<div className="mt-4 flex justify-end"><button type="button" className="inline-flex items-center gap-2 rounded-md bg-[#20242c] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50" disabled={pendingId === "new"} onClick={createAgent}><Plus className="h-4 w-4" />Danışman ekle</button></div></section>
  </div>;
}
