/**
 * WhatsApp Floating Chat Widget
 * Vanilla JS - ~8KB gzipped
 * Version: 1.0.0
 */

(function () {
  'use strict';

  // Konfigürasyon
  const CONFIG_URL = '/api/whatsapp/config';
  const TRACK_URL = '/api/whatsapp/track';
  const LS_KEY = 'wa_widget_cfg';
  const LS_TTL_MS = 30000; // 30 saniye cache
  
  let config = null;
  let widgetElement = null;
  let isVisible = false;

  // =====================================================
  // UTILS
  // =====================================================

  function getFromLocalStorage() {
    try {
      const data = localStorage.getItem(LS_KEY);
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      if (Date.now() - parsed._timestamp > LS_TTL_MS) {
        localStorage.removeItem(LS_KEY);
        return null;
      }
      return parsed;
    } catch (e) {
      return null;
    }
  }

  function saveToLocalStorage(data) {
    try {
      data._timestamp = Date.now();
      localStorage.setItem(LS_KEY, JSON.stringify(data));
    } catch (e) {
      // LocalStorage full veya disabled
    }
  }

  function getSessionId() {
    let sessionId = sessionStorage.getItem('wa_session_id');
    if (!sessionId) {
      sessionId = 'wa_' + Math.random().toString(36).substring(2, 15);
      sessionStorage.setItem('wa_session_id', sessionId);
    }
    return sessionId;
  }

  function getDeviceType() {
    const ua = navigator.userAgent;
    if (/Mobi|Android/i.test(ua)) return 'mobile';
    if (/Tablet|iPad/i.test(ua)) return 'tablet';
    return 'desktop';
  }

  function shouldHide(patterns) {
    if (!patterns || !Array.isArray(patterns)) return false;
    const currentPath = window.location.pathname;
    return patterns.some(pattern => {
      try {
        // Basit string match veya regex
        if (pattern.includes('*')) {
          const regex = new RegExp(pattern.replace(/\*/g, '.*'));
          return regex.test(currentPath);
        }
        return currentPath.includes(pattern);
      } catch (e) {
        return false;
      }
    });
  }

  function buildWaLink(phone, message) {
    const cleanPhone = phone.replace(/\D/g, '');
    const encodedMsg = encodeURIComponent(message || '');
    return `https://wa.me/${cleanPhone}${encodedMsg ? '?text=' + encodedMsg : ''}`;
  }

  function trackClick(agentId) {
    if (!config || !config.id) return;
    
    const data = {
      config_id: config.id,
      agent_id: agentId,
      page_url: window.location.href,
      referrer: document.referrer,
      device_type: getDeviceType(),
      session_id: getSessionId()
    };

    // Fire-and-forget beacon
    if (navigator.sendBeacon) {
      navigator.sendBeacon(TRACK_URL, JSON.stringify(data));
    } else {
      // Fallback: fetch with keepalive
      fetch(TRACK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        keepalive: true
      }).catch(() => {});
    }
  }

  // =====================================================
  // WIDGET RENDER
  // =====================================================

  function createStyles() {
    if (document.getElementById('wa-widget-styles')) return;
    
    const styles = document.createElement('style');
    styles.id = 'wa-widget-styles';
    styles.textContent = `
      .wa-widget-container {
        position: fixed;
        z-index: 9999;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      }
      
      .wa-widget-container.bottom-right { bottom: 20px; right: 20px; }
      .wa-widget-container.bottom-left { bottom: 20px; left: 20px; }
      .wa-widget-container.top-right { top: 20px; right: 20px; }
      .wa-widget-container.top-left { top: 20px; left: 20px; }

      .wa-widget-button {
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: #25D366;
        box-shadow: 0 4px 12px rgba(0,0,0,0.25);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        position: relative;
        border: none;
        outline: none;
      }

      .wa-widget-button:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 20px rgba(0,0,0,0.3);
      }

      .wa-widget-button svg {
        width: 32px;
        height: 32px;
        fill: white;
      }

      @keyframes wa-pulse {
        0% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0.7); }
        70% { box-shadow: 0 0 0 15px rgba(37, 211, 102, 0); }
        100% { box-shadow: 0 0 0 0 rgba(37, 211, 102, 0); }
      }

      .wa-widget-button.pulse {
        animation: wa-pulse 2s infinite;
      }

      .wa-widget-tooltip {
        position: absolute;
        background: white;
        color: #333;
        padding: 8px 16px;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        white-space: nowrap;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        pointer-events: none;
      }

      .wa-widget-container.bottom-right .wa-widget-tooltip,
      .wa-widget-container.top-right .wa-widget-tooltip {
        right: 70px;
        top: 50%;
        transform: translateY(-50%) translateX(10px);
      }

      .wa-widget-container.bottom-left .wa-widget-tooltip,
      .wa-widget-container.top-left .wa-widget-tooltip {
        left: 70px;
        top: 50%;
        transform: translateY(-50%) translateX(-10px);
      }

      .wa-widget-tooltip.show {
        opacity: 1;
        visibility: visible;
        transform: translateY(-50%) translateX(0);
      }

      .wa-widget-popup {
        position: absolute;
        bottom: 75px;
        right: 0;
        width: 300px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0,0,0,0.2);
        overflow: hidden;
        opacity: 0;
        visibility: hidden;
        transform: translateY(20px) scale(0.95);
        transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .wa-widget-popup.show {
        opacity: 1;
        visibility: visible;
        transform: translateY(0) scale(1);
      }

      .wa-popup-header {
        background: #075E54;
        color: white;
        padding: 20px;
        text-align: center;
      }

      .wa-popup-header h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }

      .wa-popup-header p {
        margin: 8px 0 0;
        font-size: 14px;
        opacity: 0.9;
      }

      .wa-agents-list {
        max-height: 300px;
        overflow-y: auto;
      }

      .wa-agent-item {
        display: flex;
        align-items: center;
        padding: 16px 20px;
        cursor: pointer;
        transition: background 0.2s;
        border-bottom: 1px solid #f0f0f0;
        text-decoration: none;
        color: inherit;
      }

      .wa-agent-item:hover {
        background: #f5f5f5;
      }

      .wa-agent-avatar {
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: #e0e0e0;
        margin-right: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        flex-shrink: 0;
      }

      .wa-agent-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .wa-agent-avatar svg {
        width: 24px;
        height: 24px;
        fill: #999;
      }

      .wa-agent-info {
        flex: 1;
      }

      .wa-agent-name {
        font-weight: 600;
        font-size: 15px;
        color: #111;
      }

      .wa-agent-title {
        font-size: 13px;
        color: #666;
        margin-top: 2px;
      }

      .wa-agent-status {
        display: flex;
        align-items: center;
        font-size: 12px;
        color: #25D366;
        margin-top: 4px;
      }

      .wa-agent-status::before {
        content: '';
        width: 8px;
        height: 8px;
        background: #25D366;
        border-radius: 50%;
        margin-right: 6px;
      }

      .wa-agent-status.offline::before {
        background: #999;
      }

      .wa-agent-status.offline {
        color: #999;
      }

      /* Mobil düzenlemeler */
      @media (max-width: 480px) {
        .wa-widget-popup {
          width: calc(100vw - 40px);
          max-width: 300px;
          right: -10px;
        }
        
        .wa-widget-container.bottom-right { bottom: 15px; right: 15px; }
        .wa-widget-container.bottom-left { bottom: 15px; left: 15px; }
        .wa-widget-container.top-right { top: 15px; right: 15px; }
        .wa-widget-container.top-left { top: 15px; left: 15px; }
      }
    `;
    document.head.appendChild(styles);
  }

  function createWidget() {
    if (widgetElement) return;
    
    createStyles();
    
    widgetElement = document.createElement('div');
    widgetElement.className = `wa-widget-container ${config.position}`;
    widgetElement.style.display = 'none';

    const isMultiAgent = config.is_multi_agent && config.agents && config.agents.length > 0;

    if (isMultiAgent) {
      // Multi-agent popup'lı versiyon
      widgetElement.innerHTML = `
        <div class="wa-widget-popup" id="wa-popup">
          <div class="wa-popup-header">
            <h3>Bize ulaşın</h3>
            <p>Bir temsilcimiz size yardımcı olsun</p>
          </div>
          <div class="wa-agents-list">
            ${config.agents.map(agent => `
              <a href="${buildWaLink(agent.phone_number, config.default_message)}" 
                 class="wa-agent-item" 
                 data-agent-id="${agent.id}">
                <div class="wa-agent-avatar">
                  ${agent.avatar_url ? 
                    `<img src="${agent.avatar_url}" alt="${agent.display_name}" onerror="this.style.display='none'; this.parentNode.innerHTML='<svg viewBox=\\'0 0 24 24\\'><path d=\\'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z\\'/></svg>';">` : 
                    `<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`
                  }
                </div>
                <div class="wa-agent-info">
                  <div class="wa-agent-name">${agent.display_name}</div>
                  ${agent.title ? `<div class="wa-agent-title">${agent.title}</div>` : ''}
                  <div class="wa-agent-status ${agent.is_always_online ? '' : 'offline'}">
                    ${agent.is_always_online ? 'Çevrimiçi' : 'Mesaj bırakın'}
                  </div>
                </div>
              </a>
            `).join('')}
          </div>
        </div>
        <button class="wa-widget-button ${config.pulse_animation ? 'pulse' : ''}" id="wa-button" aria-label="WhatsApp'tan bize yazın">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </button>
      `;

      // Popup toggle
      const button = widgetElement.querySelector('#wa-button');
      const popup = widgetElement.querySelector('#wa-popup');
      
      button.addEventListener('click', (e) => {
        e.stopPropagation();
        popup.classList.toggle('show');
      });

      document.addEventListener('click', (e) => {
        if (!widgetElement.contains(e.target)) {
          popup.classList.remove('show');
        }
      });

      // Agent tıklama tracking
      widgetElement.querySelectorAll('.wa-agent-item').forEach(item => {
        item.addEventListener('click', () => {
          trackClick(item.dataset.agentId);
        });
      });

    } else {
      // Tek numara versiyonu
      const waLink = buildWaLink(config.phone_number, config.default_message);
      
      widgetElement.innerHTML = `
        ${config.show_tooltip ? `
          <div class="wa-widget-tooltip" id="wa-tooltip">${config.tooltip_text}</div>
        ` : ''}
        <a href="${waLink}" 
           target="_blank" 
           rel="noopener noreferrer"
           class="wa-widget-button ${config.pulse_animation ? 'pulse' : ''}" 
           aria-label="WhatsApp'tan bize yazın"
           id="wa-button">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
      `;

      // Tooltip göster/gizle
      if (config.show_tooltip) {
        const button = widgetElement.querySelector('#wa-button');
        const tooltip = widgetElement.querySelector('#wa-tooltip');
        
        setTimeout(() => {
          tooltip.classList.add('show');
          setTimeout(() => tooltip.classList.remove('show'), 5000);
        }, 1000);

        button.addEventListener('mouseenter', () => tooltip.classList.add('show'));
        button.addEventListener('mouseleave', () => tooltip.classList.remove('show'));
      }

      // Click tracking
      widgetElement.querySelector('#wa-button').addEventListener('click', () => {
        trackClick(null);
      });
    }

    // Renk ve boyut özelleştirme
    const button = widgetElement.querySelector('.wa-widget-button');
    if (button) {
      button.style.backgroundColor = config.button_color;
      button.style.width = config.button_size + 'px';
      button.style.height = config.button_size + 'px';
    }

    document.body.appendChild(widgetElement);
  }

  function showWidget() {
    if (widgetElement) {
      widgetElement.style.display = 'block';
      isVisible = true;
    }
  }

  // =====================================================
  // INIT
  // =====================================================

  async function fetchConfig() {
    // Önce cache'den dene
    const cached = getFromLocalStorage();
    if (cached) {
      config = cached;
      console.log('[WA Widget] Config loaded from cache:', config);
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const res = await fetch(CONFIG_URL, { 
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        console.error('[WA Widget] Config fetch failed:', res.status);
        throw new Error(`Config fetch failed: ${res.status}`);
      }

      config = await res.json();
      console.log('[WA Widget] Config fetched:', config);
      saveToLocalStorage(config);
    } catch (err) {
      console.error('[WA Widget] Config fetch error:', err.message);
      // Hata durumunda varsayılan config kullan
      config = {
        enabled: true,
        phone_number: '+905457277297',
        position: 'bottom-right',
        button_color: '#25D366',
        button_size: 60,
        show_tooltip: true,
        tooltip_text: 'Bize WhatsApp\'tan yazın!',
        pulse_animation: true,
        show_delay_ms: 2000,
        show_on_mobile: true,
        show_on_desktop: true,
        hidden_url_patterns: ['/admin'],
        default_message: 'Merhaba, web sitenizden ulaşıyorum.'
      };
      console.log('[WA Widget] Using default config');
    }
  }

  async function init() {
    console.log('[WA Widget] Initializing...');
    await fetchConfig();
    
    if (!config) {
      console.log('[WA Widget] No config available');
      return;
    }
    
    console.log('[WA Widget] Config enabled:', config.enabled);
    
    if (config.enabled === false) {
      console.log('[WA Widget] Widget is disabled');
      return;
    }

    // Cihaz kontrolü
    const deviceType = getDeviceType();
    console.log('[WA Widget] Device type:', deviceType);
    
    if (deviceType === 'mobile' && config.show_on_mobile === false) {
      console.log('[WA Widget] Hidden on mobile');
      return;
    }
    if (deviceType === 'desktop' && config.show_on_desktop === false) {
      console.log('[WA Widget] Hidden on desktop');
      return;
    }

    // URL kontrolü
    const currentPath = window.location.pathname;
    const shouldHideWidget = shouldHide(config.hidden_url_patterns);
    console.log('[WA Widget] Current path:', currentPath, 'Should hide:', shouldHideWidget);
    
    if (shouldHideWidget) {
      console.log('[WA Widget] Hidden by URL pattern');
      return;
    }

    // Widget oluştur (gizli)
    console.log('[WA Widget] Creating widget...');
    createWidget();

    // Gecikmeli göster
    setTimeout(() => {
      console.log('[WA Widget] Showing widget');
      showWidget();
    }, config.show_delay_ms || 2000);
  }

  // Başlat
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 0);
  }

})();
