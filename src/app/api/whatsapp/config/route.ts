import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/whatsapp/config
 * Public endpoint - Widget konfigürasyonunu döner
 * Cache: 10 saniye
 */
export async function GET() {
  try {
    const supabase = await createClient()
    
    // Supabase function kullanarak config ve ajanları getir
    const { data: config, error } = await supabase
      .rpc('get_whatsapp_config')
      .single()

    if (error) {
      console.error('WhatsApp config fetch error:', error)
      return NextResponse.json(
        { error: 'Config fetch failed' },
        { status: 500 }
      )
    }

    if (!config) {
      return NextResponse.json(
        { error: 'Config not found' },
        { status: 404 }
      )
    }

    // Response headers - caching
    return NextResponse.json(config, {
      headers: {
        'Cache-Control': 'public, max-age=10, stale-while-revalidate=30',
      },
    })
  } catch (error) {
    console.error('WhatsApp config error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
