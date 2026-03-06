'use client'

import { motion, useInView } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ArrowRight, BedDouble, ChevronLeft, ChevronRight, Clock3, MapPin, Ruler, Sparkles } from 'lucide-react'

const statusLabels: Record<string, { text: string; className: string }> = {
  completed: { text: 'Tamamlandi', className: 'bg-blue-600/90 text-white' },
  ongoing: { text: 'Devam Ediyor', className: 'bg-amber-500/90 text-white' },
}

interface ProjectFeature {
  icon: string
  label: string
  value: string
}

interface Project {
  id: string
  slug: string
  title: string
  name?: string | null
  description: string | null
  status: 'completed' | 'ongoing'
  project_status?: 'completed' | 'ongoing' | null
  location: string | null
  completion_date: string | null
  featured_image: string | null
  features: ProjectFeature[]
}

interface ProjectsSectionProps {
  projects: Project[]
}

function featureIcon(label: string) {
  const lower = label.toLowerCase()
  if (lower.includes('oda') || lower.includes('tip')) return <BedDouble className="h-4 w-4" />
  if (lower.includes('m2') || lower.includes('alan')) return <Ruler className="h-4 w-4" />
  return <Sparkles className="h-4 w-4" />
}

export function ProjectsSection({ projects }: ProjectsSectionProps) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-120px' })

  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: projects.length > 3,
    align: 'start',
    containScroll: 'trimSnaps',
    slidesToScroll: 1,
  })

  const [selectedIndex, setSelectedIndex] = useState(0)
  const [canScrollPrev, setCanScrollPrev] = useState(false)
  const [canScrollNext, setCanScrollNext] = useState(projects.length > 1)
  const scrollSnaps = emblaApi ? emblaApi.scrollSnapList() : []

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
    setCanScrollPrev(emblaApi.canScrollPrev())
    setCanScrollNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    emblaApi.on('reInit', onSelect)

    return () => {
      emblaApi.off('select', onSelect)
      emblaApi.off('reInit', onSelect)
    }
  }, [emblaApi, onSelect])

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])
  const scrollTo = useCallback((index: number) => emblaApi?.scrollTo(index), [emblaApi])

  return (
    <section ref={ref} className="relative overflow-hidden bg-[#f4f7fb] py-20 lg:py-28">
      <div className="pointer-events-none absolute inset-0 opacity-80">
        <div className="absolute -top-32 -left-16 h-72 w-72 rounded-full bg-[#1E3A5F]/8 blur-3xl" />
        <div className="absolute -bottom-28 right-0 h-72 w-72 rounded-full bg-[#CF000C]/10 blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.28em] text-[#CF000C]">Seçili Projeler</p>
            <h2 className="text-3xl font-semibold leading-tight text-[#0F1D2F] sm:text-4xl lg:text-5xl">
              Premium
              <span className="bg-gradient-to-r from-[#CF000C] to-[#990000] bg-clip-text text-transparent"> Yaşam </span>
              Koleksiyonu
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Link
              href="/projeler"
              className="inline-flex items-center rounded-full border border-[#1E3A5F]/20 bg-white px-5 py-2.5 text-sm font-semibold text-[#1E3A5F] transition hover:border-[#CF000C]/40 hover:text-[#CF000C]"
            >
              Tüm Projeler
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </motion.div>
        </div>

        {projects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="rounded-3xl border border-white/60 bg-white/70 p-12 text-center shadow-lg"
          >
            <Sparkles className="mx-auto mb-4 h-10 w-10 text-[#1E3A5F]/30" />
            <h3 className="text-2xl font-semibold text-[#0F1D2F]">Henüz Proje Eklenmedi</h3>
            <p className="mx-auto mt-3 max-w-lg text-gray-500">Admin panelde yayınlanan projeler burada ürün kartları olarak otomatik listelenecek.</p>
          </motion.div>
        ) : (
          <div className="relative">
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex gap-6">
                {projects.map((project, index) => {
                  const displayName = project.title || project.name || 'Proje'
                  const status = statusLabels[project.status] || statusLabels.ongoing
                  const imageSrc = project.featured_image && project.featured_image.trim().length > 0 ? project.featured_image : '/images/about-building.jpg'

                  return (
                    <div key={project.id} className="min-w-0 flex-[0_0_88%] sm:flex-[0_0_58%] lg:flex-[0_0_38%] xl:flex-[0_0_31%]">
                      <motion.article
                        initial={{ opacity: 0, y: 22 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.5, delay: index * 0.06 }}
                        className="group h-full overflow-hidden rounded-3xl border border-white/60 bg-white shadow-[0_12px_50px_-24px_rgba(15,29,47,0.45)]"
                      >
                        <Link href={`/projeler/${project.slug}`} className="block h-full">
                          <div className="relative aspect-[4/3] overflow-hidden">
                            <Image
                              src={imageSrc}
                              alt={displayName}
                              fill
                              className="object-cover transition duration-700 group-hover:scale-105"
                              sizes="(max-width: 640px) 90vw, (max-width: 1024px) 58vw, 31vw"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1d2f]/75 via-[#0f1d2f]/20 to-transparent" />

                            <div className={`absolute left-4 top-4 inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-md ${status.className}`}>
                              {status.text}
                            </div>

                            {project.completion_date ? (
                              <div className="absolute right-4 top-4 inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-[#0F1D2F]">
                                <Clock3 className="mr-1.5 h-3.5 w-3.5" />
                                {new Date(project.completion_date).getFullYear()}
                              </div>
                            ) : null}
                          </div>

                          <div className="p-6">
                            <h3 className="text-2xl font-semibold leading-tight text-[#0F1D2F] transition group-hover:text-[#CF000C]">{displayName}</h3>

                            {project.location ? (
                              <p className="mt-3 inline-flex items-center text-sm text-gray-500">
                                <MapPin className="mr-1.5 h-4 w-4 text-[#1E3A5F]" />
                                {project.location}
                              </p>
                            ) : null}

                            <p className="mt-4 line-clamp-2 text-sm leading-relaxed text-gray-600">
                              {project.description || 'Modern mimari çizgilerle tasarlanmış, yüksek yaşam konforu sunan özel proje.'}
                            </p>

                            {project.features?.length ? (
                              <div className="mt-5 flex flex-wrap gap-2">
                                {project.features.slice(0, 3).map((feature) => (
                                  <span
                                    key={`${project.id}-${feature.label}`}
                                    className="inline-flex items-center rounded-full bg-[#edf3fb] px-3 py-1 text-xs font-medium text-[#1E3A5F]"
                                  >
                                    <span className="mr-1.5 text-[#CF000C]">{featureIcon(feature.label)}</span>
                                    {feature.value}
                                  </span>
                                ))}
                              </div>
                            ) : null}

                            <div className="mt-6 inline-flex items-center text-sm font-semibold text-[#1E3A5F] transition group-hover:text-[#CF000C]">
                              Projeyi İncele
                              <ArrowRight className="ml-2 h-4 w-4 transition group-hover:translate-x-1" />
                            </div>
                          </div>
                        </Link>
                      </motion.article>
                    </div>
                  )
                })}
              </div>
            </div>

            {projects.length > 1 ? (
              <>
                <button
                  onClick={scrollPrev}
                  disabled={!canScrollPrev}
                  className="absolute -left-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/95 text-[#1E3A5F] shadow-lg transition hover:text-[#CF000C] disabled:cursor-not-allowed disabled:opacity-40 lg:flex"
                  aria-label="Önceki"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={scrollNext}
                  disabled={!canScrollNext}
                  className="absolute -right-3 top-1/2 z-10 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/95 text-[#1E3A5F] shadow-lg transition hover:text-[#CF000C] disabled:cursor-not-allowed disabled:opacity-40 lg:flex"
                  aria-label="Sonraki"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            ) : null}

            {scrollSnaps.length > 1 ? (
              <div className="mt-8 flex justify-center gap-2">
                {scrollSnaps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => scrollTo(index)}
                    className={`h-2 rounded-full transition-all ${selectedIndex === index ? 'w-8 bg-[#1E3A5F]' : 'w-2 bg-[#1E3A5F]/25 hover:bg-[#1E3A5F]/45'}`}
                    aria-label={`Slide ${index + 1}`}
                  />
                ))}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  )
}
