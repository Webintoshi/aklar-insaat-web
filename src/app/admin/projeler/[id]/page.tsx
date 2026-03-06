'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
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
  project_status: 'completed' | 'ongoing'
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

type MediaCategory = 'about' | 'exterior' | 'interior' | 'location'

export default function ProjeDuzenlePage() {
  const params = useParams<{ id: string }>()
  const projectId = params?.id
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'about' | 'media' | 'location'>('about')
  const [project, setProject] = useState<Project | null>(null)
  const [media, setMedia] = useState<Media[]>([])
  const [uploading, setUploading] = useState(false)

  const loadProject = useCallback(async () => {
    if (!projectId) return

    try {
      const res = await fetch(`/api/projects/${projectId}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || `Hata: ${res.status}`)
      setProject({
        id: data.id,
        name: data.name || data.title || '',
        slug: data.slug || '',
        status: data.status || 'draft',
        project_status:
          data.project_status === 'completed' || data.project_status === 'ongoing'
            ? data.project_status
            : data.status === 'completed' || data.status === 'ongoing'
              ? data.status
              : 'ongoing',
        is_featured: !!data.is_featured,
        about_text: data.about_text || '',
        about_image_url: data.about_image_url || null,
        cta_text: data.cta_text || 'Detayları Gör',
        apartment_options: data.apartment_options || '',
        neighborhood: data.neighborhood || '',
        location_description: data.location_description || '',
        location_image_url: data.location_image_url || null,
        meta_title: data.meta_title || '',
        meta_desc: data.meta_desc || '',
      })
      setMedia(data.project_media || [])
      setErrorMessage(null)
    } catch (error) {
      console.error('Error loading project:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Proje yüklenemedi')
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    loadProject()
  }, [loadProject])

  const handleSave = async () => {
    if (!project || !projectId) return
    setSaving(true)

    try {
      const payload = {
        name: project.name,
        slug: project.slug,
        status: project.status,
        project_status: project.project_status,
        is_featured: project.is_featured,
        about_text: project.about_text,
        cta_text: project.cta_text,
        apartment_options: project.apartment_options,
        neighborhood: project.neighborhood,
        location_description: project.location_description,
        meta_title: project.meta_title,
        meta_desc: project.meta_desc,
      }

      const res = await fetch(`/api/projects/${projectId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Failed to update')
      alert('Değişiklikler kaydedildi')
      setErrorMessage(null)
    } catch (error) {
      console.error('Update error:', error)
      const msg = error instanceof Error ? error.message : 'Kaydetme sırasında bir hata oluştu'
      setErrorMessage(msg)
      alert(msg)
    } finally {
      setSaving(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, category: MediaCategory) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0 || !project) return

    setUploading(true)
    try {
      const isSingleCategory = category === 'about' || category === 'location'
      const filesToUpload = isSingleCategory ? files.slice(0, 1) : files

      const startSortOrder = media.filter((m) => m.category === category).length

      const results = await Promise.allSettled(
        filesToUpload.map(async (file, index) => {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('folder', `projects/${project.id}/${category}`)

          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          })

          const uploadJson = await uploadRes.json()
          if (!uploadRes.ok) {
            throw new Error(uploadJson?.error || `${file.name}: Upload failed`)
          }

          const dimensions = await getImageDimensions(file)

          const saveRes = await fetch('/api/media', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              project_id: project.id,
              url: uploadJson.url,
              category,
              file_name: file.name,
              file_size: file.size,
              width: dimensions.width,
              height: dimensions.height,
              sort_order: startSortOrder + index,
            }),
          })

          const saveData = await saveRes.json()
          if (!saveRes.ok) {
            throw new Error(saveData?.error || `${file.name}: Save failed`)
          }
        })
      )

      const failed = results
        .filter((r): r is PromiseRejectedResult => r.status === 'rejected')
        .map((r) => String(r.reason))

      if (failed.length > 0) {
        throw new Error(failed.join('\n'))
      }

      loadProject()
    } catch (error) {
      console.error('Upload error:', error)
      alert(error instanceof Error ? error.message : 'Yukleme sirasinda bir hata olustu')
    } finally {
      setUploading(false)
      e.currentTarget.value = ''
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

      {errorMessage && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {errorMessage}
        </div>
      )}

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
                    onChange={(e) => setProject({ ...project, status: e.target.value as Project['status'] })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="draft">Taslak</option>
                    <option value="published">Yayında</option>
                    <option value="archived">Arşiv</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Proje Aşaması</label>
                  <select
                    value={project.project_status}
                    onChange={(e) =>
                      setProject({
                        ...project,
                        project_status: e.target.value as Project['project_status'],
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="ongoing">Devam Ediyor</option>
                    <option value="completed">Tamamlandı</option>
                  </select>
                </div>
              </div>

              <div>
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
                  multiple
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
                  multiple
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
                placeholder="3+1 130 - 2+1 90 M2 DAİRE SEÇENEKLERİ"
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

