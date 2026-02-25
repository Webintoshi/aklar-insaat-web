'use client'

import Link from 'next/link'
import { MapPin, Phone, Mail, Clock, Instagram, Facebook, Twitter, Linkedin, Youtube, ArrowUpRight } from 'lucide-react'

const socialIcons: Record<string, React.ReactNode> = {
  instagram: <Instagram className="w-5 h-5" />,
  facebook: <Facebook className="w-5 h-5" />,
  twitter: <Twitter className="w-5 h-5" />,
  linkedin: <Linkedin className="w-5 h-5" />,
  youtube: <Youtube className="w-5 h-5" />,
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

export function Footer({ data }: FooterProps) {
  const { description, social_links, quick_links, contact_info, copyright_text, legal_links } = data

  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative text-white overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src="/images/about-building.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#0a0f1a]/95" />
      </div>

      {/* Top border */}
      <div className="relative h-0.5 bg-[#CF000C]" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-12 lg:py-16">
        {/* Main Grid - Balanced 4 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          
          {/* Column 1: Brand */}
          <div className="lg:col-span-1">
            {/* Logo */}
            <img 
              src="/logoypng_48.png" 
              alt="Aklar İnşaat" 
              className="h-12 lg:h-14 w-auto object-contain mb-5"
            />
            
            <p className="text-gray-400 mb-5 leading-relaxed text-sm">
              {description}
            </p>

            {/* Social Links */}
            {social_links && social_links.length > 0 && (
              <div className="flex gap-3">
                {social_links.map((link) => {
                  const Icon = socialIcons[link.platform]
                  return Icon ? (
                    <a
                      key={link.platform}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center hover:bg-[#CF000C] transition-colors duration-200"
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
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
              Hızlı Linkler
            </h4>
            <ul className="space-y-3">
              {quick_links?.map((link) => (
                <li key={link.url}>
                  <Link
                    href={link.url}
                    className="group text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1"
                  >
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Projects */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
              Projelerimiz
            </h4>
            <ul className="space-y-3">
              <li>
                <Link 
                  href="/projeler" 
                  className="group text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1"
                >
                  Tüm Projeler
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link 
                  href="/projeler?status=completed" 
                  className="group text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1"
                >
                  Tamamlanan Projeler
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link 
                  href="/projeler?status=ongoing" 
                  className="group text-gray-400 hover:text-white transition-colors text-sm flex items-center gap-1"
                >
                  Devam Eden Projeler
                  <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">
              İletişim
            </h4>
            <ul className="space-y-4">
              <li>
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(contact_info?.address || '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  <MapPin className="w-4 h-4 text-[#CF000C] shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{contact_info?.address}</span>
                </a>
              </li>
              <li>
                <a 
                  href={`tel:${contact_info?.phone}`} 
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  <Phone className="w-4 h-4 text-[#CF000C] shrink-0" />
                  <span>{contact_info?.phone}</span>
                </a>
              </li>
              <li>
                <a 
                  href={`mailto:${contact_info?.email}`} 
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors text-sm"
                >
                  <Mail className="w-4 h-4 text-[#CF000C] shrink-0" />
                  <span>{contact_info?.email}</span>
                </a>
              </li>
              <li className="flex items-center gap-3 text-gray-400 text-sm">
                <Clock className="w-4 h-4 text-[#CF000C] shrink-0" />
                <span>{contact_info?.working_hours}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-xs">
              {copyright_text?.replace('2024', currentYear.toString()) || `© ${currentYear} Aklar İnşaat. Tüm hakları saklıdır.`}
            </p>
            
            {legal_links && legal_links.length > 0 && (
              <div className="flex gap-6">
                {legal_links.map((link) => (
                  <Link
                    key={link.url}
                    href={link.url}
                    className="text-gray-500 hover:text-[#CF000C] text-xs transition-colors"
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
