'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import Link from 'next/link'

interface HeroSection {
  id: string
  name: string
  is_active: boolean
  order_index: number
  background_type: 'image' | 'video' | 'slider'
  background_image: string
  background_video: string | null
  slider_images: string[]
  pre_title: string
  title: string
  highlight_word: string
  description: string
  badge_text: string
  badge_subtext: string
  primary_cta: { text: string; link: string; variant: string }
  secondary_cta: { text: string; link: string; variant: string }
  stats: { label: string; value: string }[]
  show_gradient_overlay: boolean
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
    background_type: 'image',
    background_image: '',
    background_video: '',
    slider_images: [],
    pre_title: 'SİZE ÖZEL DAİRELER',
    title: 'Size Özel Yaşam',
    highlight_word: 'MODERN YAŞAM',
    description: '',
    badge_text: '3+1',
    badge_subtext: 'DAİRELER',
    primary_cta: { text: 'İNCELE', link: '/projeler', variant: 'primary' },
    secondary_cta: { text: '', link: '', variant: 'outline' },
    stats: [],
    show_gradient_overlay: true,
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
        stats: hero.stats || [],
        primary_cta: hero.primary_cta || { text: 'İNCELE', link: '/projeler', variant: 'primary' },
        secondary_cta: hero.secondary_cta || { text: '', link: '', variant: 'outline' },
        badge_text: hero.badge_text || '3+1',
        badge_subtext: hero.badge_subtext || 'DAİRELER',
        show_gradient_overlay: hero.show_gradient_overlay !== false,
      })
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      ...data,
      slider_images: data.slider_images?.filter(Boolean) || [],
      stats: data.stats?.filter(s => s.label && s.value) || [],
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
          <div className="grid md:grid-cols-3 gap-4">
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

        {/* Arka Plan */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Arka Plan</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Arka Plan Görseli URL</label>
              <input
                type="text"
                value={data.background_image}
                onChange={(e) => setData({ ...data, background_image: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="https://..."
                required
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={data.show_gradient_overlay}
                  onChange={(e) => setData({ ...data, show_gradient_overlay: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Gradient overlay göster</span>
              </label>
            </div>
          </div>
        </div>

        {/* İçerik - Sağ Taraf */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">İçerik (Sağ Taraf)</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Üst Başlık (Pre-title)</label>
              <input
                type="text"
                value={data.pre_title}
                onChange={(e) => setData({ ...data, pre_title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="SİZE ÖZEL DAİRELER"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ana Başlık (El yazısı stili)</label>
              <input
                type="text"
                value={data.title}
                onChange={(e) => setData({ ...data, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Size Özel Yaşam"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Alt Başlık (Kalın)</label>
              <input
                type="text"
                value={data.highlight_word}
                onChange={(e) => setData({ ...data, highlight_word: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="MODERN YAŞAM"
              />
            </div>
          </div>
        </div>

        {/* Rozet (Badge) */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Altın Rozet</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rozet Ana Metin</label>
              <input
                type="text"
                value={data.badge_text}
                onChange={(e) => setData({ ...data, badge_text: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="3+1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Rozet Alt Metin</label>
              <input
                type="text"
                value={data.badge_subtext}
                onChange={(e) => setData({ ...data, badge_subtext: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="DAİRELER"
              />
            </div>
          </div>
        </div>

        {/* CTA Butonu */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">CTA Butonu</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buton Metni</label>
              <input
                type="text"
                value={data.primary_cta?.text || ''}
                onChange={(e) => setData({ ...data, primary_cta: { text: e.target.value, link: data.primary_cta?.link || '/projeler', variant: 'primary' } })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="İNCELE"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Buton Link</label>
              <input
                type="text"
                value={data.primary_cta?.link || ''}
                onChange={(e) => setData({ ...data, primary_cta: { text: data.primary_cta?.text || 'İNCELE', link: e.target.value, variant: 'primary' } })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="/projeler"
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
