'use client'

import { motion, useInView } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import { Shield, Award, Clock, Heart, ArrowRight } from 'lucide-react'

const iconMap: Record<string, React.ReactNode> = {
  Shield: <Shield className="w-6 h-6" />,
  Award: <Award className="w-6 h-6" />,
  Clock: <Clock className="w-6 h-6" />,
  Heart: <Heart className="w-6 h-6" />,
}

interface AboutSectionProps {
  data: {
    image_url: string
    image_caption: string | null
    experience_badge: {
      years: number
      text: string
    }
    pre_title: string
    title: string
    highlight_word: string
    description: string
    features: {
      icon: string
      title: string
      description: string
    }[]
    cta_text: string
    cta_link: string
  }
}

export function AboutSection({ data }: AboutSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const {
    image_url,
    image_caption,
    experience_badge,
    pre_title,
    title,
    highlight_word,
    description,
    features,
    cta_text,
    cta_link,
  } = data

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-[#FAFAF8]">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image Column */}
          <motion.div
            initial={{ opacity: 0, clipPath: 'inset(0 100% 0 0)' }}
            animate={isInView ? { opacity: 1, clipPath: 'inset(0 0% 0 0)' } : {}}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src={image_url}
                alt={image_caption || title}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Experience Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
              animate={isInView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="absolute -right-4 lg:-right-8 bottom-20 bg-gradient-to-br from-[#C9A962] to-[#9A7E3C] p-6 rounded-xl shadow-[0_10px_40px_-10px_rgba(201,169,98,0.4)]"
            >
              <p className="text-4xl font-bold text-[#0F1D2F]">
                {experience_badge.years}+
              </p>
              <p className="text-[#0F1D2F]/80 text-sm font-medium">
                {experience_badge.text}
              </p>
            </motion.div>

            {image_caption && (
              <p className="mt-4 text-gray-500 text-sm text-center lg:text-left">
                {image_caption}
              </p>
            )}
          </motion.div>

          {/* Content Column */}
          <div className="lg:pl-8">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-[#C9A962] text-sm uppercase tracking-[0.15em] mb-4 font-medium"
            >
              {pre_title}
            </motion.p>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-6"
            >
              {title}
              {highlight_word && (
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C9A962] to-[#9A7E3C]">
                  {' '}{highlight_word}
                </span>
              )}
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-gray-600 text-lg leading-relaxed mb-10"
            >
              {description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="grid sm:grid-cols-2 gap-6 mb-10"
            >
              {features?.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.6 + index * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="p-3 bg-[#1E3A5F]/10 rounded-lg text-[#1E3A5F] shrink-0">
                    {iconMap[feature.icon] || <Shield className="w-6 h-6" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <Link
                href={cta_link}
                className="inline-flex items-center text-[#1E3A5F] font-semibold hover:text-[#C9A962] transition-colors group"
              >
                {cta_text}
                <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
