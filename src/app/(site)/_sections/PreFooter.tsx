import Link from 'next/link'
import { LayoutGrid, ArrowRight } from 'lucide-react'

export function PreFooter() {
  return (
    <section className="relative text-white overflow-hidden">
      {/* Background Image with Overlay - Footer ile aynı stil */}
      <div className="absolute inset-0">
        <img
          src="/images/about-building.jpg"
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#1E3A5F]/90" />
      </div>

      {/* Top border - Footer ile uyumlu */}
      <div className="relative h-0.5 bg-[#CF000C]" />

      {/* Content */}
      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-16 lg:py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Text Content */}
          <div className="text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight">
              20 Yıllık Tecrübemizle
            </h2>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl">
              Size en iyi konutları sunmaya hazırız. Hayalinizdeki eve bir adım daha yaklaşın.
            </p>
          </div>

          {/* CTA Button */}
          <div>
            <Link
              href="/daire-secimi"
              className="group inline-flex items-center gap-3 px-8 py-4 bg-[#CF000C] text-white font-semibold text-lg rounded-lg hover:bg-[#a8000a] transition-all duration-300 hover:shadow-xl hover:shadow-[#CF000C]/25 hover:-translate-y-1"
            >
              <LayoutGrid className="w-5 h-5" />
              Daire Seçimi
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
