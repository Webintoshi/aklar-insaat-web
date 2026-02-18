'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Loader2, Save, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'

interface AboutSection {
  id: string
  name: string
  is_active: boolean
  image_url: string
  image_caption: string
  experience_badge: {
    years: number
    text: string
  }
  pre_title: string
  title: string
  highlight_word: string
  description: string
  features: {
    icon: string
    title: string
    description: string
  }[]
  cta_text: string
  cta_link: string
}

const iconOptions = [
  'Shield', 'Award', 'Clock', 'Heart', 'Home', 'Building', 'Users', 'Star',
  'CheckCircle', 'TrendingUp', 'MapPin', 'Phone', 'Mail', 'Calendar'
]

export default function AboutEditorPage({ params }: { params: { _id: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const isNew = params._id === 'new'
  
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [data, setData] = useState<Partial<AboutSection>>({
    name: 'Hakkımızda',
    is_active: true,
    image_url: '',
    image_caption: '',
    experience_badge: { years: 15, text: 'Yıllık Tecrübe' },
    pre_title: 'Bizi Tanıyın',
    title: 'Aklar İnşaat',
    highlight_word: '',
    description: '',
    features: [],
    cta_text: 'Daha Fazla Bilgi',
    cta_link: '/kurumsal',
  })

  useEffect(() => {
    if (!isNew) {
      fetchAbout()
    }
  }, [isNew])

  const fetchAbout = async () => {
    setLoading(true)
    const { data: about } = await supabase
      .from('about_sections')
      .select('*')
      .eq('id', params._id)
      .single()
    
    if (about) {
      setData({
        ...about,
        features: about.features || [],
        experience_badge: about.experience_badge || { years: 15, text: 'Yıllık Tecrübe' },
      })
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      ...data,
      features: data.features?.filter(f => f.title) || [],
    }

    if (isNew) {
      const { error } = await supabase.from('about_sections').insert(payload)
      if (!error) router.push('/admin/about')
    } else {
      const { error } = await supabase.from('about_sections').update(payload).eq('id', params._id)
      if (!error) router.push('/admin/about')
    }
    
    setSaving(false)
  }

  const addFeature = () => {
    setData({
      ...data,
      features: [...(data.features || []), { icon: 'Shield', title: '', description: '' }],
    })
  }

  const removeFeature = (index: number) => {
    setData({
      ...data,
      features: data.features?.filter((_, i) => i !== index) || [],
    })
  }

  const updateFeature = (index: number, field: 'icon' | 'title' | 'description', value: string) => {
    const newFeatures = [...(data.features || [])]
    newFeatures[index] = { ...newFeatures[index], [field]: value }
    setData({ ...data, features: newFeatures })
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
          <Link href="/admin/about" className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            {isNew ? 'Yeni Hakkımızda Bölümü' : 'Hakkımızda Düzenle'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
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

        {/* Görsel */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Görsel</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Görsel URL</label>
              <input
                type="text"
                value={data.image_url}
                onChange={(e) => setData({ ...data, image_url: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="https://..."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Görsel Alt Yazısı</label>
              <input
                type="text"
                value={data.image_caption}
                onChange={(e) => setData({ ...data, image_caption: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deneyim Yılı</label>
                <input
                  type="number"
                  value={data.experience_badge?.years || 0}
                  onChange={(e) => setData({ 
                    ...data, 
                    experience_badge: { 
                      years: parseInt(e.target.value) || 0, 
                      text: data.experience_badge?.text || '' 
                    } 
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rozet Metni</label>
                <input
                  type="text"
                  value={data.experience_badge?.text || ''}
                  onChange={(e) => setData({ 
                    ...data, 
                    experience_badge: { 
                      years: data.experience_badge?.years || 0, 
                      text: e.target.value 
                    } 
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Yıllık Tecrübe"
                />
              </div>
            </div>
          </div>
        </div>

        {/* İçerik */}
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
                placeholder="Bizi Tanıyın"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Başlık</label>
              <input
                type="text"
                value={data.title}
                onChange={(e) => setData({ ...data, title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Aklar İnşaat"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Vurgulanacak Kelime</label>
              <input
                type="text"
                value={data.highlight_word}
                onChange={(e) => setData({ ...data, highlight_word: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Güven"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
              <textarea
                value={data.description}
                onChange={(e) => setData({ ...data, description: e.target.value })}
                rows={5}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                placeholder="Açıklama metni..."
                required
              />
            </div>
          </div>
        </div>

        {/* Özellikler */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Özellikler</h2>
            <button
              type="button"
              onClick={addFeature}
              className="flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4 mr-1" />
              Ekle
            </button>
          </div>
          <div className="space-y-4">
            {data.features?.map((feature, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-lg space-y-3">
                <div className="flex items-center gap-3">
                  <select
                    value={feature.icon}
                    onChange={(e) => updateFeature(index, 'icon', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    {iconOptions.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={feature.title}
                    onChange={(e) => updateFeature(index, 'title', e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="Başlık"
                  />
                  <button
                    type="button"
                    onClick={() => removeFeature(index)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <input
                  type="text"
                  value={feature.description}
                  onChange={(e) => updateFeature(index, 'description', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Açıklama"
                />
              </div>
            ))}
            {data.features?.length === 0 && (
              <p className="text-gray-500 text-center py-4">Henüz özellik eklenmemiş</p>
            )}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">CTA Butonu</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="text"
              value={data.cta_text}
              onChange={(e) => setData({ ...data, cta_text: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Buton metni"
            />
            <input
              type="text"
              value={data.cta_link}
              onChange={(e) => setData({ ...data, cta_link: e.target.value })}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Link"
            />
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
