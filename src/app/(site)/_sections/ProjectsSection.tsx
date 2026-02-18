'use client'

import { motion, useInView } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useRef } from 'react'
import { MapPin, Calendar, ArrowRight, Bed, Maximize } from 'lucide-react'

const statusLabels: Record<string, { text: string; className: string }> = {
  completed: { text: 'Tamamlandı', className: 'bg-blue-500' },
  ongoing: { text: 'Devam Ediyor', className: 'bg-amber-500' },
}

interface Project {
  id: string
  slug: string
  title: string
  description: string | null
  status: 'completed' | 'ongoing'
  location: string | null
  completion_date: string | null
  featured_image: string | null
  features: {
    icon: string
    label: string
    value: string
  }[]
}

interface ProjectsSectionProps {
  projects: Project[]
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section ref={ref} className="py-24 lg:py-32 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[#C9A962] text-sm uppercase tracking-[0.15em] mb-4 font-medium">
              Projelerimiz
            </p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900">
              Tamamlanan ve{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#C9A962] to-[#9A7E3C]">
                Devam Eden
              </span>
              {' '}Projeler
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link
              href="/projeler"
              className="inline-flex items-center text-[#1E3A5F] font-semibold hover:text-[#C9A962] transition-colors group"
            >
              Tüm Projeler
              <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Projects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {projects.map((project, index) => {
            const status = statusLabels[project.status] || { text: project.status, className: 'bg-gray-500' }
            const featuredImage = project.featured_image || '/images/placeholder.jpg'

            return (
              <motion.article
                key={project.id}
                initial={{ opacity: 0, y: 40 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <Link href={`/projeler/${project.slug}`}>
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden mb-5">
                    <Image
                      src={featuredImage}
                      alt={project.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    
                    <div className={`absolute top-4 right-4 px-3 py-1 ${status.className} text-white text-xs font-medium rounded-full`}>
                      {status.text}
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                      <span className="inline-flex items-center text-white font-medium">
                        Detayları Gör
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-[#1E3A5F] transition-colors">
                      {project.title}
                    </h3>
                    
                    {project.location && (
                      <div className="flex items-center text-gray-500 text-sm">
                        <MapPin className="w-4 h-4 mr-1" />
                        {project.location}
                      </div>
                    )}

                    {project.completion_date && (
                      <div className="flex items-center text-gray-500 text-sm">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(project.completion_date).getFullYear()}
                      </div>
                    )}

                    {project.features && project.features.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-2">
                        {project.features.slice(0, 3).map((feature) => (
                          <span
                            key={feature.label}
                            className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                          >
                            {feature.value}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              </motion.article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
