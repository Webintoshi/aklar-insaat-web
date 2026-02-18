-- WhatsApp Floating Chat Widget Schema
-- FAZ 1: MVP (Tek numara modu)
-- FAZ 2: Multi-agent desteği (whatsapp_agents tablosu)

-- =====================================================
-- 1. ANA WIDGET KONFİGÜRASYONU
-- =====================================================

CREATE TABLE IF NOT EXISTS whatsapp_widget_config (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Temel ayarlar
    is_enabled      BOOLEAN NOT NULL DEFAULT true,
    position        VARCHAR(20) NOT NULL DEFAULT 'bottom-right'
                    CHECK (position IN ('bottom-right','bottom-left','top-right','top-left')),

    -- Görünüm
    button_color    VARCHAR(7) NOT NULL DEFAULT '#25D366',
    button_size     SMALLINT NOT NULL DEFAULT 60
                    CHECK (button_size BETWEEN 40 AND 80),
    show_tooltip    BOOLEAN NOT NULL DEFAULT true,
    tooltip_text    VARCHAR(100) DEFAULT 'Bize yazın!',

    -- Animasyon
    pulse_animation BOOLEAN NOT NULL DEFAULT true,
    show_delay_ms   INT NOT NULL DEFAULT 2000
                    CHECK (show_delay_ms BETWEEN 0 AND 30000),

    -- Cihaz görünürlüğü
    show_on_mobile  BOOLEAN NOT NULL DEFAULT true,
    show_on_desktop BOOLEAN NOT NULL DEFAULT true,

    -- Gizlenecek URL pattern'leri
    hidden_url_patterns     TEXT[] DEFAULT ARRAY['/checkout', '/cart', '/admin'],

    -- Pre-filled mesaj
    default_message VARCHAR(300) DEFAULT 'Merhaba, bilgi almak istiyorum.',

    -- Tek ajan modu (FAZ 1)
    is_multi_agent  BOOLEAN NOT NULL DEFAULT false,
    phone_number    VARCHAR(20),  -- +905xxxxxxxxx formatında

    -- Meta
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_phone_format CHECK (
        phone_number IS NULL OR phone_number ~ '^\+[1-9]\d{7,14}$'
    )
);

-- =====================================================
-- 2. MULTI-AGENT TABLOSU (FAZ 2)
-- =====================================================

CREATE TABLE IF NOT EXISTS whatsapp_agents (
    id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    config_id        UUID NOT NULL REFERENCES whatsapp_widget_config(id)
                     ON DELETE CASCADE,
    display_name     VARCHAR(100) NOT NULL,
    title            VARCHAR(100),
    phone_number     VARCHAR(20) NOT NULL,
    avatar_url       TEXT,
    is_always_online BOOLEAN NOT NULL DEFAULT false,
    sort_order       SMALLINT NOT NULL DEFAULT 0,
    is_active        BOOLEAN NOT NULL DEFAULT true,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT chk_agent_phone_format CHECK (phone_number ~ '^\+[1-9]\d{7,14}$')
);

-- =====================================================
-- 3. TIKLAMA ANALİTİĞİ
-- =====================================================

