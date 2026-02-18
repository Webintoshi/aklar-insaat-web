import { redirect } from 'next/navigation'

export default function AdminPage() {
  // Admin ana sayfasına gelindiğinde dashboard'a yönlendir
  redirect('/admin/pages')
}
