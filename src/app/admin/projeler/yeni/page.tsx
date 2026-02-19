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
  Loader2,
  ImageIcon,
  MapPin,
  Home,
  Plus
} from 'lucide-react'

// Kategoriler
const CATEGORIES = [
  { 
    key: 'about', 
    label: 'Kapak Görseli', 
    icon: ImageIcon,
    desc: 'Proje listesinde gösterilecek ana fotoğraf (1 adet)',
    color: 'bg-blue-500',
    maxFiles: 1
  },
  { 
    key: 'exterior', 
    label: 'Dış Mekan', 
    icon: Building2,
    desc: 'Bina dış cephe, site görünümü fotoğrafları',
    color: 'bg-green-500',
    maxFiles: 20
  },
  { 
    key: 'interior', 
    label: 'İç Mekan', 
    icon: Home,
    desc: 'Daire içi, salon, mutfak, banyo fotoğrafları',
    color: 'bg-purple-500',
    maxFiles: 30
  },
  { 
    key: 'location', 
    label: 'Proje Konumu', 
    icon: MapPin,
    desc: 'Harita, çevre, ulaşım fotoğrafları',
    color: 'bg-amber-500',
    maxFiles: 10
  },
] as const

// Proje durumları
const PROJECT_STATUSES = [
  { value: 'completed', label: 'Tamamlandı', icon: CheckCircle2, color: 'bg-blue-500' },
  { value: 'ongoing', label: 'Devam Ediyor', icon: Clock, color: 'bg-amber-500' },
] as const

type CategoryKey = typeof CATEGORIES[number]['key']

interface MediaFile {
  id: string
  url: string
  file: File
  uploading: boolean
  category: CategoryKey
}

interface ProjectForm {
  name: string
  project_status: 'completed' | 'ongoing'
  about_text: string
}

