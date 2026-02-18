'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Loader2, Save, Plus, Trash2, Upload, Monitor, Smartphone, AlertCircle, ImageIcon } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface HeroBanner {
  id?: string
  desktop_image: string
  mobile_image: string
  title: string
  subtitle: string
  button_text: string
  button_link: string
  order_index: number
  is_active: boolean
}

export default function HeroEditPage({ params }: { params: { _id: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const isNew = params._id === 'new'
  
  const [loading, setLoading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [banner, setBanner] = useState<HeroBanner>({
    desktop_image: '',
    mobile_image: '',
    title: '',
    subtitle: '',
    button_text: '',
    button_link: '',
    order_index: 0,
    is_active: true,
  })

  useEffect(() => {
    if (!isNew) {
      fetchBanner()
    }
  }, [isNew])

  const fetchBanner = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('hero_banners')
      .select('*')
      .eq('id', params._id)
      .single()
    
    if (error) {
      console.error('Fetch error:', error)
      setSaveError('Banner yüklenirken hata: ' + error.message)
    } else if (data) {
      setBanner(data)
    }
    setLoading(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'desktop' | 'mobile') => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)
    setUploadError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Yükleme başarısız')
      }

      if (result.url) {
        console.log('Uploaded image URL:', result.url)
        setBanner(prev => ({
          ...prev,
          [type === 'desktop' ? 'desktop_image' : 'mobile_image']: result.url
        }))
      }
    } catch (error: any) {
      console.error('Upload error:', error)
      setUploadError(error.message || 'Görsel yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setSaveError(null)

    try {
      if (isNew) {
        const { error } = await supabase.from('hero_banners').insert(banner)
        if (error) throw error
      } else {
        const { error } = await supabase.from('hero_banners').update(banner).eq('id', params._id)
        if (error) throw error
      }
      
      router.push('/admin/hero')
    } catch (error: any) {
      console.error('Save error:', error)
      setSaveError(error.message || 'Kaydetme sırasında bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, type: 'desktop' | 'mobile') => {
    console.error('Image failed to load:', e.currentTarget.src)
    setBanner(prev => ({
      ...prev,
      [type === 'desktop' ? 'desktop_image' : 'mobile_image']: ''
    }))
    setUploadError('Görsel yüklenemedi. URL: ' + e.currentTarget.src)
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
          <Link href="/admin/hero" className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            {isNew ? 'Yeni Banner Ekle' : 'Banner Düzenle'}
          </h1>
        </div>
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex items-center px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
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

      {(uploadError || saveError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2 flex-shrink-0" />
            <span className="text-red-700 font-medium">Hata!</span>
          </div>
          {uploadError && <p className="text-red-700 mt-1 text-sm">{uploadError}</p>}
          {saveError && <p className="text-red-700 mt-1 text-sm">{saveError}</p>}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Masaüstü Görseli */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Monitor className="w-4 h-4 inline mr-1" />
              Masaüstü Görseli
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {banner.desktop_image ? (
                <div className="relative">
                  <img
                    src={banner.desktop_image}
                    alt="Desktop"
                    className="w-full h-48 object-cover rounded-lg mx-auto"
                    onError={(e) => handleImageError(e, 'desktop')}
                  />
                  <div className="mt-2 text-xs text-gray-500 truncate">
                    URL: {banner.desktop_image}
                  </div>
                  <button
                    onClick={() => setBanner(prev => ({ ...prev, desktop_image: '' }))}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Görsel seç</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, 'desktop')}
                  />
                </label>
              )}
            </div>
          </div>

          {/* Mobil Görseli */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Smartphone className="w-4 h-4 inline mr-1" />
              Mobil Görseli
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              {banner.mobile_image ? (
                <div className="relative">
                  <img
                    src={banner.mobile_image}
                    alt="Mobile"
                    className="w-full h-48 object-cover rounded-lg mx-auto"
                    onError={(e) => handleImageError(e, 'mobile')}
                  />
                  <div className="mt-2 text-xs text-gray-500 truncate">
                    URL: {banner.mobile_image}
                  </div>
                  <button
                    onClick={() => setBanner(prev => ({ ...prev, mobile_image: '' }))}
                    className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <Upload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Görsel seç</p>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e, 'mobile')}
                  />
                </label>
              )}
            </div>
          </div>
        </div>

        {/* Metin Alanları */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Başlık
            </label>
            <input
              type="text"
              value={banner.title}
              onChange={(e) => setBanner(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Hero başlığı"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Alt Başlık
            </label>
            <input
              type="text"
              value={banner.subtitle}
              onChange={(e) => setBanner(prev => ({ ...prev, subtitle: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Alt başlık"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buton Metni
            </label>
            <input
              type="text"
              value={banner.button_text}
              onChange={(e) => setBanner(prev => ({ ...prev, button_text: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="İncele"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Buton Linki
            </label>
            <input
              type="text"
              value={banner.button_link}
              onChange={(e) => setBanner(prev => ({ ...prev, button_link: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="/projeler"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sıra
            </label>
            <input
              type="number"
              value={banner.order_index}
              onChange={(e) => setBanner(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex items-center h-full pt-6">
            <input
              type="checkbox"
              id="is_active"
              checked={banner.is_active}
              onChange={(e) => setBanner(prev => ({ ...prev, is_active: e.target.checked }))}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="ml-2 text-sm text-gray-700">
              Aktif (Sitede göster)
            </label>
          </div>
        </div>
      </div>

      {loading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600 mr-3" />
            <span>Görsel yükleniyor...</span>
          </div>
        </div>
      )}
    </div>
  )
}
