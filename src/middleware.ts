import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Sadece /admin path'leri için çalış
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // /admin/login sayfasını bypass et
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  // Supabase auth token'ını cookie'den kontrol et
  const authToken = request.cookies.get('sb-access-token')?.value
  const refreshToken = request.cookies.get('sb-refresh-token')?.value

  // Token yoksa login'e yönlendir
  if (!authToken && !refreshToken) {
    const loginUrl = new URL('/admin/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*']
}
