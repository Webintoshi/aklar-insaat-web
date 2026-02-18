'use client'

import { createClient } from '@/lib/supabase/client'
import { Check } from 'lucide-react'

interface MarkAsReadButtonProps {
  messageId: string
}

export function MarkAsReadButton({ messageId }: MarkAsReadButtonProps) {
  const supabase = createClient()

  const handleMarkAsRead = async () => {
    await supabase
      .from('contact_messages')
      .update({ is_read: true })
      .eq('id', messageId)

    window.location.reload()
  }

  return (
    <button
      onClick={handleMarkAsRead}
      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
      title="Okundu olarak işaretle"
    >
      <Check className="w-4 h-4" />
    </button>
  )
}
