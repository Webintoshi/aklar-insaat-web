import { createClient } from '@/lib/supabase/server'
import { Plus, Edit, Trash2, Image } from 'lucide-react'
import Link from 'next/link'
import { DeleteProjectButton } from '../_components/delete-project-button'

async function getProjects(status: 'completed' | 'ongoing') {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select('*, project_images(*)')
    .eq('status', status)
    .order('order_index', { ascending: true })
  
  return data || []
}

interface ProjectsPageProps {
  params: Promise<{ type: 'completed' | 'ongoing' }>
}

export default async function ProjectsPage({ params }: ProjectsPageProps) {
  const { type } = await params
  const projects = await getProjects(type)
  const title = type === 'completed' ? 'Tamamlanmış Projeler' : 'Devam Eden Projeler'

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
                    alt={project.title}
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
                  {project.title}
                </h3>
                {project.location && (
                  <p className="text-sm text-gray-500 mb-2">{project.location}</p>
                )}
                {project.completion_date && (
                  <p className="text-xs text-gray-400 mb-4">
                    {new Date(project.completion_date).toLocaleDateString('tr-TR')}
                  </p>
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
