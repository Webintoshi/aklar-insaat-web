'use client'

import { useState } from 'react'
import { motion, AnimatePresence, useInView } from 'framer-motion'
import Image from 'next/image'
import { useRef } from 'react'
import { Play, X } from 'lucide-react'

interface VideoSectionProps {
  data: {
    background_image: string
    video_type: 'youtube' | 'vimeo' | 'self_hosted'
    video_id: string
    video_url: string | null
    title: string | null
    description: string | null
    play_button_text: string
    autoplay: boolean
  }
}

export function VideoSection({ data }: VideoSectionProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  const { background_image, video_type, video_id, title, description, play_button_text, autoplay } = data

  const getVideoEmbedUrl = () => {
    if (video_type === 'youtube') {
      return `https://www.youtube.com/embed/${video_id}?autoplay=${autoplay ? 1 : 0}&rel=0`
    }
    return ''
  }

  return (
    <>
      <section
        ref={ref}
        className="relative h-[50vh] sm:h-[60vh] lg:h-[70vh] overflow-hidden"
      >
        <motion.div
          initial={{ scale: 1.1 }}
          animate={isInView ? { scale: 1 } : {}}
          transition={{ duration: 1.5 }}
          className="absolute inset-0"
        >
          <Image
            src={background_image}
            alt="Video thumbnail"
            fill
            className="object-cover"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-[#1E3A5F]/50" />
        </motion.div>

        <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(true)}
            className="relative group mb-8"
          >
            <span className="absolute inset-0 rounded-full bg-[#C9A962]/30 animate-ping" />
            <span className="absolute inset-0 rounded-full bg-[#C9A962]/20 animate-pulse" />
            
            <div className="relative w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br from-[#C9A962] to-[#9A7E3C] flex items-center justify-center shadow-[0_10px_40px_-10px_rgba(201,169,98,0.4)] group-hover:shadow-[0_0_60px_rgba(201,169,98,0.5)] transition-shadow duration-500">
              <Play className="w-10 h-10 sm:w-12 sm:h-12 text-[#0F1D2F] ml-1" fill="currentColor" />
            </div>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <p className="text-[#E8D5A3] text-sm uppercase tracking-[0.15em] mb-2 font-medium">
              {play_button_text}
            </p>
            {title && (
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-white/80 max-w-lg mx-auto">
                {description}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => setIsOpen(false)}
              className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </motion.button>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-5xl mx-4 aspect-video"
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                src={getVideoEmbedUrl()}
                title="Video"
                className="absolute inset-0 w-full h-full rounded-xl"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
