'use client'

import Link from 'next/link'
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Linkedin } from 'lucide-react'

const socialIcons: Record<string, React.ReactNode> = {
  facebook: <Facebook className="w-5 h-5" />,
  instagram: <Instagram className="w-5 h-5" />,
  linkedin: <Linkedin className="w-5 h-5" />,
}

interface FooterProps {
  data: {
    description: string
    social_links: {
      platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter' | 'youtube'
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

export function Footer({ data }: FooterProps) {

  const { description, social_links, quick_links, contact_info, copyright_text, legal_links } = data

  return (
    <footer className="bg-[#0F1D2F] text-white">
      <div className="h-1 bg-gradient-to-r from-[#C9A962] via-[#E8D5A3] to-[#C9A962]" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-16 lg:py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Column 1: Brand */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold mb-6">
              Aklar <span className="text-[#C9A962]">İnşaat</span>
            </h3>
            
            <p className="text-gray-400 mb-6 leading-relaxed">
              {description}
            </p>

            {social_links && social_links.length > 0 && (
              <div className="flex gap-4">
                {social_links.map((link) => {
                  const Icon = socialIcons[link.platform]
                  return Icon ? (
                    <a
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#C9A962] hover:text-[#0F1D2F] transition-all duration-300"
                    >
                      {Icon}
                    </a>
                  ) : null
                })}
              </div>
            )}
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Hızlı Linkler</h4>
            <ul className="space-y-3">
              {quick_links?.map((link) => (
                <li key={link.url}>
                  <Link
                    href={link.url}
                    className="text-gray-400 hover:text-[#C9A962] transition-colors inline-flex items-center group"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-[#C9A962] mr-0 group-hover:mr-2 transition-all duration-300" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Projects */}
          <div>
            <h4 className="text-lg font-semibold mb-6">Projelerimiz</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/projeler" className="text-gray-400 hover:text-[#C9A962] transition-colors">
                  Tüm Projeler
                </Link>
              </li>
              <li>
                <Link href="/projeler?status=completed" className="text-gray-400 hover:text-[#C9A962] transition-colors">
                  Tamamlanan Projeler
                </Link>
              </li>
              <li>
                <Link href="/projeler?status=ongoing" className="text-gray-400 hover:text-[#C9A962] transition-colors">
                  Devam Eden Projeler
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-6">İletişim</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#C9A962] shrink-0 mt-0.5" />
                <span className="text-gray-400">{contact_info?.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-[#C9A962] shrink-0" />
                <a href={`tel:${contact_info?.phone}`} className="text-gray-400 hover:text-[#C9A962] transition-colors">
                  {contact_info?.phone}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-[#C9A962] shrink-0" />
                <a href={`mailto:${contact_info?.email}`} className="text-gray-400 hover:text-[#C9A962] transition-colors">
                  {contact_info?.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#C9A962] shrink-0" />
                <span className="text-gray-400">{contact_info?.working_hours}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              {copyright_text || '© 2024 Aklar İnşaat. Tüm hakları saklıdır.'}
            </p>
            
            {legal_links && legal_links.length > 0 && (
              <div className="flex gap-6">
                {legal_links.map((link) => (
                  <Link
                    key={link.url}
                    href={link.url}
                    className="text-gray-500 hover:text-[#C9A962] text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  )
}
