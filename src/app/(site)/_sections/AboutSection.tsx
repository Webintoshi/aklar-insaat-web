'use client'

import { motion, useInView } from 'framer-motion'
import Image from 'next/image'
import { useRef } from 'react'

interface AboutSectionProps {
  data: {
    image_url: string
    image_caption: string | null
    experience_badge: {
      years: number
      text: string
    }
    subtitle: string
    paragraphs: string[]
    highlight_text: string
  }
}

export function AboutSection({ data }: AboutSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const {
    image_url,
    image_caption,
    experience_badge,
    subtitle,
    paragraphs,
    highlight_text,
  } = data

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="grid lg:grid-cols-2 gap-0 items-stretch">
          {/* Image Column - Full height */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="relative h-[500px] lg:h-[700px]"
          >
            <div className="absolute inset-0 overflow-hidden">
              <Image
                src={image_url}
                alt={image_caption || 'Aklar İnşaat'}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>

            {/* Experience Badge - Bottom left */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="absolute bottom-8 left-8 bg-[#CF000C] px-6 py-4 shadow-lg"
            >
              <p className="text-3xl font-bold text-white">
                {experience_badge.years}+
              </p>
              <p className="text-white/90 text-sm font-medium">
                {experience_badge.text}
              </p>
            </motion.div>
          </motion.div>

          {/* Content Column - White card overlay */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white lg:-ml-20 relative z-10 flex flex-col justify-center"
          >
            <div className="p-8 lg:p-12 lg:pl-16">
              {/* Subtitle with line */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex items-center gap-4 mb-8"
              >
                <div className="w-12 h-[2px] bg-[#CF000C]" />
                <span className="text-[#CF000C] text-sm font-semibold tracking-[0.2em] uppercase">
                  {subtitle}
                </span>
              </motion.div>

              {/* Paragraphs */}
              <div className="space-y-6">
                {paragraphs?.map((paragraph, index) => (
                  <motion.p
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                    className="text-gray-700 text-base leading-[1.8] text-justify"
                  >
                    {paragraph}
                  </motion.p>
                ))}
              </div>

              {/* Highlight Box */}
              {highlight_text && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.6 }}
                  className="mt-8 bg-[#8B0000] p-6 lg:p-8"
                >
                  <p className="text-white text-sm leading-[1.8] text-justify">
                    {highlight_text}
                  </p>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Image Caption */}
        {image_caption && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="mt-6 text-gray-500 text-sm text-center lg:text-left lg:ml-4"
          >
            {image_caption}
          </motion.p>
        )}
      </div>
    </section>
  )
}
