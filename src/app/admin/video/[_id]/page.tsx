'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Loader2, Save, Upload, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

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

export default function VideoEditorPage() {
  const router = useRouter()
  const params = useParams<{ _id: string }>()
  const videoIdParam = params?._id
  const supabase = createClient()
  const isNew = videoIdParam === 'new'

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
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

  const fetchVideo = useCallback(async () => {
    if (!videoIdParam || isNew) return

    setLoading(true)
    const { data: video } = await supabase
      .from('video_sections')
      .select('*')
      .eq('id', videoIdParam)
      .single()

    if (video) {
      setData(video)
    }

    setLoading(false)
  }, [isNew, supabase, videoIdParam])

  useEffect(() => {
    fetchVideo()
  }, [fetchVideo])

  const handleImageUpload = async (file: File) => {
    setUploadingImage(true)
    setUploadError(null)

    try {
      if (!file.type.startsWith('image/')) {
        throw new Error('Sadece görsel dosyaları yükleyebilirsiniz')
      }
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('Görsel en fazla 10MB olabilir')
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'video')

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await res.json()
      if (!res.ok) {
        throw new Error(result?.error || 'Yükleme başarısız')
      }

      setData((prev) => ({ ...prev, background_image: result.url }))
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Yükleme sırasında hata oluştu'
      setUploadError(message)
    } finally {
      setUploadingImage(false)
    }
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
      const { error } = await supabase.from('video_sections').update(payload).eq('id', videoIdParam)
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
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Temel Bilgiler</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bölüm Adı</label>
              <input
                type="text"
                value={data.name || ''}
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

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Arka Plan Görseli</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bilgisayardan Yükle</label>
              <div className="flex items-center gap-4">
                <label className="inline-flex cursor-pointer items-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                  {uploadingImage ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Yükleniyor...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Görsel Seç
                    </>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingImage}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file)
                      e.currentTarget.value = ''
                    }}
                  />
                </label>
                {data.background_image ? (
                  <button
                    type="button"
                    className="text-sm text-red-600 hover:underline"
                    onClick={() => setData({ ...data, background_image: '' })}
                  >
                    Görseli kaldır
                  </button>
                ) : null}
              </div>
              {uploadError ? <p className="mt-2 text-sm text-red-600">{uploadError}</p> : null}
            </div>

            {data.background_image ? (
              <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                <div className="relative h-56 w-full">
                  <Image
                    src={data.background_image}
                    alt="Video kapak"
                    fill
                    sizes="(max-width: 768px) 100vw, 768px"
                    className="object-cover"
                  />
                </div>
              </div>
            ) : (
              <div className="flex h-40 items-center justify-center rounded-lg border border-dashed border-gray-300 text-gray-400">
                <ImageIcon className="mr-2 h-5 w-5" />
                Arka plan görseli seçilmedi
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Görsel URL (opsiyonel)</label>
              <input
                type="text"
                value={data.background_image || ''}
                onChange={(e) => setData({ ...data, background_image: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="https://..."
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">Video oynatma düğmesinin arkasındaki kapak görseli</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Video Ayarları</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Video Tipi</label>
              <select
                value={data.video_type}
                onChange={(e) => setData({ ...data, video_type: e.target.value as VideoSection['video_type'] })}
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
                  value={data.video_id || ''}
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

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">İçerik</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Başlık (Opsiyonel)</label>
              <input
                type="text"
                value={data.title || ''}
                onChange={(e) => setData({ ...data, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Hayalinizdeki Yaşam"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama (Opsiyonel)</label>
              <textarea
                value={data.description || ''}
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
                value={data.play_button_text || ''}
                onChange={(e) => setData({ ...data, play_button_text: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Videoyu İzle"
              />
            </div>
          </div>
        </div>

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
