'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Phone, ChevronDown, Instagram, Facebook, Linkedin, LayoutGrid } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const navLinks = [
  { label: 'ANASAYFA', href: '/' },
  { label: 'KURUMSAL', href: '/kurumsal' },
  { label: 'TAAHHÜT', href: '/taahhut' },
  { 
    label: 'PROJELER', 
    href: '/projeler',
    dropdown: [
      { label: 'Tamamlanan Projeler', href: '/projeler?status=completed' },
      { label: 'Devam Eden Projeler', href: '/projeler?status=ongoing' },
    ]
  },
  { label: 'İLETİŞİM', href: '/iletisim' },
]

interface HeaderProps {
  phone?: string
}

export function Header({ phone = '0545 727 72 97' }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* TopBar + Header Container */}
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-white'
        }`}
      >
        {/* TopBar */}
        <div className={`border-b border-gray-100 transition-all duration-300 ${isScrolled ? 'h-0 opacity-0 overflow-hidden' : 'h-10 opacity-100'}`}>
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 h-full">
            <div className="flex items-center justify-end h-full gap-6">
              {/* Social Links */}
              <div className="flex items-center gap-4">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#CF000C] transition-colors">
                  <Instagram className="w-4 h-4" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#CF000C] transition-colors">
                  <Facebook className="w-4 h-4" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-[#CF000C] transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
              </div>

              {/* Divider */}
              <div className="w-px h-4 bg-gray-200" />

              {/* Phone */}
              <a href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#CF000C] transition-colors">
                <Phone className="w-4 h-4" />
                <span>{phone}</span>
              </a>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`flex items-center justify-between transition-all duration-300 ${isScrolled ? 'h-16' : 'h-20'}`}>
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <img 
                src="/logoypng_48.png" 
                alt="Aklar İnşaat" 
                className={`w-auto object-contain transition-all duration-300 ${isScrolled ? 'h-8' : 'h-10'}`}
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {navLinks.map((link) => (
                <div 
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => link.dropdown && setOpenDropdown(link.label)}
                  onMouseLeave={() => setOpenDropdown(null)}
                >
                  <Link
                    href={link.href}
                    className="flex items-center gap-1 text-sm font-semibold tracking-wide text-gray-800 transition-colors hover:text-[#CF000C]"
                  >
                    {link.label}
                    {link.dropdown && <ChevronDown className="w-4 h-4" />}
                  </Link>
                  
                  {/* Dropdown */}
                  <AnimatePresence>
                    {link.dropdown && openDropdown === link.label && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-100 py-2"
                      >
                        {link.dropdown.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-[#CF000C]/10 hover:text-[#CF000C] transition-colors"
                          >
                            {item.label}
                          </Link>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* Social & Phone - Desktop */}
              <div className="hidden xl:flex items-center gap-4">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#CF000C] transition-colors">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#CF000C] transition-colors">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-[#CF000C] transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="flex items-center gap-2 text-sm font-semibold text-gray-800 transition-colors hover:text-[#CF000C]">
                  <Phone className="w-4 h-4" />
                  {phone}
                </a>
              </div>

              {/* CTA Button */}
              <Link
                href="/daire-secimi"
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-[#CF000C] text-white text-sm font-semibold rounded hover:bg-[#a8000a] transition-colors"
              >
                <LayoutGrid className="w-4 h-4" />
                Daire Seçimi
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-gray-800 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute right-0 top-0 bottom-0 w-80 bg-white shadow-2xl"
            >
              <div className="p-6 pt-20">
                <div className="flex items-center gap-3 mb-8">
                  <Phone className="w-5 h-5 text-[#CF000C]" />
                  <span className="font-semibold text-gray-800">{phone}</span>
                </div>
                
                <ul className="space-y-1">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block py-3 px-4 text-lg font-semibold text-gray-800 hover:bg-[#CF000C]/10 hover:text-[#CF000C] rounded-lg transition-colors"
                      >
                        {link.label}
                      </Link>
                      {link.dropdown && (
                        <div className="ml-4 mt-1 space-y-1">
                          {link.dropdown.map((item) => (
                            <Link
                              key={item.href}
                              href={item.href}
                              onClick={() => setIsMobileMenuOpen(false)}
                              className="block py-2 px-4 text-sm text-gray-600 hover:text-[#CF000C]"
                            >
                              {item.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
                
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <Link
                    href="/daire-secimi"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-[#CF000C] text-white font-semibold rounded-lg hover:bg-[#a8000a] transition-colors"
                  >
                    <LayoutGrid className="w-4 h-4" />
                    Daire Seçimi
                  </Link>
                </div>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
