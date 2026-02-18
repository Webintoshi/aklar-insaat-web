import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { getProjectBySlug, getProjects } from '@/lib/api/frontend-data'
import { MapPin, Calendar, ArrowLeft, CheckCircle2, Home, Bed, Maximize, Car, Trees } from 'lucide-react'

interface PageProps {
  params: { slug: string }
}

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug)
  
  if (!project) {
    return {
      title: 'Proje Bulunamadı | Aklar İnşaat',
    }
  }
  
  return {
    title: `${project.title} | Aklar İnşaat`,
    description: project.description || 'Aklar İnşaat projesi detayları',
  }
}

// Note: Projects are fetched dynamically
// For static generation, add slugs here or use ISR

const iconMap: Record<string, React.ReactNode> = {
  Home: <Home className="w-5 h-5" />,
  Bed: <Bed className="w-5 h-5" />,
  Maximize: <Maximize className="w-5 h-5" />,
  Car: <Car className="w-5 h-5" />,
  Trees: <Trees className="w-5 h-5" />,
}

export default async function ProjectDetailPage({ params }: PageProps) {
  const project = await getProjectBySlug(params.slug)
  
  if (!project) {
    notFound()
  }

  return (
    <main className="min-h-screen bg-[#FAFAF8]">
      {/* Back Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-4">
          <Link
            href="/projeler"
            className="inline-flex items-center text-gray-600 hover:text-[#1E3A5F] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Tüm Projeler
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative h-[50vh] lg:h-[60vh]">
        <Image
          src={project.featured_image || '/images/placeholder.jpg'}
          alt={project.title}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        
        <div className="absolute bottom-0 left-0 right-0">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pb-12">
            <div className="flex flex-wrap gap-3 mb-4">
              <span
                className={`px-4 py-1.5 rounded-full text-sm font-semibold ${
                  project.status === 'completed'
                    ? 'bg-green-500 text-white'
                    : 'bg-amber-500 text-white'
                }`}
              >
                {project.status === 'completed' ? 'Tamamlandı' : 'Devam Ediyor'}
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              {project.title}
            </h1>
            <div className="flex flex-wrap gap-6 text-white/90">
              {project.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span>{project.location}</span>
                </div>
              )}
              {project.completion_date && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  <span>
                    {new Date(project.completion_date).toLocaleDateString('tr-TR', {
                      year: 'numeric',
                      month: 'long',
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Proje Hakkında
              </h2>
              <div className="prose prose-lg max-w-none text-gray-600 leading-relaxed">
                {project.description ? (
                  <p>{project.description}</p>
                ) : (
                  <p>Bu proje hakkında detaylı bilgi yakında eklenecektir.</p>
                )}
              </div>

              {/* Features Grid */}
              {project.features && project.features.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">
                    Proje Özellikleri
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {project.features.map((feature, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm"
                      >
                        <div className="w-12 h-12 rounded-lg bg-[#CF000C]/10 flex items-center justify-center text-[#CF000C]">
                          {iconMap[feature.icon] || <CheckCircle2 className="w-5 h-5" />}
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">{feature.label}</p>
                          <p className="font-semibold text-gray-900">{feature.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24">
                <h3 className="text-lg font-bold text-gray-900 mb-6">
                  Proje Bilgileri
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between py-3 border-b border-gray-100">
                    <span className="text-gray-500">Durum</span>
                    <span className={`font-medium ${
                      project.status === 'completed' ? 'text-green-600' : 'text-amber-600'
                    }`}>
                      {project.status === 'completed' ? 'Tamamlandı' : 'Devam Ediyor'}
                    </span>
                  </div>
                  
                  {project.location && (
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-500">Konum</span>
                      <span className="font-medium text-gray-900">{project.location}</span>
                    </div>
                  )}
                  
                  {project.completion_date && (
                    <div className="flex justify-between py-3 border-b border-gray-100">
                      <span className="text-gray-500">Teslim Tarihi</span>
                      <span className="font-medium text-gray-900">
                        {new Date(project.completion_date).toLocaleDateString('tr-TR', {
                          year: 'numeric',
                          month: 'long',
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {/* CTA */}
                <div className="mt-8 space-y-3">
                  <Link
                    href="/iletisim"
                    className="block w-full py-3 px-6 bg-[#CF000C] text-white text-center font-semibold rounded-lg hover:bg-[#a3000a] transition-colors"
                  >
                    Bilgi Al
                  </Link>
                  <Link
                    href="/projeler"
                    className="block w-full py-3 px-6 bg-gray-100 text-gray-700 text-center font-semibold rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Diğer Projeler
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
