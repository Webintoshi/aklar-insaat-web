import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Edit, Plus, Eye, EyeOff, Image as ImageIcon } from 'lucide-react'

async function getAboutSections() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('about_sections')
    .select('*')
    .order('created_at', { ascending: true })
  
  if (error) {
    console.error('Error fetching about sections:', error)
    return []
  }
  
  return data || []
}

export default async function AboutPage() {
  const sections = await getAboutSections()
  
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link
            href="/admin"
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Hakkımızda Yönetimi</h1>
        </div>
        {sections.length === 0 && (
          <Link
            href="/admin/about/new"
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Yeni Bölüm Ekle
          </Link>
        )}
      </div>

      <div className="grid gap-6">
        {sections.map((section) => (
          <div
            key={section.id}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="flex gap-6">
                {/* Image Preview */}
                <div className="w-32 h-40 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                  {section.image_url ? (
                    <img
                      src={section.image_url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-xl font-semibold text-gray-800">
                      {section.title}
                    </h2>
                    {section.is_active ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Eye className="w-3 h-3 mr-1" />
                        Aktif
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <EyeOff className="w-3 h-3 mr-1" />
                        Pasif
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-500 mb-2">
                    {section.pre_title}
                  </p>
                  
                  <p className="text-gray-600 line-clamp-2 mb-4">
                    {section.description}
                  </p>
                  
                  {/* Features Preview */}
                  {section.features && section.features.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {section.features.slice(0, 4).map((feature: { title: string }, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md"
                        >
                          {feature.title}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <Link
                href={`/admin/about/${section.id}`}
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Düzenle
              </Link>
            </div>
          </div>
        ))}
        
        {sections.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-500">Henüz hakkımızda bölümü eklenmemiş.</p>
            <Link
              href="/admin/about/new"
              className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus className="w-4 h-4 mr-1" />
              İlk Bölümü Ekle
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
