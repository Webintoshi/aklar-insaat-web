'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useState, useEffect, useCallback } from 'react'
import { Building, Users, Award, TrendingUp, Shield, Heart, Lightbulb, Smile, Clock, CheckCircle, HardHat, Cpu, ScrollText, ChevronLeft, ChevronRight } from 'lucide-react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

const iconMap: Record<string, React.ReactNode> = {
  Building: <Building className="w-7 h-7" />,
  Users: <Users className="w-7 h-7" />,
  Award: <Award className="w-7 h-7" />,
  TrendingUp: <TrendingUp className="w-7 h-7" />,
  Shield: <Shield className="w-7 h-7" />,
  Heart: <Heart className="w-7 h-7" />,
  Lightbulb: <Lightbulb className="w-7 h-7" />,
  Smile: <Smile className="w-7 h-7" />,
  Clock: <Clock className="w-7 h-7" />,
  CheckCircle: <CheckCircle className="w-7 h-7" />,
  HardHat: <HardHat className="w-7 h-7" />,
  Cpu: <Cpu className="w-7 h-7" />,
  ScrollText: <ScrollText className="w-7 h-7" />,
}

interface InfoCard {
  id: string
  icon: string
  title: string
  value: string
  suffix: string | null
  target_number: number | null
  description: string | null
}

interface InfoCardsSectionProps {
  data: {
    id: string
    type: 'stats' | 'values'
    pre_title: string
    title: string
    description: string | null
    cards: InfoCard[]
  }
}

// Stats Card Component
function StatsCard({ card }: { card: InfoCard }) {
  const Icon = iconMap[card.icon]
  
  return (
    <div className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 text-center h-full group flex flex-col">
      <div className="w-16 h-16 bg-gradient-to-br from-[#CF000C]/20 to-[#CF000C]/10 rounded-xl flex items-center justify-center text-[#CF000C] mb-6 mx-auto group-hover:scale-110 transition-transform duration-300">
        {Icon || <Building className="w-7 h-7" />}
      </div>
      
      <div className="flex items-baseline justify-center gap-1 mb-2">
        <span className="text-4xl sm:text-5xl font-bold text-[#1E3A5F]">
          {card.value}
        </span>
        {card.suffix && (
          <span className="text-2xl font-bold text-[#CF000C]">
            {card.suffix}
          </span>
        )}
      </div>
      
      <p className="text-gray-600 font-medium">{card.title}</p>
    </div>
  )
}

// Value Card Component
function ValueCard({ card, number }: { card: InfoCard; number: number }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 h-full group flex flex-col">
      {/* Siyah numara kutusu */}
      <div className="mb-5">
        <div className="w-14 h-14 bg-[#2D2D2D] flex items-center justify-center group-hover:bg-[#CF000C] transition-colors duration-300">
          <span className="text-white text-2xl font-bold">{number}</span>
        </div>
      </div>
      
      {/* Başlık */}
      <h3 className="text-lg font-bold text-gray-900 mb-3">{card.title}</h3>
      
      {/* Açıklama */}
      <p className="text-gray-600 text-sm leading-relaxed flex-1">{card.description}</p>
    </div>
  )
}

export function InfoCardsSection({ data }: InfoCardsSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const { type, pre_title, title, description, cards } = data

  // Embla carousel with autoplay
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { 
      loop: true, 
      align: 'start',
      containScroll: 'trimSnaps',
      skipSnaps: false,
      slidesToScroll: 1,
    },
    type === 'values' ? [Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true })] : []
  )

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [scrollSnaps, setScrollSnaps] = useState<number[]>([])
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(false)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi])

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    setScrollSnaps(emblaApi.scrollSnapList())
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)
    onSelect()
    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  return (
    <section ref={ref} className="py-20 lg:py-28 bg-[#FAFAF8] overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <p className="text-[#CF000C] text-sm uppercase tracking-[0.2em] mb-4 font-medium">
            {pre_title}
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4 tracking-wide">
            {title}
          </h2>
          {description && (
            <p className="text-gray-600 text-lg">
              {description}
            </p>
          )}
        </motion.div>

        {/* Carousel Container */}
        <div className="relative">
          {/* Carousel */}
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-6">
              {type === 'stats' ? (
                cards.map((card, index) => (
                  <div 
                    key={card.id} 
                    className="flex-[0_0_100%] sm:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(25%-18px)] min-w-0"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="h-full"
                    >
                      <StatsCard card={card} />
                    </motion.div>
                  </div>
                ))
              ) : (
                cards.map((card, index) => (
                  <div 
                    key={card.id} 
                    className="flex-[0_0_100%] sm:flex-[0_0_calc(50%-12px)] lg:flex-[0_0_calc(33.333%-16px)] xl:flex-[0_0_calc(25%-18px)] min-w-0"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ duration: 0.5, delay: index * 0.08 }}
                      className="h-full"
                    >
                      <ValueCard card={card} number={index + 1} />
                    </motion.div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Navigation Arrows */}
          {scrollSnaps.length > 1 && (
            <>
              <button
                onClick={scrollPrev}
                disabled={!canScrollPrev && !emblaApi?.options().loop}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-[#CF000C] hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hidden lg:flex"
                aria-label="Önceki"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={scrollNext}
                disabled={!canScrollNext && !emblaApi?.options().loop}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 z-10 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-[#CF000C] hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hidden lg:flex"
                aria-label="Sonraki"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
        </div>

        {/* Dot Navigation */}
        {scrollSnaps.length > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            {scrollSnaps.map((_, index) => (
              <button
                key={index}
                onClick={() => scrollTo(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  selectedIndex === index 
                    ? 'bg-[#1E3A5F] w-8' 
                    : 'bg-[#1E3A5F]/20 hover:bg-[#1E3A5F]/50 w-2'
                }`}
                aria-label={`Sayfa ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
