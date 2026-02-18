'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'
import { Building, Users, Award, TrendingUp } from 'lucide-react'
import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'

const iconMap: Record<string, React.ReactNode> = {
  Building: <Building className="w-7 h-7" />,
  Users: <Users className="w-7 h-7" />,
  Award: <Award className="w-7 h-7" />,
  TrendingUp: <TrendingUp className="w-7 h-7" />,
}

function useCountUp(end: number, duration: number = 2000, start: boolean = false) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!start) return
    
    let startTime: number
    let animationFrame: number

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const easeOutExpo = 1 - Math.pow(2, -10 * progress)
      setCount(Math.floor(easeOutExpo * end))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationFrame)
  }, [end, duration, start])

  return count
}

function CounterCard({
  value,
  suffix,
  title,
  icon,
  target_number,
  isInView,
  index,
}: {
  value: string
  suffix: string | null
  title: string
  icon: string
  target_number: number | null
  isInView: boolean
  index: number
}) {
  const Icon = iconMap[icon]
  const count = useCountUp(target_number || 0, 2000, isInView)
  const displayValue = target_number ? count : value

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-2xl p-8 shadow-md hover:shadow-xl transition-shadow duration-500 border border-gray-100 flex-shrink-0 w-[280px] sm:w-[300px]"
    >
      <div className="w-14 h-14 bg-gradient-to-br from-[#C9A962]/20 to-[#C9A962]/10 rounded-xl flex items-center justify-center text-[#C9A962] mb-6">
        {Icon || <Building className="w-7 h-7" />}
      </div>
      
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-4xl sm:text-5xl font-bold text-[#1E3A5F]">
          {displayValue}
        </span>
        {suffix && (
          <span className="text-2xl font-bold text-[#C9A962]">
            {suffix}
          </span>
        )}
      </div>
      
      <p className="text-gray-600 font-medium">{title}</p>
    </motion.div>
  )
}

interface InfoCard {
  id: string
  icon: string
  title: string
  value: string
  suffix: string | null
  target_number: number | null
}

interface InfoCardsSectionProps {
  data: {
    pre_title: string
    title: string
    description: string | null
    cards: InfoCard[]
  }
}

export function InfoCardsSection({ data }: InfoCardsSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const { pre_title, title, description, cards } = data

  const [emblaRef] = useEmblaCarousel(
    { loop: true, align: 'start', skipSnaps: false, dragFree: true },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  )

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-[#FAFAF8] overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <p className="text-[#C9A962] text-sm uppercase tracking-[0.15em] mb-4 font-medium">
            {pre_title}
          </p>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            {title}
          </h2>
          {description && (
            <p className="text-gray-600 text-lg">
              {description}
            </p>
          )}
        </motion.div>

        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex gap-6">
            {cards.map((card, index) => (
              <CounterCard
                key={card.id}
                value={card.value}
                suffix={card.suffix}
                title={card.title}
                icon={card.icon}
                target_number={card.target_number}
                isInView={isInView}
                index={index}
              />
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-10">
          {cards.map((_, index) => (
            <button
              key={index}
              className="w-2 h-2 rounded-full bg-[#1E3A5F]/20 hover:bg-[#1E3A5F]/50 transition-colors"
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
