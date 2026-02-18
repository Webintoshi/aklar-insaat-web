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
    
    // Doğrudan tablodan config getir
    const { data: config, error } = await supabase
      .from('whatsapp_widget_config')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

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

    // Widget için normalize edilmiş response
    const response = {
      id: config.id,
      enabled: config.is_enabled,
      position: config.position,
      button_color: config.button_color,
      button_size: config.button_size,
      show_tooltip: config.show_tooltip,
      tooltip_text: config.tooltip_text,
      pulse_animation: config.pulse_animation,
      show_delay_ms: config.show_delay_ms,
      show_on_mobile: config.show_on_mobile,
      show_on_desktop: config.show_on_desktop,
      hidden_url_patterns: config.hidden_url_patterns || [],
      default_message: config.default_message,
      phone_number: config.phone_number,
      // Multi-agent yapı için (ileride eklenebilir)
      is_multi_agent: false,
      agents: []
    }

    // Response headers - caching
    return NextResponse.json(response, {
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
