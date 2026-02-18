'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Loader2, Save, Plus, Trash2, GripVertical } from 'lucide-react'
import Link from 'next/link'

interface Slide {
  id: string
  image: string
  pre_title?: string
  title?: string
  highlight_word?: string
  badge_text?: string
  badge_subtext?: string
  cta_text?: string
  cta_link?: string
}

interface HeroSection {
  id: string
  name: string
  is_active: boolean
  order_index: number
  background_type: 'image' | 'video' | 'slider'
  background_image: string
  slider_images: Slide[]
  pre_title: string
  title: string
  highlight_word: string
  description: string
  badge_text: string
  badge_subtext: string
  primary_cta: { text: string; link: string; variant: string }
  secondary_cta: { text: string; link: string; variant: string }
  autoplay: boolean
  autoplay_speed: number
}

export default function HeroEditorPage({ params }: { params: { _id: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const isNew = params._id === 'new'
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<Partial<HeroSection>>({
    name: '',
    is_active: true,
    order_index: 0,
    background_type: 'slider',
    background_image: '',
    slider_images: [],
    pre_title: 'SİZE ÖZEL DAİRELER',
    title: 'Size Özel Yaşam',
    highlight_word: 'MODERN YAŞAM',
    description: '',
    badge_text: '3+1',
    badge_subtext: 'DAİRELER',
    primary_cta: { text: 'İNCELE', link: '/projeler', variant: 'primary' },
    secondary_cta: { text: '', link: '', variant: 'outline' },
    autoplay: true,
    autoplay_speed: 5000,
  })

  useEffect(() => {
    if (!isNew) {
      fetchHero()
    }
  }, [isNew])

  const fetchHero = async () => {
    setLoading(true)
    const { data: hero } = await supabase
      .from('hero_sections')
      .select('*')
      .eq('id', params._id)
      .single()
    
    if (hero) {
      setData({
        ...hero,
        slider_images: hero.slider_images || [],
        primary_cta: hero.primary_cta || { text: 'İNCELE', link: '/projeler', variant: 'primary' },
        secondary_cta: hero.secondary_cta || { text: '', link: '', variant: 'outline' },
        badge_text: hero.badge_text || '3+1',
        badge_subtext: hero.badge_subtext || 'DAİRELER',
        autoplay: hero.autoplay !== false,
        autoplay_speed: hero.autoplay_speed || 5000,
      })
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      ...data,
      slider_images: data.slider_images?.filter(s => s.image) || [],
    }

    if (isNew) {
      const { error } = await supabase.from('hero_sections').insert(payload)
      if (!error) router.push('/admin/hero')
    } else {
      const { error } = await supabase.from('hero_sections').update(payload).eq('id', params._id)
      if (!error) router.push('/admin/hero')
    }
    
    setSaving(false)
  }

  const addSlide = () => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      image: '',
      pre_title: data.pre_title,
      title: data.title,
      highlight_word: data.highlight_word,
      badge_text: data.badge_text,
      badge_subtext: data.badge_subtext,
      cta_text: data.primary_cta?.text,
      cta_link: data.primary_cta?.link,
    }
    setData({ ...data, slider_images: [...(data.slider_images || []), newSlide] })
  }

  const removeSlide = (index: number) => {
    setData({ ...data, slider_images: data.slider_images?.filter((_, i) => i !== index) || [] })
  }

  const updateSlide = (index: number, field: keyof Slide, value: string) => {
    const newSlides = [...(data.slider_images || [])]
    newSlides[index] = { ...newSlides[index], [field]: value }
    setData({ ...data, slider_images: newSlides })
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
            {isNew ? 'Yeni Hero Bölümü' : 'Hero Düzenle'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Temel Bilgiler */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Temel Bilgiler</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bölüm Adı</label>
              <input
                type="text"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ana Sayfa Hero"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tip</label>
              <select
                value={data.background_type}
                onChange={(e) => setData({ ...data, background_type: e.target.value as any })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="image">Tek Görsel</option>
                <option value="slider">Slider (1920x800)</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center mt-8">
                <input
                  type="checkbox"
                  checked={data.is_active}
                  onChange={(e) => setData({ ...data, is_active: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Aktif</span>
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sıra</label>
              <input
                type="number"
                value={data.order_index}
                onChange={(e) => setData({ ...data, order_index: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Slider Ayarları */}
        {data.background_type === 'slider' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Slider Ayarları</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={data.autoplay}
                    onChange={(e) => setData({ ...data, autoplay: e.target.checked })}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">Otomatik geçiş</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Geçiş süresi (ms)</label>
                <input
                  type="number"
                  value={data.autoplay_speed}
                  onChange={(e) => setData({ ...data, autoplay_speed: parseInt(e.target.value) || 5000 })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  min="1000"
                  step="500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Tek Görsel Modu */}
        {data.background_type === 'image' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Arka Plan Görseli (1920x800)</h2>
            <input
              type="text"
              value={data.background_image}
              onChange={(e) => setData({ ...data, background_image: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="https://..."
            />
          </div>
        )}

        {/* Slider Modu */}
        {data.background_type === 'slider' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800">Slider Görselleri (1920x800)</h2>
              <button
                type="button"
                onClick={addSlide}
                className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Slide Ekle
              </button>
            </div>

            <div className="space-y-4">
              {data.slider_images?.map((slide, index) => (
                <div key={slide.id} className="border border-gray-200 rounded-xl p-4 space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <GripVertical className="w-5 h-5 text-gray-400" />
                    <span className="font-semibold text-gray-700">Slide {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeSlide(index)}
                      className="ml-auto p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Görsel URL (1920x800)</label>
                      <input
                        type="text"
                        value={slide.image}
                        onChange={(e) => updateSlide(index, 'image', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="https://..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Üst Başlık</label>
                      <input
                        type="text"
                        value={slide.pre_title || ''}
                        onChange={(e) => updateSlide(index, 'pre_title', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="SİZE ÖZEL DAİRELER"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Ana Başlık (El yazısı)</label>
                      <input
                        type="text"
                        value={slide.title || ''}
                        onChange={(e) => updateSlide(index, 'title', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Size Özel Yaşam"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Alt Başlık (Kalın)</label>
                      <input
                        type="text"
                        value={slide.highlight_word || ''}
                        onChange={(e) => updateSlide(index, 'highlight_word', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="MODERN YAŞAM"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rozet Metin</label>
                      <input
                        type="text"
                        value={slide.badge_text || ''}
                        onChange={(e) => updateSlide(index, 'badge_text', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="3+1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Rozet Alt Metin</label>
                      <input
                        type="text"
                        value={slide.badge_subtext || ''}
                        onChange={(e) => updateSlide(index, 'badge_subtext', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="DAİRELER"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Buton Metni</label>
                      <input
                        type="text"
                        value={slide.cta_text || ''}
                        onChange={(e) => updateSlide(index, 'cta_text', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="İNCELE"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Buton Link</label>
                      <input
                        type="text"
                        value={slide.cta_link || ''}
                        onChange={(e) => updateSlide(index, 'cta_link', e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="/projeler"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {(!data.slider_images || data.slider_images.length === 0) && (
                <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl">
                  <p className="text-gray-500 mb-4">Henüz slide eklenmemiş</p>
                  <button
                    type="button"
                    onClick={addSlide}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    İlk Slide'ı Ekle
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Varsayılan Değerler (Slider için) */}
        {data.background_type === 'slider' && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Varsayılan Değerler (Slide'lerde boş alanlar için)</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Varsayılan Üst Başlık</label>
                <input
                  type="text"
                  value={data.pre_title}
                  onChange={(e) => setData({ ...data, pre_title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Varsayılan Ana Başlık</label>
                <input
                  type="text"
                  value={data.title}
                  onChange={(e) => setData({ ...data, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Varsayılan Alt Başlık</label>
                <input
                  type="text"
                  value={data.highlight_word}
                  onChange={(e) => setData({ ...data, highlight_word: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Varsayılan Rozet</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={data.badge_text}
                    onChange={(e) => setData({ ...data, badge_text: e.target.value })}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="3+1"
                  />
                  <input
                    type="text"
                    value={data.badge_subtext}
                    onChange={(e) => setData({ ...data, badge_subtext: e.target.value })}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="DAİRELER"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

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
