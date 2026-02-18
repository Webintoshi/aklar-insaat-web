import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // /admin/login → /auth/login rewrite
  if (pathname === '/admin/login') {
    const authLoginUrl = new URL('/auth/login', request.url)
    return NextResponse.rewrite(authLoginUrl)
  }

  // Sadece /admin path'leri için auth kontrolü yap (login hariç)
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // Supabase auth token'ını cookie'den kontrol et
  const authToken = request.cookies.get('sb-access-token')?.value
  const refreshToken = request.cookies.get('sb-refresh-token')?.value

  // Token yoksa login'e yönlendir
  if (!authToken && !refreshToken) {
    const loginUrl = new URL('/auth/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/auth/login']
}
