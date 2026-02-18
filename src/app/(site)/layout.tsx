import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import '../globals.css'
import { Header } from './_components/Header'
import { WhatsAppWidget } from './_components/WhatsAppWidget'
import { Footer } from './_sections/Footer'
import { getFooterSettings } from '@/lib/api/frontend-data'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Aklar İnşaat | Kaliteli ve Modern Konut Projeleri',
  description: '20 yılı aşkın tecrübemizle hayalinizdeki evi inşa ediyoruz. Aklar İnşaat güvencesiyle konut projeleri ve satılık daireler.',
  keywords: ['inşaat', 'konut', 'daire', 'satılık ev', 'aklar inşaat', 'modern yaşam'],
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    siteName: 'Aklar İnşaat',
  },
}

export default async function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const footerData = await getFooterSettings()

  return (
    <html lang="tr" className={`${playfair.variable} ${inter.variable} scroll-smooth`}>
      <body className="font-sans antialiased bg-off-white text-gray-800">
        <Header />
        <div className="pt-[120px]">
          {children}
        </div>
        <Footer data={footerData} />
        <WhatsAppWidget />
      </body>
    </html>
  )
}
