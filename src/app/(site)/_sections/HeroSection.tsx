'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Slide {
  id: string
  image: string
  mobile_image?: string
  pre_title?: string
  title?: string
  highlight_word?: string
  badge_text?: string
  badge_subtext?: string
  cta_text?: string
  cta_link?: string
}

interface HeroSectionProps {
  data: {
    background_type: 'image' | 'video' | 'slider'
    background_image: string
    slider_images: Slide[]
    pre_title?: string
    title?: string
    highlight_word?: string
    badge_text?: string
    badge_subtext?: string
    cta_text?: string
    cta_link?: string
    autoplay?: boolean
    autoplay_speed?: number
  }
}

export function HeroSection({ data }: HeroSectionProps) {
  const {
    background_type,
    background_image,
    slider_images,
    pre_title = 'SİZE ÖZEL DAİRELER',
    title = 'Size Özel Yaşam',
    highlight_word = 'MODERN YAŞAM',
    badge_text = '3+1',
    badge_subtext = 'DAİRELER',
    cta_text = 'İNCELE',
    cta_link = '/projeler',
    autoplay = true,
    autoplay_speed = 5000,
  } = data

  // Slider için embla
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: 'start' },
    autoplay ? [Autoplay({ delay: autoplay_speed, stopOnInteraction: false })] : []
  )

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    setScrollSnaps(emblaApi.scrollSnapList())
    emblaApi.on('select', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi, onSelect])

  // Tek görsel modu
  if (background_type !== 'slider' || !slider_images || slider_images.length === 0) {
    return (
      <section className="relative w-full aspect-[1920/800] min-h-[500px] max-h-[800px] overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={background_image}
            alt="Hero"
            fill
            className="object-cover object-center"
            priority
            sizes="100vw"
            quality={90}
          />
          <div className="absolute inset-0 bg-gradient-to-l from-white/30 via-transparent to-transparent" />
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
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-gray-800 text-sm md:text-base font-medium tracking-[0.2em] mb-4"
              >
                {pre_title}
              </motion.p>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="font-serif italic text-4xl md:text-6xl lg:text-7xl text-gray-800 mb-2"
                style={{ fontFamily: 'Georgia, serif' }}
              >
                {title}
              </motion.h1>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-800 tracking-wide mb-8"
              >
                {highlight_word}
              </motion.h2>

              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.7 }}
                className="inline-flex flex-col items-center justify-center w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-[#CF000C] via-[#FF3333] to-[#990000] rounded-full shadow-2xl border-4 border-white/50 mb-8"
              >
                <span className="text-3xl md:text-4xl font-bold text-gray-900">{badge_text}</span>
                <span className="text-sm md:text-base font-bold text-gray-900 uppercase tracking-wider">{badge_subtext}</span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <Link
                  href={cta_link}
                  className="inline-flex items-center justify-center px-10 py-3 bg-[#CF000C] text-white font-semibold text-lg rounded hover:bg-[#990000] transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  {cta_text}
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    )
  }

  // Slider modu
  return (
    <section className="relative w-full aspect-[1920/800] min-h-[500px] max-h-[800px] overflow-hidden">
      <div className="overflow-hidden h-full" ref={emblaRef}>
        <div className="flex h-full">
          {slider_images.map((slide, index) => (
            <div key={slide.id} className="flex-[0_0_100%] min-w-0 relative h-full">
              {/* Slide Background */}
              <div className="absolute inset-0">
                {/* Mobil görsel (md'den küçük ekranlar) */}
                {slide.mobile_image && (
                  <Image
                    src={slide.mobile_image}
                    alt={slide.title || `Slide ${index + 1}`}
                    fill
                    className="object-cover object-center md:hidden"
                    priority={index === 0}
                    sizes="100vw"
                    quality={90}
                  />
                )}
                {/* Desktop görsel */}
                <Image
                  src={slide.image}
                  alt={slide.title || `Slide ${index + 1}`}
                  fill
                  className={`object-cover object-center ${slide.mobile_image ? 'hidden md:block' : ''}`}
                  priority={index === 0}
                  sizes="100vw"
                  quality={90}
                />
                <div className="absolute inset-0 bg-gradient-to-l from-white/30 via-transparent to-transparent" />
              </div>

              {/* Slide Content */}
              <div className="relative z-10 h-full container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-full flex items-center justify-end">
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: selectedIndex === index ? 1 : 0, x: selectedIndex === index ? 0 : 50 }}
                    transition={{ duration: 0.8 }}
                    className="text-right max-w-xl mr-0 lg:mr-12"
                  >
                    <p className="text-gray-800 text-sm md:text-base font-medium tracking-[0.2em] mb-4">
                      {slide.pre_title || pre_title}
                    </p>

                    <h1
                      className="font-serif italic text-4xl md:text-6xl lg:text-7xl text-gray-800 mb-2"
                      style={{ fontFamily: 'Georgia, serif' }}
                    >
                      {slide.title || title}
                    </h1>

                    <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-gray-800 tracking-wide mb-8">
                      {slide.highlight_word || highlight_word}
                    </h2>

                    <div className="inline-flex flex-col items-center justify-center w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-[#D4AF37] via-[#F4D03F] to-[#B7950B] rounded-full shadow-2xl border-4 border-white/30 mb-8">
                      <span className="text-3xl md:text-4xl font-bold text-gray-900">{slide.badge_text || badge_text}</span>
                      <span className="text-sm md:text-base font-bold text-gray-900 uppercase tracking-wider">{slide.badge_subtext || badge_subtext}</span>
                    </div>

                    <div>
                      <Link
                        href={slide.cta_link || cta_link}
                        className="inline-flex items-center justify-center px-10 py-3 bg-[#1E3A5F] text-white font-semibold text-lg rounded hover:bg-[#2E5A8F] transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                      >
                        {slide.cta_text || cta_text}
                      </Link>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={scrollPrev}
        className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
        aria-label="Önceki slide"
      >
        <ChevronLeft className="w-6 h-6 text-gray-800" />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 z-20 w-12 h-12 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all hover:scale-110"
        aria-label="Sonraki slide"
      >
        <ChevronRight className="w-6 h-6 text-gray-800" />
      </button>

      {/* Pagination Dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
        {scrollSnaps.map((_, index) => (
          <button
            key={index}
            onClick={() => scrollTo(index)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${
              index === selectedIndex
                ? 'bg-[#1E3A5F] w-8'
                : 'bg-white/70 hover:bg-white'
            }`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  )
}
