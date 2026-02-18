import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Building2, ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Projeler | Aklar İnşaat',
  description: 'Aklar İnşaat projeleri, tamamlanan ve devam eden konut projelerimizi keşfedin.',
}

export default async function ProjelerPage() {
  const supabase = await createClient()

  const { data: projects } = await supabase
    .from('projects')
    .select('id, name, slug, about_image_url, is_featured')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1E3A5F] text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Projelerimiz</h1>
          <p className="text-xl text-white/80 max-w-2xl">
            Kaliteli ve modern yaşam alanları inşa ediyoruz. 
            Tamamlanan ve devam eden projelerimizi keşfedin.
          </p>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="container mx-auto px-4 py-16">
        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projeler/${project.slug}`}
                className="group bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
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
                  {project.is_featured && (
                    <div className="absolute top-4 left-4 bg-[#C9A962] text-white px-3 py-1 rounded-full text-sm font-medium">
                      Öne Çıkan
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#1E3A5F] transition-colors">
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
          <div className="text-center py-16">
            <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Henüz Proje Yok</h2>
            <p className="text-gray-500">Yakında yeni projelerimizi burada görebilirsiniz.</p>
          </div>
        )}
      </div>
    </div>
  )
}
