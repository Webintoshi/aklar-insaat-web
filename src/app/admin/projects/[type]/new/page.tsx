'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function NewProjectPage({ params }: { params: { type: 'completed' | 'ongoing' } }) {
  const router = useRouter()
  const supabase = createClient()
  const { type } = params
  
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      // Slug oluştur
      const slug = name
        .toLowerCase()
        .replace(/[ıİ]/g, 'i')
        .replace(/[ğĞ]/g, 'g')
        .replace(/[üÜ]/g, 'u')
        .replace(/[şŞ]/g, 's')
        .replace(/[öÖ]/g, 'o')
        .replace(/[çÇ]/g, 'c')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50)

      const { data, error: insertError } = await supabase
        .from('projects')
        .insert({
          name: name.trim(),
          slug,
          project_status: type,
          status: 'published',
          location: location.trim() || null,
          description: description.trim() || null,
          is_published: true,
        })
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      // Başarılı olunca proje düzenleme sayfasına git
      router.push(`/admin/projects/${type}/${data.id}`)
    } catch (err: any) {
      console.error('Error creating project:', err)
      setError(err.message || 'Proje oluşturulurken hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <Link
          href={`/admin/projects/${type}`}
          className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-800">Yeni Proje Ekle</h1>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-2xl bg-white rounded-xl shadow-sm p-6">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Proje Adı *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="örn: Modern Yaşam Konutları"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Konum
            </label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              placeholder="örn: Ordu, Altınordu"
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
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y"
              placeholder="Proje hakkında kısa açıklama..."
            />
          </div>

          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              disabled={loading || !name.trim()}
              className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Projeyi Oluştur
                </>
              )}
            </button>

            <Link
              href={`/admin/projects/${type}`}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium"
            >
              İptal
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}
