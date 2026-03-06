'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Plus, Edit, Trash2, Image, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { DeleteProjectButton } from '../_components/delete-project-button'

interface Project {
  id: string
  name: string
  title?: string
  slug: string
  location?: string
  is_published: boolean
  project_images?: { image_url: string }[]
}

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const params = useParams<{ type: 'completed' | 'ongoing' }>()
  const type = params?.type || 'ongoing'
  const title = type === 'completed' ? 'Tamamlanmış Projeler' : 'Devam Eden Projeler'

  useEffect(() => {
    loadProjects()
  }, [type])

  async function loadProjects() {
    setLoading(true)
    setError(null)
    
    try {
      // Önce projeleri çek
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*')
        .eq('project_status', type)
        .order('created_at', { ascending: false })

      if (projectsError) {
        throw projectsError
      }

      // Sonra görselleri çek ve birleştir
      const projectsWithImages = await Promise.all(
        (projectsData || []).map(async (project) => {
          const { data: images } = await supabase
            .from('project_images')
            .select('image_url')
            .eq('project_id', project.id)
            .limit(1)
          
          return {
            ...project,
            project_images: images || []
          }
        })
      )

      setProjects(projectsWithImages)
    } catch (err: any) {
      console.error('Error loading projects:', err)
      setError(err.message || 'Projeler yüklenirken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <h3 className="text-red-800 font-semibold mb-2">Hata</h3>
        <p className="text-red-600">{error}</p>
        <button 
          onClick={loadProjects}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Tekrar Dene
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
        <Link
          href={`/admin/projects/${type}/new`}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5 mr-2" />
          Yeni Proje Ekle
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Image className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Henüz proje bulunmuyor.</p>
          <Link
            href={`/admin/projects/${type}/new`}
            className="inline-block mt-4 text-blue-600 hover:text-blue-700 font-medium"
          >
            İlk projenizi ekleyin
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div key={project.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="aspect-video bg-gray-100 relative">
                {project.project_images?.[0]?.image_url ? (
                  <img
                    src={project.project_images[0].image_url}
                    alt={project.name || project.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Image className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded ${
                  project.is_published 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {project.is_published ? 'Yayında' : 'Taslak'}
                </span>
              </div>
              
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">
                  {project.name || project.title}
                </h3>
                {project.location && (
                  <p className="text-sm text-gray-500 mb-2">{project.location}</p>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <Link
                    href={`/admin/projects/${type}/${project.id}`}
                    className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm"
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Düzenle
                  </Link>
                  <DeleteProjectButton projectId={project.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
