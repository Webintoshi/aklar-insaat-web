'use client'

import { createClient } from '@/lib/supabase/client'
import { Trash2 } from 'lucide-react'

interface DeleteMessageButtonProps {
  messageId: string
}

export function DeleteMessageButton({ messageId }: DeleteMessageButtonProps) {
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm('Bu mesajı silmek istediğinizden emin misiniz?')) {
      return
    }

    await supabase
      .from('contact_messages')
      .delete()
      .eq('id', messageId)

    window.location.reload()
  }

  return (
    <button
      onClick={handleDelete}
      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
      title="Sil"
    >
      <Trash2 className="w-4 h-4" />
    </button>
  )
}
