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
  subtitle: string
  paragraphs: string[]
  highlight_text: string
}

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
    image_caption: 'Modern Yaşam Projesi',
    experience_badge: { years: 15, text: 'Yıllık Tecrübe' },
    subtitle: 'AKLAR İNŞAAT',
    paragraphs: [
      `Aklar İnşaat, uzun yıllardır Ordu'da hizmet vermektedir. 'Hız ve Kalite Bizim İşimiz' sloganıyla sektöre adım atan firmamız, her geçen gün kendini yenileyerek büyümeye devam etmektedir. Son yıllarda artan iş talebi ve büyümekte olan inşaat sektörü konusunda yaptığımız çalışmalar, şirketin bilgi birikimi ve sahip olduğu uzman kadrosunu, inşaat, proje alanında çalışmaya yöneltmiştir. Aklar İnşaat, kurumsal ve bireysel müşterilerden gelen talepler doğrultusunda standartlara uygun, bilimsel ve güvenilir mühendislik, inşaat işleri hazırlayan bir şirkettir.`,
      'Sunduğumuz kaliteli, etkin hizmetlerimizle bugün; bölgemizde faaliyet gösteren seçkin ve tercih edilen hizmet kuruluşlarından biri olmanın haklı gururunu yaşamaktayız.'
    ],
    highlight_text: 'Hem ulaştığımız kitle hemde takım arkadaşlarımız arasında sinerji yaratabilmek için benimsediğimiz değerler; Müşterilerimizin kalite, fiyat, teslim süresi ve yüksek standartlardaki beklentilerini sorunsuz bir şekilde karşılamak.',
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
        experience_badge: about.experience_badge || { years: 15, text: 'Yıllık Tecrübe' },
        paragraphs: about.paragraphs || [],
        subtitle: about.subtitle || 'AKLAR İNŞAAT',
        highlight_text: about.highlight_text || '',
      })
    }
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    const payload = {
      ...data,
      paragraphs: data.paragraphs?.filter(p => p.trim()) || [],
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

  const addParagraph = () => {
    setData({
      ...data,
      paragraphs: [...(data.paragraphs || []), ''],
    })
  }

  const removeParagraph = (index: number) => {
    setData({
      ...data,
      paragraphs: data.paragraphs?.filter((_, i) => i !== index) || [],
    })
  }

  const updateParagraph = (index: number, value: string) => {
    const newParagraphs = [...(data.paragraphs || [])]
    newParagraphs[index] = value
    setData({ ...data, paragraphs: newParagraphs })
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Üst Başlık (Subtitle)</label>
              <input
                type="text"
                value={data.subtitle}
                onChange={(e) => setData({ ...data, subtitle: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="AKLAR İNŞAAT"
              />
            </div>

            {/* Paragraflar */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-sm font-medium text-gray-700">Paragraflar</label>
                <button
                  type="button"
                  onClick={addParagraph}
                  className="flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Paragraf Ekle
                </button>
              </div>
              <div className="space-y-3">
                {data.paragraphs?.map((paragraph, index) => (
                  <div key={index} className="flex gap-3">
                    <textarea
                      value={paragraph}
                      onChange={(e) => updateParagraph(index, e.target.value)}
                      rows={4}
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                      placeholder={`Paragraf ${index + 1}`}
                    />
                    <button
                      type="button"
                      onClick={() => removeParagraph(index)}
                      className="p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors self-start"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                {data.paragraphs?.length === 0 && (
                  <p className="text-gray-500 text-center py-4 border border-dashed border-gray-300 rounded-lg">
                    Henüz paragraf eklenmemiş
                  </p>
                )}
              </div>
            </div>

            {/* Highlight Box */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vurgu Kutusu Metni (Kırmızı Kutu)
              </label>
              <textarea
                value={data.highlight_text}
                onChange={(e) => setData({ ...data, highlight_text: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-y"
                placeholder="Kırmızı kutuda görünecek metin..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Bu metin kırmızı arka planlı kutu içinde görüntülenecektir.
              </p>
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
