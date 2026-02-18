import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowLeft, Plus, Eye, EyeOff, Pencil, Trash2, GripVertical } from 'lucide-react'
import Image from 'next/image'

interface HeroBanner {
  id: string
  desktop_image: string
  mobile_image: string
  order_index: number
  is_active: boolean
}

async function getHeroBanners(): Promise<HeroBanner[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('hero_banners')
    .select('id, desktop_image, mobile_image, order_index, is_active')
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
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link
            href="/admin"
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Hero Banner Yönetimi</h1>
        </div>
        <Link
          href="/admin/hero/new"
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Yeni Banner Ekle
        </Link>
      </div>

      {/* Banner Grid */}
      {banners.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <p className="text-gray-500 mb-4">Henüz banner eklenmemiş.</p>
          <Link
            href="/admin/hero/new"
            className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            İlk Bannerı Ekle
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner) => (
            <div 
              key={banner.id} 
              className={`bg-white rounded-xl shadow-sm overflow-hidden border-2 transition-all hover:shadow-md ${
                banner.is_active ? 'border-green-200' : 'border-gray-200 opacity-60'
              }`}
            >
              {/* Görsel */}
              <div className="relative aspect-video bg-gray-100">
                {banner.desktop_image ? (
                  <Image
                    src={banner.desktop_image}
                    alt="Banner"
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">
                    Görsel yok
                  </div>
                )}
                
                {/* Durum Badge */}
                <div className="absolute top-3 left-3">
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
                </div>

                {/* Sıra Numarası */}
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center justify-center w-8 h-8 bg-blue-600 text-white text-sm font-bold rounded-full">
                    {banner.order_index + 1}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-500">
                  <GripVertical className="w-4 h-4 mr-1" />
                  Sıra: {banner.order_index + 1}
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    href={`/admin/hero/${banner.id}`}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Düzenle"
                  >
                    <Pencil className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
