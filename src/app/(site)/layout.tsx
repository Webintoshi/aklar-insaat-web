import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import '../globals.css'

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

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr" className={`${playfair.variable} ${inter.variable} scroll-smooth`}>
      <body className="font-sans antialiased bg-off-white text-gray-800">
        {children}
      </body>
    </html>
  )
}
