'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Loader2, Save, Plus, Trash2, Upload, Image as ImageIcon, Monitor, Smartphone } from 'lucide-react'
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

export default function HeroNewPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [banners, setBanners] = useState<HeroBanner[]>([
    {
      desktop_image: '',
      mobile_image: '',
      title: '',
      subtitle: '',
      button_text: '',
      button_link: '',
      order_index: 0,
      is_active: true,
    }
  ])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, bannerIndex: number, type: 'desktop' | 'mobile') => {
    const file = e.target.files?.[0]
    if (!file) return

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const result = await response.json()

      if (result.url) {
        const newBanners = [...banners]
        if (type === 'desktop') {
          newBanners[bannerIndex].desktop_image = result.url
        } else {
          newBanners[bannerIndex].mobile_image = result.url
        }
        setBanners(newBanners)
      }
    } catch (error) {
      console.error('Upload error:', error)
    } finally {
      setLoading(false)
    }
  }

  const addBanner = () => {
    setBanners([
      ...banners,
      {
        desktop_image: '',
        mobile_image: '',
        title: '',
        subtitle: '',
        button_text: '',
        button_link: '',
        order_index: banners.length,
        is_active: true,
      }
    ])
  }

  const removeBanner = (index: number) => {
    if (banners.length > 1) {
      setBanners(banners.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { error: deleteError } = await supabase.from('hero_banners').delete().neq('id', '00000000-0000-0000-0000-000000000000')

      const bannersToSave = banners.filter(b => b.desktop_image || b.mobile_image)
      
      for (let i = 0; i < bannersToSave.length; i++) {
        const banner = {
          ...bannersToSave[i],
          order_index: i,
        }

        if (banner.id) {
          await supabase.from('hero_banners').update(banner).eq('id', banner.id)
        } else {
          await supabase.from('hero_banners').insert(banner)
        }
      }

      router.push('/admin')
    } catch (error) {
      console.error('Save error:', error)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => router.push('/admin')}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">Hero Banner Yönetimi</h1>
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

      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">Banner Slider</h2>
          <button
            onClick={addBanner}
            className="flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Yeni Banner Ekle
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-6">
          👆 Yukarıdaki butona tıklayarak istediğiniz kadar banner ekleyebilirsiniz. Sürükleme ile sıralayabilirsiniz.
        </p>

        <div className="space-y-8">
          {banners.map((banner, index) => (
            <div key={index} className="border-2 border-dashed border-gray-300 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-700">Banner {index + 1}</h3>
                <button
                  onClick={() => removeBanner(index)}
                  disabled={banners.length === 1}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Masaüstü Görseli */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Monitor className="w-4 h-4 inline mr-1" />
                    Masaüstü Görseli (Opsiyonel)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {banner.desktop_image ? (
                      <div className="relative">
                        <img
                          src={banner.desktop_image}
                          alt="Desktop"
                          className="w-full h-48 object-cover rounded-lg mx-auto"
                        />
                        <button
                          onClick={() => {
                            const newBanners = [...banners]
                            newBanners[index].desktop_image = ''
                            setBanners(newBanners)
                          }}
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
                          onChange={(e) => handleImageUpload(e, index, 'desktop')}
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Mobil Görseli */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Smartphone className="w-4 h-4 inline mr-1" />
                    Mobil Görseli (Opsiyonel)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    {banner.mobile_image ? (
                      <div className="relative">
                        <img
                          src={banner.mobile_image}
                          alt="Mobile"
                          className="w-full h-48 object-cover rounded-lg mx-auto"
                        />
                        <button
                          onClick={() => {
                            const newBanners = [...banners]
                            newBanners[index].mobile_image = ''
                            setBanners(newBanners)
                          }}
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
                          onChange={(e) => handleImageUpload(e, index, 'mobile')}
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Metin Alanları */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Başlık
                  </label>
                  <input
                    type="text"
                    value={banner.title}
                    onChange={(e) => {
                      const newBanners = [...banners]
                      newBanners[index].title = e.target.value
                      setBanners(newBanners)
                    }}
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
                    onChange={(e) => {
                      const newBanners = [...banners]
                      newBanners[index].subtitle = e.target.value
                      setBanners(newBanners)
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Alt başlık"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Buton Metni
                  </label>
                  <input
                    type="text"
                    value={banner.button_text}
                    onChange={(e) => {
                      const newBanners = [...banners]
                      newBanners[index].button_text = e.target.value
                      setBanners(newBanners)
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="İncele"
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Buton Linki
                </label>
                <input
                  type="text"
                  value={banner.button_link}
                  onChange={(e) => {
                    const newBanners = [...banners]
                    newBanners[index].button_link = e.target.value
                    setBanners(newBanners)
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="/projeler"
                />
              </div>

              <div className="mt-4 flex items-center">
                <input
                  type="checkbox"
                  id={`active-${index}`}
                  checked={banner.is_active}
                  onChange={(e) => {
                    const newBanners = [...banners]
                    newBanners[index].is_active = e.target.checked
                    setBanners(newBanners)
                  }}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor={`active-${index}`} className="ml-2 text-sm text-gray-700">
                  Aktif (Sitede göster)
                </label>
              </div>
            </div>
          ))}
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
