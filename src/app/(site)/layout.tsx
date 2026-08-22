import { asc, eq } from "drizzle-orm";
import type { Metadata } from "next";

import { db } from "@/db/client";
import { whatsappAgents } from "@/db/schema";
import { getFooterSettings } from "@/lib/api/frontend-data";

import { Header } from "./_components/Header";
import { WhatsAppWidget } from "./_components/WhatsAppWidget";
import { Footer } from "./_sections/Footer";
import { PreFooter } from "./_sections/PreFooter";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Aklar İnşaat | Kaliteli ve Modern Konut Projeleri",
    template: "%s | Aklar İnşaat",
  },
  description:
    "Ordu’da modern konut, villa, ticari ve karma projeler. Aklar İnşaat güvencesiyle nitelikli yaşam alanları.",
  keywords: ["inşaat", "konut", "villa", "Ordu", "Aklar İnşaat"],
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://orduaklarinsaat.com",
  ),
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Aklar İnşaat",
  },
};

async function getWhatsAppAgent() {
  const [agent] = await db
    .select()
    .from(whatsappAgents)
    .where(eq(whatsappAgents.enabled, true))
    .orderBy(asc(whatsappAgents.position))
    .limit(1);
  return agent;
}

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [footerData, agent] = await Promise.all([
    getFooterSettings(),
    getWhatsAppAgent(),
  ]);

  return (
    <>
      <Header />
      <div className="pt-[120px]">{children}</div>
      <PreFooter />
      <Footer data={footerData} />
      {agent && (
        <WhatsAppWidget
          agentId={agent.id}
          phone={agent.phone}
          message={agent.messageTemplate}
        />
      )}
    </>
  );
}
