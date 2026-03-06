import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Building2, ArrowRight, CheckCircle2, Clock } from 'lucide-react'

export const metadata = {
  title: 'Projeler | Aklar İnşaat',
  description: 'Aklar İnşaat projeleri, tamamlanan ve devam eden konut projelerimizi keşfedin.',
}

interface SearchParams {
  status?: string
}

interface Props {
  searchParams: Promise<SearchParams>
}

type ProjectRow = {
  id: string
  name: string
  slug: string
  about_image_url: string | null
  is_featured: boolean | null
  project_status: 'completed' | 'ongoing' | null
  status: string | null
  is_published: boolean | null
}

function normalizeStatus(project: ProjectRow): 'completed' | 'ongoing' {
  if (project.project_status === 'completed' || project.project_status === 'ongoing') {
    return project.project_status
  }
  if (project.status === 'completed' || project.status === 'ongoing') {
    return project.status
  }
  return 'ongoing'
}

function StatusBadge({ status }: { status: 'completed' | 'ongoing' }) {
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

export default async function ProjelerPage({ searchParams }: Props) {
  const supabase = await createClient()
  const params = await searchParams
  const rawStatus = (params?.status || 'all').toLowerCase()
  const currentStatus: 'all' | 'completed' | 'ongoing' =
    rawStatus === 'completed' || rawStatus === 'ongoing' ? rawStatus : 'all'

  let query = supabase
    .from('projects')
    .select('id, name, slug, about_image_url, is_featured, project_status, status, is_published')
    .or('status.eq.published,is_published.eq.true')
    .order('is_featured', { ascending: false })
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (currentStatus === 'completed') {
    query = query.eq('project_status', 'completed')
  } else if (currentStatus === 'ongoing') {
    query = query.eq('project_status', 'ongoing')
  }

  const { data } = await query
  const projects = (data || []) as ProjectRow[]

  const heroTitle =
    currentStatus === 'completed'
      ? 'Tamamlanan Projeler'
      : currentStatus === 'ongoing'
      ? 'Devam Eden Projeler'
      : 'Projelerimiz'

  const heroDescription =
    currentStatus === 'completed'
      ? 'Teslimi tamamlanan projelerimizi inceleyin.'
      : currentStatus === 'ongoing'
      ? 'İnşası devam eden güncel projelerimizi keşfedin.'
      : 'Kaliteli ve modern yaşam alanları inşa ediyoruz. Tamamlanan ve devam eden projelerimizi keşfedin.'

  return (
    <div className="min-h-screen bg-white">
      <section className="relative bg-[#1E3A5F] text-white py-12 lg:py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/images/about-building.jpg"
            alt=""
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
              <Link href="/" className="hover:text-white transition-colors">Anasayfa</Link>
              <span>/</span>
              <span className="text-white">Projeler</span>
            </nav>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">{heroTitle}</h1>
            <p className="text-xl text-white/80 max-w-2xl">{heroDescription}</p>
          </div>
        </div>
      </section>

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

      <div className="container mx-auto px-4 py-12">
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => {
              const status = normalizeStatus(project)
              return (
                <Link
                  key={project.id}
                  href={`/projeler/${project.slug}`}
                  className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all hover:-translate-y-1"
                >
                  <div className="aspect-[4/3] relative overflow-hidden">
                    {project.about_image_url ? (
                      <Image
                        src={project.about_image_url}
                        alt={project.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Building2 className="w-16 h-16 text-gray-300" />
                      </div>
                    )}

                    <StatusBadge status={status} />

                    {project.is_featured && (
                      <div className="absolute top-4 left-4 bg-[#C9A962] text-white px-3 py-1 rounded-full text-sm font-medium">
                        Öne Çıkan
                      </div>
                    )}
                  </div>

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
              )
            })}
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
