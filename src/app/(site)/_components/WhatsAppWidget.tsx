'use client'

import { useEffect, useState } from 'react'

interface WhatsAppConfig {
  enabled: boolean
  phone_number: string
  position: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  button_color: string
  button_size: number
  show_tooltip: boolean
  tooltip_text: string
  pulse_animation: boolean
  show_delay_ms: number
  show_on_mobile: boolean
  show_on_desktop: boolean
  hidden_url_patterns: string[]
  default_message: string
}

const DEFAULT_CONFIG: WhatsAppConfig = {
  enabled: true,
  phone_number: '+905457277297',
  position: 'bottom-right',
  button_color: '#25D366',
  button_size: 60,
  show_tooltip: true,
  tooltip_text: 'Bize WhatsApp\'tan yazın!',
  pulse_animation: true,
  show_delay_ms: 500,
  show_on_mobile: true,
  show_on_desktop: true,
  hidden_url_patterns: ['/admin'],
  default_message: 'Merhaba, web sitenizden ulaşıyorum.',
}

export function WhatsAppWidget() {
  const [config, setConfig] = useState<WhatsAppConfig | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)

  useEffect(() => {
    // Config'i çek
    const fetchConfig = async () => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 1000)

        const res = await fetch('/api/whatsapp/config', {
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!res.ok) throw new Error('Config fetch failed')

        const data = await res.json()
        setConfig(data)
      } catch (err) {
        console.log('[WA Widget] Using default config')
        setConfig(DEFAULT_CONFIG)
      }
    }

    fetchConfig()
  }, [])

  useEffect(() => {
    if (!config || config.enabled === false) return

    // URL kontrolü
    const currentPath = window.location.pathname
    const shouldHide = config.hidden_url_patterns?.some((pattern: string) => {
      if (pattern.includes('*')) {
        const regex = new RegExp(pattern.replace(/\*/g, '.*'))
        return regex.test(currentPath)
      }
      return currentPath.includes(pattern)
    })

    if (shouldHide) return

    // Cihaz kontrolü
    const deviceType = /Mobi|Android/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
    if (deviceType === 'mobile' && config.show_on_mobile === false) return
    if (deviceType === 'desktop' && config.show_on_desktop === false) return

    // Gecikmeli göster
    const delay = Math.min(config.show_delay_ms || 500, 1000)
    const timer = setTimeout(() => {
      setIsVisible(true)
      // Tooltip göster
      if (config.show_tooltip) {
        setTimeout(() => setShowTooltip(true), 500)
        setTimeout(() => setShowTooltip(false), 5000)
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [config])

  if (!config || config.enabled === false || !isVisible) return null

  const waLink = `https://wa.me/${config.phone_number.replace(/\D/g, '')}${
    config.default_message ? '?text=' + encodeURIComponent(config.default_message) : ''
  }`

  const positionClasses = {
    'bottom-right': 'bottom-5 right-5',
    'bottom-left': 'bottom-5 left-5',
    'top-right': 'top-5 right-5',
    'top-left': 'top-5 left-5',
  }

  const isRight = config.position.includes('right')

  return (
    <div className={`fixed ${positionClasses[config.position]} z-[9999] flex items-center`}>
      {/* Tooltip */}
      {config.show_tooltip && (
        <div
          className={`
            absolute ${isRight ? 'right-[70px]' : 'left-[70px]'} 
            bg-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium text-gray-700 whitespace-nowrap
            transition-all duration-300 pointer-events-none
            ${showTooltip ? 'opacity-100 translate-x-0' : `opacity-0 ${isRight ? 'translate-x-2' : '-translate-x-2'}`}
          `}
        >
          {config.tooltip_text}
          <div
            className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 bg-white rotate-45 ${
              isRight ? '-right-1' : '-left-1'
            }`}
          />
        </div>
      )}

      {/* Button */}
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className={`
          rounded-full flex items-center justify-center shadow-lg
          transition-all duration-300 hover:scale-110
          ${config.pulse_animation ? 'animate-pulse' : ''}
        `}
        style={{
          backgroundColor: config.button_color,
          width: `${config.button_size}px`,
          height: `${config.button_size}px`,
          boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
        }}
        onMouseEnter={() => config.show_tooltip && setShowTooltip(true)}
        onMouseLeave={() => config.show_tooltip && setShowTooltip(false)}
      >
        <svg viewBox="0 0 24 24" className="w-1/2 h-1/2" style={{ fill: 'white' }}>
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  )
}
