'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { 
  ArrowLeft, 
  Save, 
  Building2,
  Image as ImageIcon,
  MapPin,
  Loader2,
  Trash2,
  Plus
} from 'lucide-react'

interface Project {
  id: string
  name: string
  slug: string
  status: 'draft' | 'published' | 'archived'
  is_featured: boolean
  about_text: string
  about_image_url: string | null
  cta_text: string
  apartment_options: string
  neighborhood: string
  location_description: string
  location_image_url: string | null
  meta_title: string
  meta_desc: string
}

interface Media {
  id: string
  url: string
  category: 'about' | 'exterior' | 'interior' | 'location'
  file_name: string
  sort_order: number
}

export default function ProjeDuzenlePage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'about' | 'media' | 'location'>('about')
  const [project, setProject] = useState<Project | null>(null)
  const [media, setMedia] = useState<Media[]>([])
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    loadProject()
  }, [params.id])

  const loadProject = async () => {
    try {
      const res = await fetch(`/api/projects/${params.id}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setProject(data)
      setMedia(data.project_media || [])
    } catch (error) {
      console.error('Error loading project:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!project) return
    setSaving(true)

    try {
      const res = await fetch(`/api/projects/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(project)
      })

      if (!res.ok) throw new Error('Failed to update')
      alert('Değişiklikler kaydedildi')
    } catch (error) {
      console.error('Update error:', error)
      alert('Kaydetme sırasında bir hata oluştu')
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: string) => {
    const file = e.target.files?.[0]
    if (!file || !project) return

    setUploading(true)
    try {
      // 1. Presigned URL al
      const presignRes = await fetch('/api/media/presign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          category,
          contentType: file.type,
          fileSize: file.size,
          fileExtension: file.name.split('.').pop()
        })
      })

      if (!presignRes.ok) throw new Error('Presign failed')
      const { presignedUrl, key, publicUrl } = await presignRes.json()

      // 2. R2'ye yükle
      const uploadRes = await fetch(presignedUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      })

      if (!uploadRes.ok) throw new Error('Upload failed')

      // 3. Görsel boyutlarını al
      const dimensions = await getImageDimensions(file)

      // 4. DB'ye kaydet
      const saveRes = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId: project.id,
          r2Key: key,
          publicUrl,
          category,
          fileSize: file.size,
          width: dimensions.width,
          height: dimensions.height
        })
      })

      if (!saveRes.ok) throw new Error('Save failed')

      // 5. Projeyi yeniden yükle
      loadProject()
    } catch (error) {
      console.error('Upload error:', error)
      alert('Yükleme sırasında bir hata oluştu')
    } finally {
      setUploading(false)
    }
  }

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm('Bu görseli silmek istediğinize emin misiniz?')) return

    try {
      const res = await fetch(`/api/media/${mediaId}`, {
        method: 'DELETE'
      })

      if (!res.ok) throw new Error('Delete failed')
      loadProject()
    } catch (error) {
      console.error('Delete error:', error)
      alert('Silme sırasında bir hata oluştu')
    }
  }

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => resolve({ width: img.width, height: img.height })
      img.src = URL.createObjectURL(file)
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Proje bulunamadı</p>
      </div>
    )
  }

  const aboutMedia = media.filter(m => m.category === 'about')
  const exteriorMedia = media.filter(m => m.category === 'exterior')
  const interiorMedia = media.filter(m => m.category === 'interior')
  const locationMedia = media.filter(m => m.category === 'location')

  return (
    <div className="max-w-6xl mx-auto">
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
            <h1 className="text-2xl font-bold text-gray-900">{project.name}</h1>
            <p className="text-gray-500 mt-1">Proje düzenleme ve medya yönetimi</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href={`/projeler/${project.slug}`}
            target="_blank"
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Sayfayı Gör
          </Link>
          <button
            onClick={handleSave}
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

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setActiveTab('about')}
          className={`flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'about'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <Building2 className="w-5 h-5 mr-2" />
          1. Proje Hakkında
        </button>
        <button
          onClick={() => setActiveTab('media')}
          className={`flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'media'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <ImageIcon className="w-5 h-5 mr-2" />
          2-3. Görseller ({media.length})
        </button>
        <button
          onClick={() => setActiveTab('location')}
          className={`flex items-center px-4 py-3 rounded-lg font-medium transition-colors ${
            activeTab === 'location'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
          }`}
        >
          <MapPin className="w-5 h-5 mr-2" />
          4. Konum
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'about' && (
        <div className="space-y-6">
          {/* Temel Bilgiler */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Temel Bilgiler</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Proje Adı</label>
                <input
                  type="text"
                  value={project.name}
                  onChange={(e) => setProject({ ...project, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Slug</label>
                <div className="flex items-center">
                  <span className="text-gray-500 mr-2">/projeler/</span>
                  <input
                    type="text"
                    value={project.slug}
                    onChange={(e) => setProject({ ...project, slug: e.target.value })}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
                  <select
                    value={project.status}
                    onChange={(e) => setProject({ ...project, status: e.target.value as any })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="draft">🟡 Taslak</option>
                    <option value="published">🟢 Yayında</option>
                    <option value="archived">🔴 Arşiv</option>
                  </select>
                </div>
                <div className="flex items-center">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={project.is_featured}
                      onChange={(e) => setProject({ ...project, is_featured: e.target.checked })}
                      className="w-5 h-5 text-blue-600 rounded border-gray-300"
                    />
                    <span className="ml-2 text-gray-700">Öne çıkan proje</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Bölüm 1: Proje Hakkında */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Bölüm 1: Proje Hakkında</h2>
            
            {/* Ana Görsel */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Ana Görsel (Sol taraf)</label>
              <div className="flex items-center gap-4">
                {aboutMedia.length > 0 ? (
                  <div className="relative">
                    <img
                      src={aboutMedia[0].url}
                      alt="Proje görseli"
                      className="w-48 h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => handleDeleteMedia(aboutMedia[0].id)}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-48 h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                    <Plus className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Görsel ekle</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(e, 'about')}
                      disabled={uploading}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tanıtım Metni</label>
                <textarea
                  value={project.about_text || ''}
                  onChange={(e) => setProject({ ...project, about_text: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">CTA Buton Metni</label>
                <input
                  type="text"
                  value={project.cta_text}
                  onChange={(e) => setProject({ ...project, cta_text: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">SEO</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Başlık</label>
                <input
                  type="text"
                  value={project.meta_title || ''}
                  onChange={(e) => setProject({ ...project, meta_title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta Açıklama</label>
                <textarea
                  value={project.meta_desc || ''}
                  onChange={(e) => setProject({ ...project, meta_desc: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'media' && (
        <div className="space-y-6">
          {/* Dış Mekan */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Bölüm 2: Dış Mekan</h2>
                <p className="text-sm text-gray-500">Yatay slider için görseller (drone, dış çekim)</p>
              </div>
              <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                <Plus className="w-5 h-5 mr-2" />
                Görsel Ekle
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'exterior')}
                  disabled={uploading}
                />
              </label>
            </div>
            <div className="grid grid-cols-4 gap-4">
              {exteriorMedia.map((item) => (
                <div key={item.id} className="relative group">
                  <img
                    src={item.url}
                    alt="Dış mekan"
                    className="w-full aspect-video object-cover rounded-lg"
                  />
                  <button
                    onClick={() => handleDeleteMedia(item.id)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* İç Mekan */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Bölüm 3: İç Mekan</h2>
                <p className="text-sm text-gray-500">Grid galeri için görseller (oda fotoğrafları, render)</p>
              </div>
              <label className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700 transition-colors">
                <Plus className="w-5 h-5 mr-2" />
                Görsel Ekle
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'interior')}
                  disabled={uploading}
                />
              </label>
            </div>
            <div className="grid grid-cols-6 gap-4">
              {interiorMedia.map((item) => (
                <div key={item.id} className="relative group">
                  <img
                    src={item.url}
                    alt="İç mekan"
                    className="w-full aspect-square object-cover rounded-lg"
                  />
                  <button
                    onClick={() => handleDeleteMedia(item.id)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'location' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Bölüm 4: Proje Konumu</h2>
          
          {/* Konum Görseli */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Konum Görseli (Sol taraf)</label>
            <div className="flex items-center gap-4">
              {locationMedia.length > 0 ? (
                <div className="relative">
                  <img
                    src={locationMedia[0].url}
                    alt="Konum görseli"
                    className="w-64 h-40 object-cover rounded-lg"
                  />
                  <button
                    onClick={() => handleDeleteMedia(locationMedia[0].id)}
                    className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-64 h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                  <Plus className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">Konum görseli ekle</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleFileUpload(e, 'location')}
                    disabled={uploading}
                  />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Daire Seçenekleri</label>
              <input
                type="text"
                value={project.apartment_options || ''}
                onChange={(e) => setProject({ ...project, apartment_options: e.target.value })}
                placeholder="3+1 130 – 2+1 90 M2 DAİRE SEÇENEKLERİ"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Mahalle</label>
              <input
                type="text"
                value={project.neighborhood || ''}
                onChange={(e) => setProject({ ...project, neighborhood: e.target.value })}
                placeholder="ŞAHİNCİLİ MAHALLESİ"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Konum Açıklaması</label>
              <textarea
                value={project.location_description || ''}
                onChange={(e) => setProject({ ...project, location_description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
