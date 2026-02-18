import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/whatsapp/track
 * Tıklama analitiği kaydet
 * Fire-and-forget pattern
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { config_id, agent_id, page_url, referrer, device_type, session_id } = body

    // Validasyon
    if (!config_id) {
      return NextResponse.json(
        { error: 'Config ID required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Async olarak kaydet (await kullanmayarak hızlı yanıt)
    supabase
      .rpc('track_whatsapp_click', {
        p_config_id: config_id,
        p_agent_id: agent_id || null,
        p_page_url: page_url?.substring(0, 500) || null,
        p_referrer: referrer?.substring(0, 500) || null,
        p_device_type: device_type || 'unknown',
      })
      .then(({ error }) => {
        if (error) {
          console.error('Track error:', error)
        }
      })

    // Hemen 200 dön (fire-and-forget)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('WhatsApp track error:', error)
    // Track endpoint'inde hata da 200 dönelim ki widget çalışmaya devam etsin
    return NextResponse.json({ success: true })
  }
}
