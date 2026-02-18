'use client'

import Link from 'next/link'
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Linkedin, ArrowUpRight, Building2 } from 'lucide-react'

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

  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-[#0a0f1a] text-white relative overflow-hidden">
      {/* Animated gradient top border */}
      <div className="h-1 bg-gradient-to-r from-transparent via-[#CF000C] to-transparent" />
      
      {/* Background glow effect */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#CF000C]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#1E3A5F]/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-16 lg:py-24 relative z-10">
        {/* Main Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          
          {/* Column 1: Brand - Takes 5 columns */}
          <div className="lg:col-span-5">
            {/* Logo with glow effect */}
            <div className="relative inline-block mb-8">
              <div className="absolute inset-0 bg-[#CF000C]/20 blur-xl rounded-full" />
              <img 
                src="/logoypng_48.png" 
                alt="Aklar İnşaat" 
                className="h-20 lg:h-24 w-auto object-contain relative z-10 drop-shadow-2xl"
              />
            </div>
            
            <p className="text-gray-400 mb-8 leading-relaxed text-sm lg:text-base max-w-md">
              {description}
            </p>

            {/* Social Links - Modern style */}
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
                      className="group w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-[#CF000C] hover:border-[#CF000C] hover:scale-110 transition-all duration-300"
                    >
                      {Icon}
                    </a>
                  ) : null
                })}
              </div>
            )}
          </div>

          {/* Column 2: Quick Links - Takes 2 columns */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-6">
              Hızlı Linkler
            </h4>
            <ul className="space-y-4">
              {quick_links?.map((link) => (
                <li key={link.url}>
                  <Link
                    href={link.url}
                    className="group text-gray-400 hover:text-white transition-all duration-300 inline-flex items-center gap-1 text-sm"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#CF000C] opacity-0 group-hover:opacity-100 transition-opacity" />
                    {link.label}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Projects - Takes 2 columns */}
          <div className="lg:col-span-2">
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-6">
              Projelerimiz
            </h4>
            <ul className="space-y-4">
              <li>
                <Link 
                  href="/projeler" 
                  className="group text-gray-400 hover:text-white transition-all duration-300 inline-flex items-center gap-1 text-sm"
                >
                  <Building2 className="w-4 h-4 mr-1 text-[#CF000C]" />
                  Tüm Projeler
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </Link>
              </li>
              <li>
                <Link 
                  href="/projeler?status=completed" 
                  className="group text-gray-400 hover:text-white transition-all duration-300 inline-flex items-center gap-1 text-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1" />
                  Tamamlanan Projeler
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </Link>
              </li>
              <li>
                <Link 
                  href="/projeler?status=ongoing" 
                  className="group text-gray-400 hover:text-white transition-all duration-300 inline-flex items-center gap-1 text-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1" />
                  Devam Eden Projeler
                  <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact - Takes 3 columns */}
          <div className="lg:col-span-3">
            <h4 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-6">
              İletişim
            </h4>
            <ul className="space-y-5">
              <li className="group">
                <a 
                  href={`https://maps.google.com/?q=${encodeURIComponent(contact_info?.address || '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 text-gray-400 hover:text-white transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-[#CF000C]/20 transition-colors">
                    <MapPin className="w-4 h-4 text-[#CF000C]" />
                  </div>
                  <span className="text-sm leading-relaxed pt-2">{contact_info?.address}</span>
                </a>
              </li>
              <li className="group">
                <a 
                  href={`tel:${contact_info?.phone}`} 
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-[#CF000C]/20 transition-colors">
                    <Phone className="w-4 h-4 text-[#CF000C]" />
                  </div>
                  <span className="text-sm">{contact_info?.phone}</span>
                </a>
              </li>
              <li className="group">
                <a 
                  href={`mailto:${contact_info?.email}`} 
                  className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors"
                >
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0 group-hover:bg-[#CF000C]/20 transition-colors">
                    <Mail className="w-4 h-4 text-[#CF000C]" />
                  </div>
                  <span className="text-sm">{contact_info?.email}</span>
                </a>
              </li>
              <li className="group">
                <div className="flex items-center gap-3 text-gray-400">
                  <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-[#CF000C]" />
                  </div>
                  <span className="text-sm">{contact_info?.working_hours}</span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar - Modern style */}
        <div className="mt-16 lg:mt-20 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-gray-600 text-sm">
              {copyright_text?.replace('2024', currentYear.toString()) || `© ${currentYear} Aklar İnşaat. Tüm hakları saklıdır.`}
            </p>
            
            {legal_links && legal_links.length > 0 && (
              <div className="flex gap-8">
                {legal_links.map((link) => (
                  <Link
                    key={link.url}
                    href={link.url}
                    className="text-gray-500 hover:text-[#CF000C] text-sm transition-colors relative group"
                  >
                    {link.label}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#CF000C] group-hover:w-full transition-all duration-300" />
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