CREATE TABLE IF NOT EXISTS whatsapp_click_events (
    id           BIGSERIAL PRIMARY KEY,
    config_id    UUID NOT NULL REFERENCES whatsapp_widget_config(id),
    agent_id     UUID REFERENCES whatsapp_agents(id),
    session_id   VARCHAR(64),
    page_url     TEXT,
    referrer     TEXT,
    device_type  VARCHAR(10) CHECK (device_type IN ('mobile','tablet','desktop')),
    clicked_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =====================================================
-- 4. İNDEKSLER
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_whatsapp_agents_config_id 
    ON whatsapp_agents(config_id) 
    WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_whatsapp_clicks_config_dt 
    ON whatsapp_click_events(config_id, clicked_at DESC);

-- =====================================================
-- 5. TRIGGER - updated_at otomatik güncelleme
-- =====================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_whatsapp_config_updated_at
    BEFORE UPDATE ON whatsapp_widget_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_whatsapp_agents_updated_at
    BEFORE UPDATE ON whatsapp_agents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- 6. VARSAYILAN KONFİGÜRASYON (Tek kayıt)
-- =====================================================

INSERT INTO whatsapp_widget_config (
    is_enabled,
    position,
    button_color,
    button_size,
    show_tooltip,
    tooltip_text,
    pulse_animation,
    show_delay_ms,
    show_on_mobile,
    show_on_desktop,
    hidden_url_patterns,
    default_message,
    is_multi_agent,
    phone_number
) VALUES (
    true,
    'bottom-right',
    '#25D366',
    60,
    true,
    'Bize WhatsApp\'tan yazın!',
    true,
    2000,
    true,
    true,
    ARRAY['/admin', '/auth'],
    'Merhaba, Aklar İnşaat hakkında bilgi almak istiyorum.',
    false,
    '+905000000000'  -- Varsayılan numara (admin panelden değiştirilecek)
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- 7. RLS POLİTİKALARI
-- =====================================================

ALTER TABLE whatsapp_widget_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_click_events ENABLE ROW LEVEL SECURITY;

-- Public: Config okuma (anonim kullanıcılar)
CREATE POLICY "Allow public read config" 
    ON whatsapp_widget_config FOR SELECT 
    USING (true);

-- Admin: Config yazma (sadece adminler)
CREATE POLICY "Allow admin write config" 
    ON whatsapp_widget_config FOR ALL 
    USING (auth.role() = 'authenticated');

-- Agents: Public okuma
CREATE POLICY "Allow public read agents" 
    ON whatsapp_agents FOR SELECT 
    USING (is_active = true);

-- Agents: Admin yazma
CREATE POLICY "Allow admin write agents" 
    ON whatsapp_agents FOR ALL 
    USING (auth.role() = 'authenticated');

-- Click events: Public ekleme (track için)
CREATE POLICY "Allow public insert clicks" 
    ON whatsapp_click_events FOR INSERT 
    WITH CHECK (true);

-- Click events: Admin okuma
CREATE POLICY "Allow admin read clicks" 
    ON whatsapp_click_events FOR SELECT 
    USING (auth.role() = 'authenticated');

-- =====================================================
-- 8. FONKSİYONLAR
-- =====================================================

-- Config'i getir (public)
CREATE OR REPLACE FUNCTION get_whatsapp_config()
RETURNS jsonb AS $$
DECLARE
    config_record RECORD;
    agents_json jsonb;
BEGIN
    SELECT * INTO config_record 
    FROM whatsapp_widget_config 
    LIMIT 1;
    
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;
    
    -- Multi-agent mod ise ajanları da getir
    IF config_record.is_multi_agent THEN
        SELECT jsonb_agg(
            jsonb_build_object(
                'id', id,
                'display_name', display_name,
                'title', title,
                'phone_number', phone_number,
                'avatar_url', avatar_url,
                'is_always_online', is_always_online,
                'sort_order', sort_order
            ) ORDER BY sort_order
        ) INTO agents_json
        FROM whatsapp_agents
        WHERE config_id = config_record.id 
          AND is_active = true;
    ELSE
        agents_json := '[]'::jsonb;
    END IF;
    
    RETURN jsonb_build_object(
        'id', config_record.id,
        'enabled', config_record.is_enabled,
        'position', config_record.position,
        'button_color', config_record.button_color,
        'button_size', config_record.button_size,
        'show_tooltip', config_record.show_tooltip,
        'tooltip_text', config_record.tooltip_text,
        'pulse_animation', config_record.pulse_animation,
        'show_delay_ms', config_record.show_delay_ms,
        'show_on_mobile', config_record.show_on_mobile,
        'show_on_desktop', config_record.show_on_desktop,
        'hidden_url_patterns', config_record.hidden_url_patterns,
        'is_multi_agent', config_record.is_multi_agent,
        'phone_number', config_record.phone_number,
        'default_message', config_record.default_message,
        'agents', agents_json
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tıklama kaydet
CREATE OR REPLACE FUNCTION track_whatsapp_click(
    p_config_id UUID,
    p_agent_id UUID DEFAULT NULL,
    p_page_url TEXT DEFAULT NULL,
    p_referrer TEXT DEFAULT NULL,
    p_device_type TEXT DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO whatsapp_click_events (
        config_id,
        agent_id,
        page_url,
        referrer,
        device_type
    ) VALUES (
        p_config_id,
        p_agent_id,
        p_page_url,
        p_referrer,
        p_device_type
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
