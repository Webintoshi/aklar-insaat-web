'use client'

import Link from 'next/link'
import { ArrowUpRight, Clock, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Twitter, Youtube } from 'lucide-react'

const socialIcons: Record<string, React.ReactNode> = {
  instagram: <Instagram className="h-4 w-4" />,
  facebook: <Facebook className="h-4 w-4" />,
  twitter: <Twitter className="h-4 w-4" />,
  linkedin: <Linkedin className="h-4 w-4" />,
  youtube: <Youtube className="h-4 w-4" />,
}

interface FooterProps {
  data: {
    description: string
    social_links: {
      platform: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'youtube'
      url: string
    }[]
    quick_links: {
      label: string
      url: string
    }[]
    contact_info: {
      address: string
      phone: string
      email: string
      working_hours: string
    }
    copyright_text: string
    legal_links: {
      label: string
      url: string
    }[]
  }
}

const defaultQuickLinks = [
  { label: 'Ana Sayfa', url: '/' },
  { label: 'Kurumsal', url: '/kurumsal' },
  { label: 'Taahhüt', url: '/taahhut' },
  { label: 'İletişim', url: '/iletisim' },
]

const defaultContact = {
  phone: '0545 727 72 97',
  email: 'aklarinsaat@outlook.com',
  address: 'ŞİRİNEVLER MAH ZÜBEYDE HANIM CAD NO:243/A',
  working_hours: '09:00-18:00',
}

export function Footer({ data }: FooterProps) {
  const { description, social_links, quick_links, contact_info, copyright_text, legal_links } = data
  const currentYear = new Date().getFullYear()
  const linksToShow = quick_links?.length ? quick_links : defaultQuickLinks
  const phone = contact_info?.phone?.trim() || defaultContact.phone
  const email = contact_info?.email?.trim() || defaultContact.email
  const address = contact_info?.address?.trim() || defaultContact.address
  const workingHours = contact_info?.working_hours?.trim() || defaultContact.working_hours

  return (
    <footer className="relative overflow-hidden border-t border-[#CF000C]/70 bg-[#0b1322] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_0%_0%,rgba(46,90,143,0.25),transparent_45%),radial-gradient(circle_at_100%_100%,rgba(207,0,12,0.18),transparent_42%)]" />
      </div>

      <div className="relative container mx-auto px-4 py-12 sm:px-6 lg:px-8 xl:px-12 lg:py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-4">
            <img src="/logoypng_48.png" alt="Aklar İnşaat" className="h-12 w-auto object-contain lg:h-14" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-slate-300">
              {description || 'Aklar İnşaat olarak kaliteli ve modern konut projeleri üretiyoruz.'}
            </p>

            {social_links?.length > 0 ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {social_links.map((link) => {
                  const icon = socialIcons[link.platform]
                  if (!icon) return null
                  return (
                    <a
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/15 bg-white/5 text-slate-200 transition hover:border-[#CF000C] hover:bg-[#CF000C] hover:text-white"
                    >
                      {icon}
                    </a>
                  )
                })}
              </div>
            ) : null}
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Hızlı Linkler</h4>
            <ul className="mt-4 space-y-3">
              {linksToShow.map((link) => (
                <li key={link.url}>
                  <Link href={link.url} className="group inline-flex items-center gap-1 text-sm text-slate-200 transition hover:text-white">
                    {link.label}
                    <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">Projeler</h4>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/projeler" className="group inline-flex items-center gap-1 text-sm text-slate-200 transition hover:text-white">
                  Tüm Projeler
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <Link href="/projeler?status=completed" className="group inline-flex items-center gap-1 text-sm text-slate-200 transition hover:text-white">
                  Tamamlanan Projeler
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                </Link>
              </li>
              <li>
                <Link href="/projeler?status=ongoing" className="group inline-flex items-center gap-1 text-sm text-slate-200 transition hover:text-white">
                  Devam Eden Projeler
                  <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                </Link>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-3">
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">İletişim</h4>
            <ul className="mt-4 space-y-3 text-sm text-slate-200">
              <li className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#CF000C]" />
                <span>{address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 shrink-0 text-[#CF000C]" />
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="transition hover:text-white/80">
                  {phone}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 shrink-0 text-[#CF000C]" />
                <a href={`mailto:${email}`} className="transition hover:text-white/80">
                  {email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Clock className="h-4 w-4 shrink-0 text-[#CF000C]" />
                <span>{workingHours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-5">
          <div className="flex flex-col items-start justify-between gap-3 text-xs text-slate-400 sm:flex-row sm:items-center">
            <p>{copyright_text?.replace('2024', currentYear.toString()) || `© ${currentYear} Aklar İnşaat. Tüm hakları saklıdır.`}</p>
            {legal_links?.length > 0 ? (
              <div className="flex flex-wrap gap-4">
                {legal_links.map((link) => (
                  <Link key={link.url} href={link.url} className="transition hover:text-white">
                    {link.label}
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  )
}
