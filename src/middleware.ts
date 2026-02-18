import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Sadece /admin path'leri için çalış
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // /admin/login sayfasına erişim kontrolü
  if (pathname === '/admin/login') {
    // Zaten giriş yapmış mı kontrol et
    const authToken = request.cookies.get('sb-access-token')?.value
    if (authToken) {
      // Giriş yapmışsa admin/pages'e yönlendir
      return NextResponse.redirect(new URL('/admin/pages', request.url))
    }
    // Giriş yapmamışsa /auth/login'e rewrite
    const authLoginUrl = new URL('/auth/login', request.url)
    return NextResponse.rewrite(authLoginUrl)
  }

  // Diğer /admin sayfaları için auth kontrolü
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
