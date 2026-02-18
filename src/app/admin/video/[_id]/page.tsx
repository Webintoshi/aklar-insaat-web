'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import Link from 'next/link'

interface VideoSection {
  id: string
  name: string
  is_active: boolean
  order_index: number
  background_image: string
  video_type: 'youtube' | 'vimeo' | 'self_hosted'
  video_id: string
  video_url: string | null
  title: string
  description: string
  play_button_text: string
  autoplay: boolean
}

export default function VideoEditorPage({ params }: { params: { _id: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const isNew = params._id === 'new'
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<Partial<VideoSection>>({
    name: '',
    is_active: true,
    order_index: 0,
    background_image: '',
    video_type: 'youtube',
    video_id: '',
    video_url: '',
    title: '',
    description: '',
    play_button_text: 'Videoyu İzle',
    autoplay: true,
  })

  useEffect(() => {
    if (!isNew) {
      fetchVideo()
    }
  }, [isNew])

  const fetchVideo = async () => {
    setLoading(true)
    const { data: video } = await supabase
      .from('video_sections')
      .select('*')
      .eq('id', params._id)
      .single()
    
    if (video) {
      setData(video)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      ...data,
      video_url: data.video_type === 'self_hosted' ? data.video_url : null,
      video_id: data.video_type !== 'self_hosted' ? data.video_id : null,
    }

    if (isNew) {
      const { error } = await supabase.from('video_sections').insert(payload)
      if (!error) router.push('/admin/video')
    } else {
      const { error } = await supabase.from('video_sections').update(payload).eq('id', params._id)
      if (!error) router.push('/admin/video')
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
          <Link href="/admin/video" className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            {isNew ? 'Yeni Video Bölümü' : 'Video Düzenle'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        {/* Temel Bilgiler */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Temel Bilgiler</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bölüm Adı</label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Tanıtım Videosu"
                required
              />
            </div>
            <div className="flex items-center gap-4">
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

        {/* Arka Plan */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Arka Plan Görseli</h2>
          <input
            type="text"
            value={data.background_image}
            onChange={(e) => setData({ ...data, background_image: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="https://..."
            required
          />
          <p className="text-xs text-gray-500 mt-1">Video oynatma düğmesinin arkasındaki kapak görseli</p>
        </div>

        {/* Video Ayarları */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Video Ayarları</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Video Tipi</label>
              <select
                value={data.video_type}
                onChange={(e) => setData({ ...data, video_type: e.target.value as any })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="youtube">YouTube</option>
                <option value="vimeo">Vimeo</option>
                <option value="self_hosted">Kendi Sunucum</option>
              </select>
            </div>

            {data.video_type !== 'self_hosted' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Video ID</label>
                <input
                  type="text"
                  value={data.video_id}
                  onChange={(e) => setData({ ...data, video_id: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder={data.video_type === 'youtube' ? 'dQw4w9WgXcQ' : 'Vimeo ID'}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {data.video_type === 'youtube' 
                    ? 'YouTube video URL\'sindeki v= parametresi sonrası kısım'
                    : 'Vimeo video ID\'si'}
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Video URL</label>
                <input
                  type="text"
                  value={data.video_url || ''}
                  onChange={(e) => setData({ ...data, video_url: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="https://..."
                  required
                />
              </div>
            )}

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={data.autoplay}
                onChange={(e) => setData({ ...data, autoplay: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Otomatik oynat (lightbox açıldığında)</span>
            </label>
          </div>
        </div>

        {/* İçerik */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">İçerik</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Başlık (Opsiyonel)</label>
              <input
                type="text"
                value={data.title}
                onChange={(e) => setData({ ...data, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Hayalinizdeki Yaşam"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama (Opsiyonel)</label>
              <textarea
                value={data.description}
                onChange={(e) => setData({ ...data, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                placeholder="Video açıklaması..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Oynat Butonu Metni</label>
              <input
                type="text"
                value={data.play_button_text}
                onChange={(e) => setData({ ...data, play_button_text: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Videoyu İzle"
              />
            </div>
          </div>
        </div>

        {/* Kaydet */}
        <div className="flex justify-end">
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
                Kaydet
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
