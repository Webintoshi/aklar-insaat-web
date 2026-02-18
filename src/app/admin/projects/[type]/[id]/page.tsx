import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ProjectEditor } from './_components/project-editor'

async function getProject(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select('*, project_images(*)')
    .eq('id', id)
    .single()
  
  return data
}

async function getProjectImages(projectId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('project_images')
    .select('*')
    .eq('project_id', projectId)
    .order('order_index')
  
  return data || []
}

interface ProjectEditPageProps {
  params: Promise<{ type: string; id: string }>
}

export default async function ProjectEditPage({ params }: ProjectEditPageProps) {
  const { type, id } = await params
  
  if (id === 'new') {
    return <ProjectEditor type={type as 'completed' | 'ongoing'} />
  }

  const project = await getProject(id)

  if (!project) {
    notFound()
  }

  const images = await getProjectImages(id)

  return <ProjectEditor 
    type={type as 'completed' | 'ongoing'} 
    project={project} 
    images={images}
  />
}
