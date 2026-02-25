'use client'

import Link from 'next/link'
import { Phone, Instagram } from 'lucide-react'

interface TopBarProps {
  phone?: string
}

export function TopBar({ phone = '0545 727 72 97' }: TopBarProps) {
  return (
    <div className="bg-white border-b border-gray-100">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-end h-10 gap-6">
          {/* Social Links */}
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/aklarinsaat.ordu/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-[#CF000C] transition-colors"
            >
              <Instagram className="w-4 h-4" />
            </a>
          </div>

          {/* Divider */}
          <div className="w-px h-4 bg-gray-200" />

          {/* Phone */}
          <a
            href={`tel:${phone.replace(/\s/g, '')}`}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#CF000C] transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span>{phone}</span>
          </a>
        </div>
      </div>
    </div>
  )
}
