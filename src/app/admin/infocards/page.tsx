'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { ArrowLeft, Edit, Plus, Eye, EyeOff, Loader2, BarChart3, Heart } from 'lucide-react'

interface InfoCardsSection {
  id: string
  name: string
  is_active: boolean
  type: 'stats' | 'values'
  title: string
  description: string
}

export default function InfoCardsPage() {
  const supabase = createClient()
  const [sections, setSections] = useState<InfoCardsSection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSections()
  }, [])

  const fetchSections = async () => {
    const { data } = await supabase
      .from('info_cards_sections')
      .select('*')
      .order('created_at', { ascending: true })
    
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
          <h1 className="text-2xl font-bold text-gray-800">Kartlar Yönetimi</h1>
        </div>
        <Link
          href="/admin/infocards/new"
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Yeni Bölüm Ekle
        </Link>
      </div>

      <div className="grid gap-6">
        {sections.map((section) => (
          <div
            key={section.id}
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-semibold text-gray-800">{section.name}</h2>
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
                  {/* Tip Badge */}
                  {section.type === 'stats' ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      <BarChart3 className="w-3 h-3 mr-1" />
                      İstatistik
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      <Heart className="w-3 h-3 mr-1" />
                      Değer
                    </span>
                  )}
                </div>
                <h3 className="text-lg text-gray-700">{section.title}</h3>
                {section.description && <p className="text-gray-500 text-sm">{section.description}</p>}
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/infocards/${section.id}/cards`}
                  className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  Kartları Düzenle
                </Link>
                <Link
                  href={`/admin/infocards/${section.id}`}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Düzenle
                </Link>
              </div>
            </div>
          </div>
        ))}
        
        {sections.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl">
            <p className="text-gray-500">Henüz kart bölümü eklenmemiş.</p>
            <Link href="/admin/infocards/new" className="inline-flex items-center mt-4 text-blue-600 hover:text-blue-700 font-medium">
              <Plus className="w-4 h-4 mr-1" />
              İlk Bölümü Ekle
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