export default function YeniProjePage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<CategoryKey>('about')
  
  const [form, setForm] = useState<ProjectForm>({
    name: '',
    project_status: 'ongoing',
    about_text: '',
  })
  
  // Yüklenen dosyaları kategoriye göre sakla
  const [mediaFiles, setMediaFiles] = useState<Record<CategoryKey, MediaFile[]>>({
    about: [],
    exterior: [],
    interior: [],
    location: [],
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

  // Dosya yükle
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, category: CategoryKey) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const categoryConfig = CATEGORIES.find(c => c.key === category)!
    const currentCount = mediaFiles[category].length
    
    // Limit kontrolü
    if (currentCount + files.length > categoryConfig.maxFiles) {
      setError(`${categoryConfig.label} için en fazla ${categoryConfig.maxFiles} fotoğraf yükleyebilirsiniz.`)
      return
    }

    // Dosya kontrolü
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        setError('Sadece fotoğraf dosyaları yüklenebilir (JPG, PNG)')
        return
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Her fotoğraf en fazla 5MB olabilir')
        return
      }
    }

    // Önce local preview oluştur
    const newFiles: MediaFile[] = files.map(file => ({
      id: Math.random().toString(36).substring(7),
      url: URL.createObjectURL(file),
      file,
      uploading: true,
      category,
    }))

    setMediaFiles(prev => ({
      ...prev,
      [category]: [...prev[category], ...newFiles]
    }))

    // Sırayla yükle
    for (const mediaFile of newFiles) {
      try {
        const formData = new FormData()
        formData.append('file', mediaFile.file)

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        const data = await res.json()
        
        if (!res.ok) {
          throw new Error(data.error || 'Yükleme başarısız')
        }

        // URL'yi güncelle
        setMediaFiles(prev => ({
          ...prev,
          [category]: prev[category].map(f => 
            f.id === mediaFile.id 
              ? { ...f, url: data.url, uploading: false }
              : f
          )
        }))
      } catch (err: any) {
        setError(`${mediaFile.file.name} yüklenirken hata: ${err.message}`)
        // Hatalı dosyayı kaldır
        setMediaFiles(prev => ({
          ...prev,
          [category]: prev[category].filter(f => f.id !== mediaFile.id)
        }))
      }
    }
  }

  // Dosya sil
  const handleRemoveFile = (category: CategoryKey, id: string) => {
    setMediaFiles(prev => ({
      ...prev,
      [category]: prev[category].filter(f => f.id !== id)
    }))
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

      if (mediaFiles.about.length === 0) {
        setError('En az 1 kapak görseli yüklemelisiniz')
        setSaving(false)
        return
      }

      const slug = generateSlug(form.name)
      const aboutImageUrl = mediaFiles.about[0]?.url
      
      // 1. Projeyi oluştur
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          slug,
          project_status: form.project_status,
          about_text: form.about_text.trim() || `${form.name} projesi hakkında detaylı bilgi için bize ulaşın.`,
          about_image_url: aboutImageUrl,
          status: 'published',
          is_featured: false,
          cta_text: 'Detayları Gör',
        })
      })

      const projectData = await res.json()
      
      if (!res.ok) {
        throw new Error(projectData.error || `Hata: ${res.status}`)
      }

      // 2. Medya dosyalarını kaydet
      const allMedia = [
        ...mediaFiles.exterior.map((f, i) => ({ ...f, category: 'exterior', sort: i })),
        ...mediaFiles.interior.map((f, i) => ({ ...f, category: 'interior', sort: i })),
        ...mediaFiles.location.map((f, i) => ({ ...f, category: 'location', sort: i })),
      ]

      for (const media of allMedia) {
        await fetch('/api/media', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            project_id: projectData.id,
            url: media.url,
            category: media.category,
            sort_order: media.sort,
          })
        })
      }
      
      router.push('/admin/projeler')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Proje oluşturulurken bir hata oluştu')
      setSaving(false)
    }
  }

  const activeCategoryConfig = CATEGORIES.find(c => c.key === activeCategory)!

  return (
    <div className="max-w-6xl mx-auto pb-20">
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
            <p className="text-gray-500 mt-1">Proje bilgilerini girin ve fotoğrafları yükleyin.</p>
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
        {/* BÖLÜM 1: Temel Bilgiler */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Proje Adı */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Proje Adı</h2>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Örn: Lotus Yaşam Evleri"
              className="w-full px-4 py-3 text-lg border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              required
            />
          </section>

          {/* Proje Durumu */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Proje Durumu</h2>
            <div className="grid grid-cols-2 gap-4">
              {PROJECT_STATUSES.map((status) => {
                const Icon = status.icon
                const isSelected = form.project_status === status.value
                
                return (
                  <button
                    key={status.value}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, project_status: status.value }))}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-10 h-10 ${status.color} rounded-lg flex items-center justify-center mb-2`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold text-gray-900">{status.label}</span>
                  </button>
                )
              })}
            </div>
          </section>
        </div>

        {/* Kısa Açıklama */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Kısa Açıklama (Opsiyonel)</h2>
          <textarea
            value={form.about_text}
            onChange={(e) => setForm(prev => ({ ...prev, about_text: e.target.value }))}
            placeholder="Proje hakkında kısa bir açıklama yazın..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
          />
        </section>

        {/* BÖLÜM 2: Fotoğraf Galerisi */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Proje Fotoğrafları</h2>
          
          {/* Kategori Sekmeleri */}
          <div className="flex flex-wrap gap-2 mb-6">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon
              const count = mediaFiles[cat.key].length
              const isActive = activeCategory === cat.key
              
              return (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => setActiveCategory(cat.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{cat.label}</span>
                  {count > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-xs ${
                      isActive ? 'bg-white/20' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Aktif Kategori İçeriği */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-gray-900">{activeCategoryConfig.label}</h3>
                <p className="text-sm text-gray-500">{activeCategoryConfig.desc}</p>
              </div>
              <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                <Plus className="w-4 h-4" />
                <span>Fotoğraf Ekle</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple={activeCategoryConfig.maxFiles > 1}
                  className="hidden"
                  onChange={(e) => handleFileSelect(e, activeCategory)}
                />
              </label>
            </div>

            {/* Fotoğraf Grid */}
            {mediaFiles[activeCategory].length > 0 ? (
              <div className={`grid gap-4 ${
                activeCategory === 'about' 
                  ? 'grid-cols-1 max-w-md' 
                  : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
              }`}>
                {mediaFiles[activeCategory].map((file, index) => (
                  <div 
                    key={file.id} 
                    className={`relative group rounded-lg overflow-hidden border ${
                      activeCategory === 'about' ? 'aspect-video' : 'aspect-square'
                    }`}
                  >
                    <Image
                      src={file.url}
                      alt={`${activeCategoryConfig.label} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                    
                    {file.uploading && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <Loader2 className="w-8 h-8 text-white animate-spin" />
                      </div>
                    )}
                    
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(activeCategory, file.id)}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    
                    {activeCategory !== 'about' && (
                      <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 text-white text-xs rounded">
                        {index + 1}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <activeCategoryConfig.icon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Henüz fotoğraf eklenmemiş</p>
                <p className="text-sm text-gray-400 mt-1">
                  "Fotoğraf Ekle" butonuna tıklayarak yükleme yapabilirsiniz
                </p>
              </div>
            )}
          </div>
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
            disabled={saving || !form.name.trim() || mediaFiles.about.length === 0}
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
