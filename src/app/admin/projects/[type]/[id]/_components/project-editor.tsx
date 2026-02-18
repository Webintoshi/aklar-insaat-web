'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { uploadToR2 } from '@/lib/r2'
import { ArrowLeft, Loader2, Save, Upload, X, Image as ImageIcon } from 'lucide-react'
import Link from 'next/link'

interface ProjectImage {
  id: string
  image_url: string
  image_type: string
  caption: string | null
}

interface Project {
  id: string
  title: string
  description: string | null
  status: string
  location: string | null
  completion_date: string | null
  is_published: boolean
  order_index: number
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
  const [title, setTitle] = useState(project?.title || '')
  const [description, setDescription] = useState(project?.description || '')
  const [location, setLocation] = useState(project?.location || '')
  const [completionDate, setCompletionDate] = useState(project?.completion_date || '')
  const [isPublished, setIsPublished] = useState(project?.is_published || false)
  const [projectImages, setProjectImages] = useState<ProjectImage[]>(images)
  const [uploadingType, setUploadingType] = useState<'exterior' | 'interior' | 'location' | null>(null)

  const exteriorImages = projectImages.filter(img => img.image_type === 'exterior')
  const interiorImages = projectImages.filter(img => img.image_type === 'interior')
  const locationImages = projectImages.filter(img => img.image_type === 'location')

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, imageType: 'exterior' | 'interior' | 'location') => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingType(imageType)
    
    try {
      const buffer = Buffer.from(await file.arrayBuffer())
      const url = await uploadToR2(buffer, file.name, file.type)

      if (project) {
        const { data } = await supabase
          .from('project_images')
          .insert({
            project_id: project.id,
            image_url: url,
            image_type: imageType,
          })
          .select()
          .single()

        if (data) {
          setProjectImages([...projectImages, data])
        }
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert('Görsel yüklenirken hata oluştu.')
    }
    
    setUploadingType(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Bu görseli silmek istediğinizden emin misiniz?')) return

    await supabase.from('project_images').delete().eq('id', imageId)
    setProjectImages(projectImages.filter(img => img.id !== imageId))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (project) {
        await supabase
          .from('projects')
          .update({
            title,
            description: description || null,
            location: location || null,
            completion_date: completionDate || null,
            is_published: isPublished,
          })
          .eq('id', project.id)
      } else {
        const { data } = await supabase
          .from('projects')
          .insert({
            title,
            description: description || null,
            status: type,
            location: location || null,
            completion_date: completionDate || null,
            is_published: isPublished,
          })
          .select()
          .single()

        if (data) {
          router.push(`/admin/projects/${type}/${data.id}`)
        }
      }
      
      if (!loading || project) {
        router.push(`/admin/projects/${type}`)
      }
    } catch (error) {
      console.error('Save error:', error)
    }
    
    setLoading(false)
  }

  const ImageUploadSection = ({ 
    title, 
    images, 
    type 
  }: { 
    title: string
    images: ProjectImage[]
    type: 'exterior' | 'interior' | 'location'
  }) => (
    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium text-gray-800">{title}</h3>
        <label className="flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg cursor-pointer transition-colors">
          <Upload className="w-4 h-4 mr-2" />
          Görsel Ekle
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFileUpload(e, type)}
            disabled={uploadingType !== null}
          />
        </label>
      </div>
      
      {uploadingType === type && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Yükleniyor...</span>
        </div>
      )}

      {images.length === 0 && uploadingType !== type ? (
        <div className="text-center py-8 text-gray-400">
          <ImageIcon className="w-8 h-8 mx-auto mb-2" />
          <p className="text-sm">Görsel eklenmemiş</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {images.map((img) => (
            <div key={img.id} className="relative group aspect-video rounded-lg overflow-hidden bg-gray-100">
              <img
                src={img.image_url}
                alt=""
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => handleDeleteImage(img.id)}
                className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
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
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Proje Bilgileri</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Proje Adı *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              {type === 'completed' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tamamlanma Tarihi
                  </label>
                  <input
                    type="date"
                    value={completionDate}
                    onChange={(e) => setCompletionDate(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                  />
                </div>
              )}
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
