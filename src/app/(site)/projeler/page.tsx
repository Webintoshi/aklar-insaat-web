import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Building2, ArrowRight, CheckCircle2, Clock } from 'lucide-react'

export const metadata = {
  title: 'Projeler | Aklar İnşaat',
  description: 'Aklar İnşaat projeleri, tamamlanan ve devam eden konut projelerimizi keşfedin.',
}

interface Props {
  searchParams: { status?: string }
}

export default async function ProjelerPage({ searchParams }: Props) {
  const supabase = await createClient()
  
  // URL'den durum parametresini al (varsayılan: tümü)
  const currentStatus = searchParams?.status || 'all'

  // Projeleri çek
  let query = supabase
    .from('projects')
    .select('id, name, slug, about_image_url, is_featured, project_status')
    .eq('status', 'published')
    .order('is_featured', { ascending: false })
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  // Filtre uygula
  if (currentStatus === 'completed') {
    query = query.eq('project_status', 'completed')
  } else if (currentStatus === 'ongoing') {
    query = query.eq('project_status', 'ongoing')
  }

  const { data: projects } = await query

  // Durum badge'i
  const StatusBadge = ({ status }: { status: string }) => {
    if (status === 'completed') {
      return (
        <span className="absolute top-4 right-4 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4" />
          Tamamlandı
        </span>
      )
    }
    return (
      <span className="absolute top-4 right-4 bg-amber-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1.5">
        <Clock className="w-4 h-4" />
        Devam Ediyor
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-[#1E3A5F] text-white py-12 lg:py-16 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-10">
          <img
            src="/images/about-building.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
              <a href="/" className="hover:text-white transition-colors">Anasayfa</a>
              <span>/</span>
              <span className="text-white">Projeler</span>
            </nav>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">Projelerimiz</h1>
            <p className="text-xl text-white/80 max-w-2xl">
              Kaliteli ve modern yaşam alanları inşa ediyoruz. 
              Tamamlanan ve devam eden projelerimizi keşfedin.
            </p>
          </div>
        </div>
      </section>

      {/* Filtre Sekmeleri */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 -mb-px overflow-x-auto">
            <Link
              href="/projeler"
              className={`px-6 py-4 font-medium border-b-2 transition-colors whitespace-nowrap ${
                currentStatus === 'all'
                  ? 'border-[#1E3A5F] text-[#1E3A5F]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Tüm Projeler
            </Link>
            <Link
              href="/projeler?status=completed"
              className={`px-6 py-4 font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                currentStatus === 'completed'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Tamamlananlar
            </Link>
            <Link
              href="/projeler?status=ongoing"
              className={`px-6 py-4 font-medium border-b-2 transition-colors whitespace-nowrap flex items-center gap-2 ${
                currentStatus === 'ongoing'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Clock className="w-4 h-4" />
              Devam Edenler
            </Link>
          </div>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="container mx-auto px-4 py-12">
        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projeler/${project.slug}`}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
              >
                {/* Image */}
                <div className="aspect-[4/3] relative overflow-hidden">
                  {project.about_image_url ? (
                    <img
                      src={project.about_image_url}
                      alt={project.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Building2 className="w-16 h-16 text-gray-300" />
                    </div>
                  )}
                  
                  {/* Durum Badge */}
                  <StatusBadge status={project.project_status || 'ongoing'} />
                  
                  {/* Öne Çıkan Badge */}
                  {project.is_featured && (
                    <div className="absolute top-4 left-4 bg-[#C9A962] text-white px-3 py-1 rounded-full text-sm font-medium">
                      Öne Çıkan
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#1E3A5F] transition-colors">
                    {project.name}
                  </h2>
                  <div className="flex items-center text-[#1E3A5F] font-medium">
                    <span>Detayları Gör</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <Building2 className="w-20 h-20 text-gray-200 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {currentStatus === 'completed' 
                ? 'Henüz Tamamlanan Proje Yok' 
                : currentStatus === 'ongoing'
                ? 'Henüz Devam Eden Proje Yok'
                : 'Henüz Proje Yok'}
            </h2>
            <p className="text-gray-500 max-w-md mx-auto">
              {currentStatus === 'completed' 
                ? 'Tamamlanan projelerimiz yakında burada listelenecek.' 
                : currentStatus === 'ongoing'
                ? 'Devam eden projelerimiz yakında burada listelenecek.'
                : 'Yakında yeni projelerimizi burada görebilirsiniz.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
