'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Edit, Plus, Eye, EyeOff, Loader2 } from 'lucide-react'

interface VideoSection {
  id: string
  name: string
  is_active: boolean
  background_image: string
  video_type: string
  video_id: string
  title: string
  description: string
}

export default function VideoPage() {
  const supabase = createClient()
  const [sections, setSections] = useState<VideoSection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    const { data } = await supabase
      .from('video_sections')
      .select('*')
      .order('order_index', { ascending: true })
    
    setSections(data || [])
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/admin" className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">Video Bölümü Yönetimi</h1>
        </div>
        <Link
          href="/admin/video/new"
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Yeni Video Ekle
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Başlık</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Video Tipi</th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Durum</th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-700">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sections.map((section) => (
              <tr key={section.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="font-medium text-gray-900">{section.name}</div>
                  {section.title && <div className="text-sm text-gray-500">{section.title}</div>}
                </td>
                <td className="px-6 py-4 text-gray-600 capitalize">{section.video_type}</td>
                <td className="px-6 py-4">
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
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/video/${section.id}`}
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
        
        {sections.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Henüz video bölümü eklenmemiş.</p>
            <Link href="/admin/video/new" className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-700 font-medium">
              <Plus className="w-4 h-4 mr-1" />
              İlk Video Bölümünü Ekle
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
