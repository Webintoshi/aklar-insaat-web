'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Phone, ChevronDown, Instagram, Facebook, LayoutGrid } from 'lucide-react'
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
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-md shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg">K</span>
              </div>
              <div className="flex flex-col">
                <span className={`text-xl font-bold leading-tight transition-colors ${
                  isScrolled ? 'text-red-600' : 'text-red-600'
                }`}>
                  AKLAR
                </span>
                <span className={`text-[10px] tracking-[0.3em] font-semibold -mt-1 transition-colors ${
                  isScrolled ? 'text-gray-800' : 'text-gray-800'
                }`}>
                  İNŞAAT
                </span>
              </div>
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
                    className={`flex items-center gap-1 text-sm font-semibold tracking-wide transition-colors hover:text-red-600 ${
                      isScrolled ? 'text-gray-800' : 'text-gray-800'
                    }`}
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
                            className="block px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
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
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" 
                  className={`transition-colors hover:text-red-600 ${isScrolled ? 'text-gray-600' : 'text-gray-600'}`}>
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                  className={`transition-colors hover:text-red-600 ${isScrolled ? 'text-gray-600' : 'text-gray-600'}`}>
                  <Facebook className="w-5 h-5" />
                </a>
                <a href={`tel:${phone.replace(/\s/g, '')}`} 
                  className={`flex items-center gap-2 text-sm font-semibold transition-colors hover:text-red-600 ${
                    isScrolled ? 'text-gray-800' : 'text-gray-800'
                  }`}>
                  <Phone className="w-4 h-4" />
                  {phone}
                </a>
              </div>

              {/* CTA Button */}
              <Link
                href="/daire-secimi"
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-semibold rounded hover:bg-red-700 transition-colors"
              >
                <LayoutGrid className="w-4 h-4" />
                Daire Seçimi
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className={`lg:hidden p-2 rounded-lg transition-colors ${
                  isScrolled ? 'text-gray-800' : 'text-gray-800'
                }`}
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
                  <Phone className="w-5 h-5 text-red-600" />
                  <span className="font-semibold text-gray-800">{phone}</span>
                </div>
                
                <ul className="space-y-1">
                  {navLinks.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="block py-3 px-4 text-lg font-semibold text-gray-800 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
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
                              className="block py-2 px-4 text-sm text-gray-600 hover:text-red-600"
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
                    className="flex items-center justify-center gap-2 w-full py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors"
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
