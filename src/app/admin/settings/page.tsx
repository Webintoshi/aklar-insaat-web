import { eq } from "drizzle-orm";
import { Cloud, Database, LockKeyhole } from "lucide-react";

import { db } from "@/db/client";
import { siteSettings } from "@/db/schema";

import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [seo] = await db.select().from(siteSettings).where(eq(siteSettings.key, "seo")).limit(1);
  const cards = [
    { label: "PostgreSQL", value: "Coolify özel ağı", icon: Database },
    { label: "Cloudflare R2", value: "aklar-insaat-web", icon: Cloud },
    { label: "Admin Yetkisi", value: "Tek sahip hesabı", icon: LockKeyhole },
  ];

  return (
    <div className="mx-auto max-w-[980px]">
      <h1 className="text-[28px] font-semibold tracking-[-0.025em]">SEO ve Ayarlar</h1>
      <p className="mt-1 text-sm text-[#707581]">Site metadatası ve bağlantı durumlarını yönetin.</p>
      <div className="mt-7 grid gap-4 sm:grid-cols-3">
        {cards.map((card) => (
          <div key={card.label} className="rounded-md border border-[#dde0e5] bg-white p-5">
            <card.icon className="h-5 w-5 text-[#d40000]" />
            <p className="mt-4 text-xs text-[#777c87]">{card.label}</p>
            <p className="mt-1 text-sm font-semibold">{card.value}</p>
          </div>
        ))}
      </div>
      <section className="mt-6 rounded-md border border-[#dde0e5] bg-white p-6">
        <h2 className="text-lg font-semibold">Varsayılan SEO</h2>
        <p className="mt-1 text-sm text-[#747a85]">Proje bazında girilmeyen alanlarda kullanılır.</p>
        <div className="mt-6"><SettingsForm initialValue={(seo?.value as Record<string, unknown>) || {}} /></div>
      </section>
    </div>
  );
}
