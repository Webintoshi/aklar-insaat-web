import { createClient } from '@/lib/supabase/server'
import { Edit, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { TogglePublishButton } from './_components/toggle-publish-button'

async function getPages() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('pages')
    .select('*')
    .order('order_index')
  
  return data || []
}

const pageNames: Record<string, string> = {
  home: 'Ana Sayfa',
  kurumsal: 'Kurumsal',
  tahhut: 'Taahhüt',
  projeler: 'Projeler',
  iletisim: 'İletişim',
}

export default async function PagesPage() {
  const pages = await getPages()

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Sayfalar</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sayfa
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durum
              </th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Son Güncelleme
              </th>
              <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {pages.map((page) => (
              <tr key={page.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {pageNames[page.slug] || page.title}
                      </p>
                      <p className="text-sm text-gray-500">/{page.slug}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    page.is_published
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {page.is_published ? 'Yayında' : 'Taslak'}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Date(page.updated_at).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <TogglePublishButton 
                      pageId={page.id} 
                      isPublished={page.is_published} 
                    />
                    <Link
                      href={`/admin/pages/${page.id}`}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
