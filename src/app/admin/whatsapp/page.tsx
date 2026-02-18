'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { 
  Phone, 
  MessageCircle, 
  Palette, 
  Eye, 
  EyeOff,
  Save,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Monitor,
  Smartphone
} from 'lucide-react'

interface WhatsAppConfig {
  id: string
  is_enabled: boolean
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
  is_multi_agent: boolean
  phone_number: string
}

const PRESET_COLORS = [
  '#25D366', // WhatsApp yeşili
  '#128C7E', // Koyu yeşil
  '#075E54', // En koyu yeşil
  '#34B7F1', // Açık mavi
  '#0EA5E9', // Sky blue
  '#8B5CF6', // Mor
  '#EC4899', // Pembe
  '#F59E0B', // Sarı/turuncu
  '#EF4444', // Kırmızı
  '#1F2937', // Koyu gri
]

const POSITIONS = [
  { value: 'bottom-right', label: 'Sağ Alt', icon: '↘️' },
  { value: 'bottom-left', label: 'Sol Alt', icon: '↙️' },
  { value: 'top-right', label: 'Sağ Üst', icon: '↗️' },
  { value: 'top-left', label: 'Sol Üst', icon: '↖️' },
]

export default function WhatsAppAdminPage() {
  const supabase = createClient()
  const [config, setConfig] = useState<WhatsAppConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [urlPattern, setUrlPattern] = useState('')

  // Config'i yükle
  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const { data, error } = await supabase
        .from('whatsapp_widget_config')
        .select('*')
        .single()

      if (error) throw error
      setConfig(data)
    } catch (err) {
      console.error('Config load error:', err)
      showMessage('error', 'Ayarlar yüklenirken bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleSave = async () => {
    if (!config) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('whatsapp_widget_config')
        .update({
          is_enabled: config.is_enabled,
          position: config.position,
          button_color: config.button_color,
          button_size: config.button_size,
          show_tooltip: config.show_tooltip,
          tooltip_text: config.tooltip_text,
          pulse_animation: config.pulse_animation,
          show_delay_ms: config.show_delay_ms,
          show_on_mobile: config.show_on_mobile,
          show_on_desktop: config.show_on_desktop,
          hidden_url_patterns: config.hidden_url_patterns,
          default_message: config.default_message,
          phone_number: config.phone_number,
          is_multi_agent: config.is_multi_agent,
        })
        .eq('id', config.id)

      if (error) throw error
      showMessage('success', 'Ayarlar başarıyla kaydedildi! Değişiklikler 30 saniye içinde aktif olacak.')
    } catch (err) {
      console.error('Save error:', err)
      showMessage('error', 'Kaydetme sırasında bir hata oluştu.')
    } finally {
      setSaving(false)
    }
  }

  const addUrlPattern = () => {
    if (!urlPattern.trim() || !config) return
    if (config.hidden_url_patterns.includes(urlPattern.trim())) {
      showMessage('error', 'Bu pattern zaten ekli.')
      return
    }
    setConfig({
      ...config,
      hidden_url_patterns: [...config.hidden_url_patterns, urlPattern.trim()]
    })
    setUrlPattern('')
  }

  const removeUrlPattern = (pattern: string) => {
    if (!config) return
    setConfig({
      ...config,
      hidden_url_patterns: config.hidden_url_patterns.filter(p => p !== pattern)
    })
  }

  const validatePhone = (phone: string) => {
    // E.164 format kontrolü: +905xxxxxxxxx
    return phone.match(/^\+[1-9]\d{7,14}$/)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  if (!config) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
          <p className="text-red-600">Konfigürasyon yüklenemedi. Lütfen sayfayı yenileyin.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">WhatsApp Widget</h1>
          <p className="text-gray-500 mt-1">Siteye WhatsApp sohbet widget'ı ekleyin ve yönetin.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? (
            <>
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              Kaydediliyor...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Kaydet
            </>
          )}
        </button>
      </div>

      {message && (
        <div className={`mb-6 p-4 rounded-lg flex items-center ${
          message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          )}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sol Kolon - Temel Ayarlar */}
        <div className="space-y-6">
          {/* Aktif/Pasif */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  config.is_enabled ? 'bg-green-100' : 'bg-gray-100'
                }`}>
                  <MessageCircle className={`w-6 h-6 ${
                    config.is_enabled ? 'text-green-600' : 'text-gray-400'
                  }`} />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">Widget Durumu</h3>
                  <p className="text-sm text-gray-500">
                    {config.is_enabled ? 'Şu anda aktif' : 'Şu anda devre dışı'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setConfig({ ...config, is_enabled: !config.is_enabled })}
                className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors ${
                  config.is_enabled ? 'bg-green-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                    config.is_enabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Telefon Numarası */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Phone className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="font-semibold text-gray-900">Telefon Numarası</h3>
            </div>
            <div>
              <input
                type="tel"
                value={config.phone_number}
                onChange={(e) => setConfig({ ...config, phone_number: e.target.value })}
                placeholder="+905xxxxxxxxx"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors ${
                  config.phone_number && !validatePhone(config.phone_number)
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    : 'border-gray-300'
                }`}
              />
              {config.phone_number && !validatePhone(config.phone_number) && (
                <p className="mt-2 text-sm text-red-600">
                  Geçerli bir telefon numarası girin (örn: +905551234567)
                </p>
              )}
              <p className="mt-2 text-sm text-gray-500">
                Uluslararası format kullanın: +90 ile başlayın, boşluk bırakmayın.
              </p>
            </div>
          </div>

          {/* Varsayılan Mesaj */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <MessageCircle className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="font-semibold text-gray-900">Varsayılan Mesaj</h3>
            </div>
            <textarea
              value={config.default_message}
              onChange={(e) => setConfig({ ...config, default_message: e.target.value })}
              rows={3}
              maxLength={300}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors resize-none"
            />
            <p className="mt-2 text-sm text-gray-500">
              {config.default_message.length}/300 karakter
            </p>
          </div>

          {/* Tooltip */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Tooltip Mesajı</h3>
              <button
                onClick={() => setConfig({ ...config, show_tooltip: !config.show_tooltip })}
                className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors ${
                  config.show_tooltip ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.show_tooltip ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            {config.show_tooltip && (
              <input
                type="text"
                value={config.tooltip_text}
                onChange={(e) => setConfig({ ...config, tooltip_text: e.target.value })}
                maxLength={100}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
            )}
          </div>
        </div>

        {/* Sağ Kolon - Görünüm Ayarları */}
        <div className="space-y-6">
          {/* Renk Seçimi */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <Palette className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="font-semibold text-gray-900">Buton Rengi</h3>
            </div>
            <div className="grid grid-cols-5 gap-3">
              {PRESET_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setConfig({ ...config, button_color: color })}
                  className={`w-full aspect-square rounded-lg border-2 transition-all ${
                    config.button_color === color
                      ? 'border-gray-900 scale-110'
                      : 'border-gray-200 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: color }}
                  aria-label={`Renk: ${color}`}
                />
              ))}
            </div>
            <div className="mt-4 flex items-center">
              <span className="text-sm text-gray-500 mr-3">Özel Renk:</span>
              <input
                type="color"
                value={config.button_color}
                onChange={(e) => setConfig({ ...config, button_color: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer border border-gray-300"
              />
              <span className="ml-3 text-sm font-mono text-gray-600">{config.button_color}</span>
            </div>
          </div>

          {/* Pozisyon */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Pozisyon</h3>
            <div className="grid grid-cols-2 gap-3">
              {POSITIONS.map((pos) => (
                <button
                  key={pos.value}
                  onClick={() => setConfig({ ...config, position: pos.value as any })}
                  className={`flex items-center justify-center px-4 py-3 rounded-lg border-2 transition-all ${
                    config.position === pos.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300 text-gray-700'
                  }`}
                >
                  <span className="text-lg mr-2">{pos.icon}</span>
                  <span className="font-medium">{pos.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Boyut ve Animasyon */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">Boyut ve Animasyon</h3>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-gray-600">Buton Boyutu</label>
                <span className="text-sm font-medium text-gray-900">{config.button_size}px</span>
              </div>
              <input
                type="range"
                min={40}
                max={80}
                value={config.button_size}
                onChange={(e) => setConfig({ ...config, button_size: parseInt(e.target.value) })}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>40px</span>
                <span>80px</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-gray-700">Nabız Animasyonu</span>
              <button
                onClick={() => setConfig({ ...config, pulse_animation: !config.pulse_animation })}
                className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors ${
                  config.pulse_animation ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    config.pulse_animation ? 'translate-x-5' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-gray-600">Görünme Gecikmesi</label>
                <span className="text-sm font-medium text-gray-900">{config.show_delay_ms / 1000}s</span>
              </div>
              <input
                type="range"
                min={0}
                max={10000}
                step={500}
                value={config.show_delay_ms}
                onChange={(e) => setConfig({ ...config, show_delay_ms: parseInt(e.target.value) })}
                className="w-full"
              />
            </div>
          </div>

          {/* Cihaz Görünürlüğü */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Cihaz Görünürlüğü</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Monitor className="w-5 h-5 text-gray-500 mr-3" />
                  <span className="text-gray-700">Masaüstü</span>
                </div>
                <button
                  onClick={() => setConfig({ ...config, show_on_desktop: !config.show_on_desktop })}
                  className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors ${
                    config.show_on_desktop ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      config.show_on_desktop ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Smartphone className="w-5 h-5 text-gray-500 mr-3" />
                  <span className="text-gray-700">Mobil</span>
                </div>
                <button
                  onClick={() => setConfig({ ...config, show_on_mobile: !config.show_on_mobile })}
                  className={`relative inline-flex h-6 w-10 items-center rounded-full transition-colors ${
                    config.show_on_mobile ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      config.show_on_mobile ? 'translate-x-5' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* Gizlenecek URL'ler */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <EyeOff className="w-5 h-5 text-blue-600 mr-2" />
              <h3 className="font-semibold text-gray-900">Gizlenecek Sayfalar</h3>
            </div>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                value={urlPattern}
                onChange={(e) => setUrlPattern(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addUrlPattern()}
                placeholder="/admin veya /checkout"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <button
                onClick={addUrlPattern}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
              >
                Ekle
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {config.hidden_url_patterns.map((pattern) => (
                <span
                  key={pattern}
                  className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                >
                  {pattern}
                  <button
                    onClick={() => removeUrlPattern(pattern)}
                    className="ml-2 text-gray-500 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Önizleme */}
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Canlı Önizleme</h3>
        <div className="relative h-64 bg-gray-100 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center text-gray-400">
            <span className="text-sm">Sayfa içeriği</span>
          </div>
          {/* Widget önizlemesi */}
          <div 
            className="absolute"
            style={{
              ...(config.position.includes('bottom') ? { bottom: '20px' } : { top: '20px' }),
              ...(config.position.includes('right') ? { right: '20px' } : { left: '20px' }),
            }}
          >
            {config.show_tooltip && (
              <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium text-gray-700 whitespace-nowrap">
                {config.tooltip_text}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-white rotate-45" 
                  style={{ right: '-4px' }}
                />
              </div>
            )}
            <div
              className={`rounded-full flex items-center justify-center shadow-lg ${
                config.pulse_animation ? 'animate-pulse' : ''
              }`}
              style={{
                backgroundColor: config.button_color,
                width: `${config.button_size}px`,
                height: `${config.button_size}px`,
              }}
            >
              <svg 
                viewBox="0 0 24 24" 
                className="w-1/2 h-1/2"
                style={{ fill: 'white' }}
              >
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
