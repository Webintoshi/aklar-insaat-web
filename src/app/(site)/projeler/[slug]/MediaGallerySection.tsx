'use client'

import Image from 'next/image'
import { useCallback, useEffect, useState } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface GalleryImage {
  id: string
  url: string
}

interface MediaGallerySectionProps {
  title: string
  projectName: string
  imageType: 'dış mekan' | 'iç mekan'
  images: GalleryImage[]
}

export function MediaGallerySection({ title, projectName, imageType, images }: MediaGallerySectionProps) {
  const isCarousel = images.length > 4
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: images.length > 4,
    align: 'start',
    containScroll: 'trimSnaps',
  })
  const [, setEmblaTick] = useState(0)

  useEffect(() => {
    if (!emblaApi) return
    const onChange = () => setEmblaTick((prev) => prev + 1)
    emblaApi.on('select', onChange)
    emblaApi.on('reInit', onChange)
    return () => {
      emblaApi.off('select', onChange)
      emblaApi.off('reInit', onChange)
    }
  }, [emblaApi])

  const openLightbox = (index: number) => setLightboxIndex(index)
  const closeLightbox = () => setLightboxIndex(null)
  const prevLightbox = useCallback(
    () => setLightboxIndex((prev) => (prev === null ? null : (prev - 1 + images.length) % images.length)),
    [images.length]
  )
  const nextLightbox = useCallback(
    () => setLightboxIndex((prev) => (prev === null ? null : (prev + 1) % images.length)),
    [images.length]
  )

  useEffect(() => {
    if (lightboxIndex === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft') prevLightbox()
      if (e.key === 'ArrowRight') nextLightbox()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightboxIndex, nextLightbox, prevLightbox])

  return (
    <section>
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2E5A8F]">Galeri</p>
        <h3 className="mt-2 text-3xl font-semibold text-[#0F1D2F]">{title}</h3>
      </div>

      {!isCarousel ? (
        <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-4">
          {images.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => openLightbox(index)}
              className="group overflow-hidden rounded-2xl bg-white shadow-lg text-left"
            >
              <div className="relative aspect-[3/4] w-full">
                <Image
                  src={image.url}
                  alt={`${projectName} ${imageType} ${index + 1}`}
                  fill
                  loading="lazy"
                  sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              </div>
            </button>
          ))}
        </div>
      ) : (
        <div className="relative">
          <div className="overflow-hidden" ref={emblaRef}>
            <div className="flex gap-5">
              {images.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => openLightbox(index)}
                  className="min-w-0 flex-[0_0_78%] sm:flex-[0_0_48%] lg:flex-[0_0_31%] xl:flex-[0_0_24%] group overflow-hidden rounded-2xl bg-white shadow-lg text-left"
                >
                  <div className="relative aspect-[3/4] w-full">
                    <Image
                      src={image.url}
                      alt={`${projectName} ${imageType} ${index + 1}`}
                      fill
                      loading="lazy"
                      sizes="(max-width: 640px) 78vw, (max-width: 1024px) 48vw, (max-width: 1280px) 31vw, 24vw"
                      className="object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!emblaApi?.canScrollPrev()}
            className="absolute -left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/95 text-[#1E3A5F] shadow-lg transition hover:text-[#CF000C] disabled:cursor-not-allowed disabled:opacity-40 lg:flex"
            aria-label="Önceki"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => emblaApi?.scrollNext()}
            disabled={!emblaApi?.canScrollNext()}
            className="absolute -right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/95 text-[#1E3A5F] shadow-lg transition hover:text-[#CF000C] disabled:cursor-not-allowed disabled:opacity-40 lg:flex"
            aria-label="Sonraki"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}

      {lightboxIndex !== null ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/88 p-4"
          role="dialog"
          aria-modal="true"
          onClick={closeLightbox}
        >
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              prevLightbox()
            }}
            className="absolute left-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Önceki"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <div className="relative h-[90vh] w-[92vw]" onClick={(e) => e.stopPropagation()}>
            <Image
              src={images[lightboxIndex].url}
              alt={`${projectName} ${imageType} ${lightboxIndex + 1}`}
              fill
              className="rounded-xl object-contain"
              sizes="92vw"
              priority
            />
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              nextLightbox()
            }}
            className="absolute right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Sonraki"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      ) : null}
    </section>
  )
}
