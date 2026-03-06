'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Loader2, Save, Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react'

interface ProjectImage {
  id: string
  image_url: string
  image_type: string
  caption: string | null
}

interface Project {
  id: string
  name: string
  description: string | null
  status: string
  location: string | null
  is_published: boolean
}

interface ProjectEditorProps {
  type: 'completed' | 'ongoing'
  project?: Project
  images?: ProjectImage[]
}

export function ProjectEditor({ type, project, images = [] }: ProjectEditorProps) {
  const router = useRouter()
  const supabase = createClient()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState(project?.name || '')
  const [description, setDescription] = useState(project?.description || '')
  const [location, setLocation] = useState(project?.location || '')
  const [isPublished, setIsPublished] = useState(project?.is_published || false)
  const [projectImages, setProjectImages] = useState<ProjectImage[]>(images)
  const [uploadingType, setUploadingType] = useState<'exterior' | 'interior' | 'location' | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const exteriorImages = projectImages.filter((img) => img.image_type === 'exterior')
  const interiorImages = projectImages.filter((img) => img.image_type === 'interior')
  const locationImages = projectImages.filter((img) => img.image_type === 'location')

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    imageType: 'exterior' | 'interior' | 'location'
  ) => {
    const file = e.target.files?.[0]
    if (!file || !project) return

    // Validasyon
    if (!file.type.startsWith('image/')) {
      setUploadError('Sadece görsel dosyaları yüklenebilir (JPG, PNG, WebP)')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError('Dosya boyutu 10MB\'dan küçük olmalıdır')
      return
    }

    setUploadingType(imageType)
    setUploadError(null)
    setUploadProgress(10)

    try {
      // FormData oluştur
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', `projects/${project.id}/${imageType}`)

      setUploadProgress(30)

      // API'ye yükle (CORS sorunu olmadan)
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      setUploadProgress(70)

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Yükleme hatası')
      }

      const { url } = await response.json()

      // Veritabanına kaydet
      const { data: dbRecord, error: dbError } = await supabase
        .from('project_images')
        .insert({
          project_id: project.id,
          image_url: url,
          image_type: imageType,
        })
        .select()
        .single()

      if (dbError) {
        throw new Error(`Veritabanı hatası: ${dbError.message}`)
      }

      setUploadProgress(100)
      setProjectImages((prev) => [...prev, dbRecord])

    } catch (error: any) {
      console.error('Upload error:', error)
      setUploadError(error.message || 'Yükleme sırasında hata oluştu')
    } finally {
      setUploadingType(null)
      setUploadProgress(0)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Bu görseli silmek istediğinizden emin misiniz?')) return

    try {
      const { error } = await supabase
        .from('project_images')
        .delete()
        .eq('id', imageId)

      if (error) {
        throw error
      }

      setProjectImages(projectImages.filter((img) => img.id !== imageId))
    } catch (error: any) {
      console.error('Delete error:', error)
      alert('Görsel silinirken hata oluştu: ' + error.message)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (project) {
        // Mevcut projeyi güncelle
        const { error } = await supabase
          .from('projects')
          .update({
            name,
            description: description || null,
            location: location || null,
            is_published: isPublished,
          })
          .eq('id', project.id)

        if (error) throw error

        router.push(`/admin/projects/${type}`)
      } else {
        // Yeni proje oluştur
        const slug = name
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

        const { data, error } = await supabase
          .from('projects')
          .insert({
            name,
            description: description || null,
            project_status: type,
            status: 'published',
            location: location || null,
            is_published: isPublished,
            slug,
          })
          .select()
          .single()

        if (error) throw error

        router.push(`/admin/projects/${type}/${data.id}`)
      }
    } catch (error: any) {
      console.error('Save error:', error)
      alert('Kaydedilirken hata oluştu: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const ImageUploadSection = ({
    title,
    images,
    type: sectionType,
  }: {
    title: string
    images: ProjectImage[]
    type: 'exterior' | 'interior' | 'location'
  }) => (
    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-800">{title}</h3>
        <label className="flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
          <Upload className="w-4 h-4 mr-2" />
          Görsel Ekle
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileUpload(e, sectionType)}
            disabled={uploadingType !== null}
          />
        </label>
      </div>

      {/* Upload Progress */}
      {uploadingType === sectionType && uploadProgress > 0 && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Yükleniyor...</span>
            <span className="text-sm text-gray-600">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Message */}
      {uploadError && uploadingType === sectionType && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
          <span className="text-sm text-red-700">{uploadError}</span>
        </div>
      )}

      {/* Image Grid */}
      {images.length === 0 && uploadingType !== sectionType ? (
        <div className="text-center py-8 text-gray-400">
          <ImageIcon className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Görsel eklenmemiş</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative group aspect-video rounded-lg overflow-hidden bg-gray-100"
            >
              <img
                src={img.image_url}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
              <button
                type="button"
                onClick={() => handleDeleteImage(img.id)}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={uploadingType !== null}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link
            href={`/admin/projects/${type}`}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-800">
            {project ? 'Proje Düzenle' : 'Yeni Proje'}
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Info Card */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Proje Bilgileri</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proje Adı *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-y"
                placeholder="Proje hakkında açıklama..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Konum
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                placeholder="Projenin konumu"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="isPublished"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isPublished" className="ml-2 text-sm text-gray-700">
                Yayınla
              </label>
            </div>
          </div>
        </div>

        {/* Image Upload Sections */}
        {project && (
          <>
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Dış Mekan Görselleri</h2>
              <ImageUploadSection 
                title="Dış Mekan" 
                images={exteriorImages} 
                type="exterior" 
              />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">İç Mekan Görselleri</h2>
              <ImageUploadSection 
                title="İç Mekan" 
                images={interiorImages} 
                type="interior" 
              />
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Konum Görselleri</h2>
              <ImageUploadSection 
                title="Konum" 
                images={locationImages} 
                type="location" 
              />
            </div>
          </>
        )}

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
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
