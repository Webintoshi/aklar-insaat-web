import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getProjects } from '@/lib/api/frontend-data'
import { MapPin, Calendar, ArrowRight, Building2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Projelerimiz | Aklar İnşaat',
  description: 'Aklar İnşaat tamamlanan ve devam eden projeleri. Modern konut projeleri ve yaşam alanları.',
}

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: { status?: string }
}) {
  const status = searchParams.status as 'completed' | 'ongoing' | undefined
  const projects = await getProjects({ status })

  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      {/* Hero Section */}
      <section className="bg-[#1E3A5F] py-20 lg:py-28">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="max-w-3xl">
            <p className="text-[#CF000C] text-sm uppercase tracking-[0.2em] mb-4 font-medium">
              PROJELERİMİZ
            </p>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Hayallerinizi{' '}
              <span className="text-[#CF000C]">İnşa</span> Ediyoruz
            </h1>
            <p className="text-white/80 text-lg leading-relaxed">
              Aklar İnşaat olarak, modern yaşam alanları ve konforlu projeler üretiyoruz. 
              Tamamlanan ve devam eden projelerimizi inceleyin.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex gap-2 py-4 overflow-x-auto">
            <Link
              href="/projeler"
              className={`px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                !status
                  ? 'bg-[#1E3A5F] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tüm Projeler
            </Link>
            <Link
              href="/projeler?status=completed"
              className={`px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                status === 'completed'
                  ? 'bg-[#1E3A5F] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Tamamlanan
            </Link>
            <Link
              href="/projeler?status=ongoing"
              className={`px-6 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                status === 'ongoing'
                  ? 'bg-[#1E3A5F] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Devam Eden
            </Link>
          </div>
        </div>
      </section>

      {/* Projects Grid */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          {projects.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <article
                  key={project.id}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
                >
                  {/* Image */}
                  <Link href={`/projeler/${project.slug}`} className="block relative aspect-[4/3] overflow-hidden">
                    <Image
                      src={project.featured_image || '/images/placeholder.jpg'}
                      alt={project.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    {/* Status Badge */}
                    <div className="absolute top-4 left-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          project.status === 'completed'
                            ? 'bg-green-500 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {project.status === 'completed' ? 'Tamamlandı' : 'Devam Ediyor'}
                      </span>
                    </div>
                  </Link>

                  {/* Content */}
                  <div className="p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#1E3A5F] transition-colors">
                      <Link href={`/projeler/${project.slug}`}>{project.title}</Link>
                    </h2>

                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {project.description}
                    </p>

                    {/* Meta */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-500 mb-4">
                      {project.location && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-4 h-4 text-[#CF000C]" />
                          <span>{project.location}</span>
                        </div>
                      )}
                      {project.completion_date && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-[#CF000C]" />
                          <span>
                            {new Date(project.completion_date).toLocaleDateString('tr-TR', {
                              year: 'numeric',
                              month: 'long',
                            })}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    {project.features && project.features.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {project.features.slice(0, 3).map((feature, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 bg-gray-100 text-gray-600 text-xs rounded-lg"
                          >
                            {feature.label}: {feature.value}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* CTA */}
                    <Link
                      href={`/projeler/${project.slug}`}
                      className="inline-flex items-center text-[#1E3A5F] font-semibold text-sm hover:text-[#CF000C] transition-colors group/link"
                    >
                      Detayları İncele
                      <ArrowRight className="w-4 h-4 ml-1 group-hover/link:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Henüz Proje Bulunmuyor
              </h3>
              <p className="text-gray-500">
                Bu kategoride henüz proje eklenmemiş. Lütfen daha sonra tekrar kontrol edin.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  )
}
