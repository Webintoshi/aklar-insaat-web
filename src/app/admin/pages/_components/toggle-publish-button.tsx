'use client'

import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff } from 'lucide-react'

interface TogglePublishButtonProps {
  pageId: string
  isPublished: boolean
}

export function TogglePublishButton({ pageId, isPublished }: TogglePublishButtonProps) {
  const supabase = createClient()

  const handleToggle = async () => {
    await supabase
      .from('pages')
      .update({ is_published: !isPublished })
      .eq('id', pageId)

    window.location.reload()
  }

  return (
    <button
      onClick={handleToggle}
      className={`p-2 rounded-lg transition-colors ${
        isPublished
          ? 'text-gray-600 hover:bg-gray-100'
          : 'text-green-600 hover:bg-green-50'
      }`}
      title={isPublished ? 'Yayından kaldır' : 'Yayınla'}
    >
      {isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
    </button>
  )
}
