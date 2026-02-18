'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import Link from 'next/link'

interface InfoCardsSection {
  id: string
  name: string
  is_active: boolean
  pre_title: string
  title: string
  description: string
  autoplay: boolean
  autoplay_speed: number
  show_arrows: boolean
  show_dots: boolean
}

export default function InfoCardsEditorPage({ params }: { params: { _id: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const isNew = params._id === 'new'
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<Partial<InfoCardsSection>>({
    name: 'İstatistikler',
    is_active: true,
    pre_title: 'Rakamlarla Biz',
    title: 'Başarı Hikayemiz',
    description: '',
    autoplay: true,
    autoplay_speed: 4000,
    show_arrows: true,
    show_dots: true,
  })

  useEffect(() => {
    if (!isNew) {
      fetchSection()
    }
  }, [isNew])

  const fetchSection = async () => {
    setLoading(true)
    const { data: section } = await supabase
      .from('info_cards_sections')
      .select('*')
      .eq('id', params._id)
      .single()
    
    if (section) {
      setData(section)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    if (isNew) {
      const { data: newSection, error } = await supabase
        .from('info_cards_sections')
        .insert(data)
        .select()
        .single()
      
      if (!error && newSection) {
        router.push(`/admin/infocards/${newSection.id}/cards`)
      }
    } else {
      const { error } = await supabase.from('info_cards_sections').update(data).eq('id', params._id)
      if (!error) router.push('/admin/infocards')
    }
    
    setSaving(false)
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
          <Link href="/admin/infocards" className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            {isNew ? 'Yeni İstatistik Bölümü' : 'Bölüm Düzenle'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Temel Bilgiler</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bölüm Adı</label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={data.is_active}
                  onChange={(e) => setData({ ...data, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Aktif</span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">İçerik</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Pre-title</label>
              <input
                type="text"
                value={data.pre_title}
                onChange={(e) => setData({ ...data, pre_title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Başlık</label>
              <input
                type="text"
                value={data.title}
                onChange={(e) => setData({ ...data, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
              <textarea
                value={data.description}
                onChange={(e) => setData({ ...data, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-y"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Carousel Ayarları</h2>
          <div className="space-y-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={data.autoplay}
                onChange={(e) => setData({ ...data, autoplay: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Otomatik kaydırma</span>
            </label>
            {data.autoplay && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kaydırma hızı (ms)</label>
                <input
                  type="number"
                  value={data.autoplay_speed}
                  onChange={(e) => setData({ ...data, autoplay_speed: parseInt(e.target.value) || 4000 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  min="1000"
                  step="500"
                />
              </div>
            )}
            <div className="flex gap-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={data.show_arrows}
                  onChange={(e) => setData({ ...data, show_arrows: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Ok butonları</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={data.show_dots}
                  onChange={(e) => setData({ ...data, show_dots: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Nokta göstergeleri</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          {!isNew && (
            <Link
              href={`/admin/infocards/${params._id}/cards`}
              className="px-6 py-3 text-blue-600 font-medium hover:bg-blue-50 rounded-lg transition-colors"
            >
              Kartları Düzenle →
            </Link>
          )}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                {isNew ? 'Devam Et' : 'Kaydet'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
