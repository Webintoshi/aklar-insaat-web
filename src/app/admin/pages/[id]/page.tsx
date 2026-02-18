import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { PageEditor } from './_components/page-editor'

async function getPage(id: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('pages')
    .select('*')
    .eq('id', id)
    .single()
  
  return data
}

export default async function PageEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const page = await getPage(id)

  if (!page) {
    notFound()
  }

  return <PageEditor page={page} />
}
