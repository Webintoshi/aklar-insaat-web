'use client'

import Image from 'next/image'
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

              {/* Slide Content - Removed text overlays, images only */}
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
