import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import '../globals.css'
import { Header } from './_components/Header'

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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function initWA() {
                  if (window.location.pathname.includes('/admin')) return;
                  
                  var link = document.createElement('a');
                  link.href = 'https://wa.me/905457277297?text=Merhaba%2C%20web%20sitenizden%20ula%C5%9F%C4%B1yorum.';
                  link.target = '_blank';
                  link.rel = 'noopener noreferrer';
                  link.id = 'wa-widget-btn';
                  link.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:9999;width:60px;height:60px;background:#25D366;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,0.25);cursor:pointer;transition:transform 0.3s;text-decoration:none;';
                  link.innerHTML = '<svg viewBox=\"0 0 24 24\" style=\"width:32px;height:32px;fill:white;\"><path d=\"M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z\"/></svg>';
                  link.onmouseenter = function() { this.style.transform = 'scale(1.1)'; };
                  link.onmouseleave = function() { this.style.transform = 'scale(1)'; };
                  document.body.appendChild(link);
                }
                
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', initWA);
                } else {
                  initWA();
                }
              })();
            `
          }}
        />
      </body>
    </html>
  )
}
