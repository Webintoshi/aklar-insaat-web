'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'

interface HeroSectionProps {
  data: {
    background_image: string
    pre_title?: string
    title?: string
    highlight_word?: string
    description?: string
    badge_text?: string
    badge_subtext?: string
    cta_text?: string
    cta_link?: string
    show_gradient_overlay?: boolean
  }
}

export function HeroSection({ data }: HeroSectionProps) {
  const {
    background_image,
    pre_title = 'SİZE ÖZEL DAİRELER',
    title = 'Size Özel Yaşam',
    highlight_word = 'MODERN YAŞAM',
    badge_text = '3+1',
    badge_subtext = 'DAİRELER',
    cta_text = 'İNCELE',
    cta_link = '/projeler',
    show_gradient_overlay = true,
  } = data

  return (
    <section className="relative h-screen min-h-[700px] w-full overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={background_image}
          alt="Modern Yaşam"
          fill
          className="object-cover object-center"
          priority
          sizes="100vw"
          quality={90}
        />
        {/* Subtle gradient overlay for better text readability */}
        {show_gradient_overlay && (
          <div className="absolute inset-0 bg-gradient-to-l from-white/40 via-transparent to-transparent" />
        )}
      </div>

      {/* Content */}
      <div className="relative z-10 h-full container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-full flex items-center justify-end">
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-right max-w-xl mr-0 lg:mr-12"
          >
            {/* Pre-title */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-gray-800 text-sm md:text-base font-medium tracking-[0.2em] mb-4"
            >
              {pre_title}
            </motion.p>

            {/* Main Title - Script Font */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="font-serif italic text-4xl md:text-6xl lg:text-7xl text-gray-800 mb-2"
              style={{ fontFamily: 'Georgia, serif' }}
            >
              {title}
            </motion.h1>

            {/* Highlight Word */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-800 tracking-wide mb-8"
            >
              {highlight_word}
            </motion.h2>

            {/* Gold Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              className="inline-flex flex-col items-center justify-center w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-[#D4AF37] via-[#F4D03F] to-[#B7950B] rounded-full shadow-2xl border-4 border-white/30 mb-8"
            >
              <span className="text-3xl md:text-4xl font-bold text-gray-900">{badge_text}</span>
              <span className="text-sm md:text-base font-bold text-gray-900 uppercase tracking-wider">{badge_subtext}</span>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Link
                href={cta_link}
                className="inline-flex items-center justify-center px-10 py-3 bg-[#1E3A5F] text-white font-semibold text-lg rounded hover:bg-[#2E5A8F] transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                {cta_text}
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="w-6 h-10 border-2 border-gray-400 rounded-full flex justify-center pt-2"
        >
          <motion.div className="w-1.5 h-1.5 bg-gray-400 rounded-full" />
        </motion.div>
      </motion.div>
    </section>
  )
}
