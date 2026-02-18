// Middleware devre dışı - Auth kontrolü layout'larda yapılıyor
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Şimdilik tüm isteklere izin ver
  return NextResponse.next()
}

export const config = {
  matcher: []
}
