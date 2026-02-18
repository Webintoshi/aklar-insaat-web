'use client'

import { createClient } from '@/lib/supabase/client'
import { Trash2 } from 'lucide-react'
import { useState } from 'react'

interface DeleteProjectButtonProps {
  projectId: string
}

export function DeleteProjectButton({ projectId }: DeleteProjectButtonProps) {
  const supabase = createClient()
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    if (!confirm('Bu projeyi silmek istediğinizden emin misiniz?')) {
      return
    }

    setLoading(true)
    
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId)

    if (!error) {
      window.location.reload()
    }
    
    setLoading(false)
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="flex items-center text-red-600 hover:text-red-700 font-medium text-sm disabled:opacity-50"
    >
      <Trash2 className="w-4 h-4 mr-1" />
      Sil
    </button>
  )
}
