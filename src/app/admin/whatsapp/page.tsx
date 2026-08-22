import { asc, count } from "drizzle-orm";
import { MessageCircle } from "lucide-react";

import { db } from "@/db/client";
import { whatsappAgents, whatsappClickEvents } from "@/db/schema";

import { WhatsAppAgentsEditor } from "./whatsapp-agents-editor";

export default async function WhatsAppAdminPage() {
  const [agents, [{ totalClicks }]] = await Promise.all([
    db.select().from(whatsappAgents).orderBy(asc(whatsappAgents.position)),
    db.select({ totalClicks: count() }).from(whatsappClickEvents),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#d40000]">İletişim kanalı</p>
          <h1 className="mt-1 text-2xl font-bold text-[#20242c]">WhatsApp</h1>
          <p className="mt-1 text-sm text-[#6b7280]">Sitede görünen danışmanları, sıralarını ve açılış mesajlarını yönetin.</p>
        </div>
        <div className="flex items-center gap-3 rounded-lg border border-[#e3e5e8] bg-white px-4 py-3">
          <MessageCircle className="h-5 w-5 text-[#25D366]" />
          <div>
            <p className="text-xs text-[#6b7280]">Toplam tıklama</p>
            <p className="text-xl font-bold text-[#20242c]">{totalClicks}</p>
          </div>
        </div>
      </div>
      <WhatsAppAgentsEditor
        initialAgents={agents.map((agent) => ({
          ...agent,
          createdAt: agent.createdAt.toISOString(),
          updatedAt: agent.updatedAt.toISOString(),
        }))}
      />
    </div>
  );
}
