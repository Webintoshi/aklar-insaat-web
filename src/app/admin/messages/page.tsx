import { createClient } from '@/lib/supabase/server'
import { Check, Trash2, Mail, Phone, MapPin } from 'lucide-react'
import { MarkAsReadButton } from './_components/mark-as-read-button'
import { DeleteMessageButton } from './_components/delete-message-button'

async function getMessages() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('contact_messages')
    .select('*')
    .order('created_at', { ascending: false })
  
  return data || []
}

export default async function MessagesPage() {
  const messages = await getMessages()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">İletişim Mesajları</h1>
      </div>

      {messages.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Henüz mesaj bulunmuyor.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`bg-white rounded-xl shadow-sm p-6 ${
                !message.is_read ? 'border-l-4 border-blue-600' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {message.name}
                  </h3>
                  <div className="flex items-center space-x-4 mt-1">
                    {message.email && (
                      <span className="flex items-center text-sm text-gray-500">
                        <Mail className="w-4 h-4 mr-1" />
                        {message.email}
                      </span>
                    )}
                    {message.phone && (
                      <span className="flex items-center text-sm text-gray-500">
                        <Phone className="w-4 h-4 mr-1" />
                        {message.phone}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!message.is_read && (
                    <MarkAsReadButton messageId={message.id} />
                  )}
                  <DeleteMessageButton messageId={message.id} />
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{message.message}</p>
              </div>
              
              <p className="text-xs text-gray-400 mt-4">
                {new Date(message.created_at).toLocaleDateString('tr-TR', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
