'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Loader2, Save, Upload, Monitor, Smartphone, AlertCircle, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface HeroBanner {
  id?: string
  desktop_image: string
  mobile_image: string
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
      setSaveError('Banner yüklenirken hata: ' + error.message)
    } else if (data) {
      setBanner({
        desktop_image: data.desktop_image || '',
        mobile_image: data.mobile_image || '',
        order_index: data.order_index || 0,
        is_active: data.is_active !== false,
      })
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
        setBanner(prev => ({
          ...prev,
          [type === 'desktop' ? 'desktop_image' : 'mobile_image']: result.url
        }))
      }
    } catch (error: any) {
      setUploadError(error.message || 'Görsel yüklenirken bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!banner.desktop_image && !banner.mobile_image) {
      setSaveError('En az bir görsel yüklemelisiniz!')
      return
    }

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
      router.refresh()
    } catch (error: any) {
      setSaveError(error.message || 'Kaydetme sırasında bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Bu bannerı silmek istediğinize emin misiniz?')) return
    
    setSaving(true)
    try {
      const { error } = await supabase.from('hero_banners').delete().eq('id', params._id)
      if (error) throw error
      router.push('/admin/hero')
      router.refresh()
    } catch (error: any) {
      setSaveError(error.message || 'Silme sırasında hata oluştu')
      setSaving(false)
    }
  }

  if (loading && !isNew) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/admin/hero" className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            {isNew ? 'Yeni Banner Ekle' : 'Banner Düzenle'}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <button
              onClick={handleDelete}
              disabled={saving}
              className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              <Trash2 className="w-5 h-5 mr-2" />
              Sil
            </button>
          )}
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
      </div>

      {/* Hata Mesajları */}
      {(uploadError || saveError) && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
            <span className="text-red-700 font-medium">Hata!</span>
          </div>
          {uploadError && <p className="text-red-700 mt-1 text-sm">{uploadError}</p>}
          {saveError && <p className="text-red-700 mt-1 text-sm">{saveError}</p>}
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Masaüstü Görseli */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Monitor className="w-4 h-4 inline mr-1" />
              Masaüstü Görseli
              <span className="text-gray-400 font-normal ml-1">(Zorunlu)</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
              {banner.desktop_image ? (
                <div className="relative">
                  <img
                    src={banner.desktop_image}
                    alt="Desktop"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setBanner(prev => ({ ...prev, desktop_image: '' }))}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block py-8">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500 font-medium">Görsel Yükle</p>
                  <p className="text-gray-400 text-sm mt-1">1920x800 önerilir</p>
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
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Smartphone className="w-4 h-4 inline mr-1" />
              Mobil Görseli
              <span className="text-gray-400 font-normal ml-1">(Opsiyonel)</span>
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
              {banner.mobile_image ? (
                <div className="relative">
                  <img
                    src={banner.mobile_image}
                    alt="Mobile"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setBanner(prev => ({ ...prev, mobile_image: '' }))}
                    className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block py-8">
                  <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <p className="text-gray-500 font-medium">Görsel Yükle</p>
                  <p className="text-gray-400 text-sm mt-1">768x1024 önerilir</p>
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

        {/* Ayarlar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-6 border-t">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sıra (Öncelik)
            </label>
            <input
              type="number"
              min="0"
              value={banner.order_index}
              onChange={(e) => setBanner(prev => ({ ...prev, order_index: parseInt(e.target.value) || 0 }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="0"
            />
            <p className="text-gray-400 text-sm mt-1">Küçük sayı önce gösterilir</p>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={banner.is_active}
              onChange={(e) => setBanner(prev => ({ ...prev, is_active: e.target.checked }))}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="is_active" className="ml-3 text-gray-700">
              <span className="font-medium">Aktif</span>
              <p className="text-gray-400 text-sm">Sitede gösterilsin mi?</p>
            </label>
          </div>
        </div>
      </div>

      {/* Yükleme Modal */}
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
