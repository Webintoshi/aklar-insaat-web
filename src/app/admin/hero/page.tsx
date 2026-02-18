import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Edit, Plus, Eye, EyeOff } from 'lucide-react'

async function getHeroBanners() {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('hero_banners')
    .select('*')
    .order('order_index', { ascending: true })
  
  if (error) {
    console.error('Error fetching hero banners:', error)
    return []
  }
  
  return data || []
}

export default async function HeroPage() {
  const banners = await getHeroBanners()
  
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
          <h1 className="text-2xl font-bold text-gray-800">Hero Bölümü Yönetimi</h1>
        </div>
        <Link
          href="/admin/hero/new"
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Yeni Hero Ekle
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Başlık</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Pre-title</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Durum</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Sıra</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {banners.map((banner) => (
              <tr key={banner.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{banner.title}</div>
                  {banner.subtitle && (
                    <div className="text-sm text-gray-500">
                      Alt başlık: <span className="text-gray-600">{banner.subtitle}</span>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 text-gray-600">{banner.button_text}</td>
                <td className="px-6 py-4">
                  {banner.is_active ? (
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
                </td>
                <td className="px-6 py-4 text-gray-600">{banner.order_index}</td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/hero/${banner.id}`}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Düzenle
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {banners.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Henüz banner eklenmemiş.</p>
            <Link
              href="/admin/hero/new"
              className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              <Plus className="w-4 h-4 mr-1" />
              İlk Banner Ekle
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
