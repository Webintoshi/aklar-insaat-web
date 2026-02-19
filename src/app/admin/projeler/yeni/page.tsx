'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { 
  ArrowLeft, 
  Save, 
  Building2, 
  Upload, 
  CheckCircle2, 
  Clock,
  AlertCircle,
  X,
  Loader2
} from 'lucide-react'

// Proje durumları
const PROJECT_STATUSES = [
  { value: 'completed', label: 'Tamamlandı', icon: CheckCircle2, color: 'bg-blue-500', desc: 'Projesi bitmiş, teslim edilmiş' },
  { value: 'ongoing', label: 'Devam Ediyor', icon: Clock, color: 'bg-amber-500', desc: 'Yapımı devam eden proje' },
] as const

interface ProjectForm {
  name: string
  project_status: 'completed' | 'ongoing'
  about_text: string
  about_image_url: string
}

export default function YeniProjePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [form, setForm] = useState<ProjectForm>({
    name: '',
    project_status: 'ongoing',
    about_text: '',
    about_image_url: '',
  })

  // Slug oluştur
  const generateSlug = useCallback((name: string) => {
    return name
      .toLowerCase()
      .replace(/[ıİ]/g, 'i')
      .replace(/[ğĞ]/g, 'g')
      .replace(/[üÜ]/g, 'u')
      .replace(/[şŞ]/g, 's')
      .replace(/[öÖ]/g, 'o')
      .replace(/[çÇ]/g, 'c')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .substring(0, 50)
  }, [])

  // Fotoğraf yükle
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Dosya kontrolü
    if (!file.type.startsWith('image/')) {
      setError('Lütfen sadece fotoğraf dosyası yükleyin (JPG, PNG)')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Fotoğraf boyutu 5MB\'dan küçük olmalı')
      return
    }

    setUploading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || 'Yükleme başarısız')
      }

      setForm(prev => ({ ...prev, about_image_url: data.url }))
    } catch (err: any) {
      setError('Fotoğraf yüklenirken hata: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  // Form gönder
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      if (!form.name.trim()) {
        setError('Proje adı zorunludur')
        setSaving(false)
        return
      }

      const slug = generateSlug(form.name)
      
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          slug,
          project_status: form.project_status,
          about_text: form.about_text.trim() || `${form.name} projesi hakkında detaylı bilgi için bize ulaşın.`,
          about_image_url: form.about_image_url,
          status: 'published', // Direkt yayınla
          is_featured: false,
          cta_text: 'Detayları Gör',
        })
      })

      const data = await res.json()
      
      if (!res.ok) {
        throw new Error(data.error || `Hata: ${res.status}`)
      }
      
      // Başarılı - projeler listesine dön
      router.push('/admin/projeler')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Proje oluşturulurken bir hata oluştu')
      setSaving(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link
            href="/admin/projeler"
            className="mr-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Yeni Proje Ekle</h1>
            <p className="text-gray-500 mt-1">Yeni bir proje oluşturun ve fotoğrafını yükleyin.</p>
          </div>
        </div>
      </div>

      {/* Hata Mesajı */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
          <button 
            onClick={() => setError(null)}
            className="ml-auto text-red-400 hover:text-red-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* 1. Proje Adı */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Proje Adı</h2>
              <p className="text-sm text-gray-500">Projenin görünen adı</p>
            </div>
          </div>
          
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Örn: Lotus Yaşam Evleri"
            className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
            required
          />
        </section>

        {/* 2. Proje Durumu */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Proje Durumu</h2>
              <p className="text-sm text-gray-500">Proje tamamlandı mı yoksa devam ediyor mu?</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {PROJECT_STATUSES.map((status) => {
              const Icon = status.icon
              const isSelected = form.project_status === status.value
              
              return (
                <button
                  key={status.value}
                  type="button"
                  onClick={() => setForm(prev => ({ ...prev, project_status: status.value }))}
                  className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                    isSelected 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 ${status.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{status.label}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{status.desc}</p>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute top-3 right-3">
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        </section>

        {/* 3. Kapak Fotoğrafı */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <Upload className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Kapak Fotoğrafı</h2>
              <p className="text-sm text-gray-500">Proje listesinde gösterilecek ana fotoğraf</p>
            </div>
          </div>

          {form.about_image_url ? (
            <div className="relative rounded-xl overflow-hidden">
              <div className="aspect-[16/9] relative">
                <Image
                  src={form.about_image_url}
                  alt="Proje kapak fotoğrafı"
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => setForm(prev => ({ ...prev, about_image_url: '' }))}
                className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className={`block border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              uploading ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}>
              {uploading ? (
                <div className="flex flex-col items-center">
                  <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
                  <p className="text-gray-600 font-medium">Fotoğraf yükleniyor...</p>
                </div>
              ) : (
                <>
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-600 font-medium mb-1">Fotoğraf Yüklemek İçin Tıklayın</p>
                  <p className="text-gray-400 text-sm">JPG, PNG formatları • Max 5MB</p>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageUpload}
                disabled={uploading}
              />
            </label>
          )}
        </section>

        {/* 4. Kısa Açıklama (Opsiyonel) */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Kısa Açıklama</h2>
              <p className="text-sm text-gray-500">Opsiyonel - Proje hakkında kısa bilgi</p>
            </div>
          </div>
          
          <textarea
            value={form.about_text}
            onChange={(e) => setForm(prev => ({ ...prev, about_text: e.target.value }))}
            placeholder="Proje hakkında kısa bir açıklama yazın..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          />
        </section>

        {/* Kaydet Butonu */}
        <div className="flex items-center justify-between pt-4">
          <Link
            href="/admin/projeler"
            className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
          >
            İptal
          </Link>
          <button
            type="submit"
            disabled={saving || uploading || !form.name.trim()}
            className="flex items-center px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors shadow-lg shadow-blue-200"
          >
            {saving ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Kaydediliyor...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                Projeyi Oluştur
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
