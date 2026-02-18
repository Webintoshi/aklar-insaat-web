-- ============================================================
-- AKLAR İNŞAAT - FRONTEND SCHEMA EXTENSIONS
-- Bu dosya, ana sayfa bölümlerini yönetmek için gerekli 
-- tabloları ve güncellemeleri içerir
-- ============================================================

-- ============================================================
-- 1. PAGES TABLOSU GÜNCELLEMESİ (JSON content desteği)
-- ============================================================

-- Pages tablosuna content_json ekle (mevcut content TEXT korunur)
ALTER TABLE pages ADD COLUMN IF NOT EXISTS content_json JSONB DEFAULT NULL;

-- İçerik tipini belirlemek için (html, json, markdown)
ALTER TABLE pages ADD COLUMN IF NOT EXISTS content_type VARCHAR(20) DEFAULT 'html' 
  CHECK (content_type IN ('html', 'json', 'markdown'));

-- ============================================================
-- 2. HERO SECTION TABLOSU
-- ============================================================

CREATE TABLE IF NOT EXISTS hero_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Temel Bilgiler
  name VARCHAR(100) NOT NULL,              -- "Ana Sayfa Hero", "Kurumsal Hero"
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  
  -- Arka Plan
  background_type VARCHAR(20) DEFAULT 'image' 
    CHECK (background_type IN ('image', 'video', 'slider')),
  background_image TEXT,                    -- Ana görsel URL (R2)
  background_video TEXT,                    -- Video URL (YouTube/Vimeo ID veya direct)
  slider_images JSONB DEFAULT '[]',         -- [{"id": "1", "image": "url", "title": "..."}]
  show_gradient_overlay BOOLEAN DEFAULT true,
  
  -- Slider Ayarları
  autoplay BOOLEAN DEFAULT true,
  autoplay_speed INTEGER DEFAULT 5000,     -- Milisaniye
  
  -- İçerik (Sağ taraf)
  pre_title VARCHAR(255) DEFAULT 'SİZE ÖZEL DAİRELER',
  title VARCHAR(500) DEFAULT 'Size Özel Yaşam',
  highlight_word VARCHAR(100) DEFAULT 'MODERN YAŞAM',
  description TEXT,                         -- Açıklama metni (opsiyonel)
  
  -- Altın Rozet
  badge_text VARCHAR(50) DEFAULT '3+1',
  badge_subtext VARCHAR(100) DEFAULT 'DAİRELER',
  
  -- CTA Butonu
  primary_cta JSONB DEFAULT '{
    "text": "İNCELE",
    "link": "/projeler",
    "variant": "primary"
  }'::jsonb,
  
  secondary_cta JSONB DEFAULT '{
    "text": "",
    "link": "",
    "variant": "outline"
  }'::jsonb,
  
  -- İstatistikler (Hero altı) - Opsiyonel
  stats JSONB DEFAULT '[]'::jsonb,
  
  -- Meta
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Hero için RLS
ALTER TABLE hero_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read hero_sections" ON hero_sections
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage hero_sections" ON hero_sections
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- ============================================================
-- 3. ABOUT SECTION TABLOSU (Hakkımızda)
-- ============================================================

CREATE TABLE IF NOT EXISTS about_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  name VARCHAR(100) NOT NULL DEFAULT 'Hakkımızda',
  is_active BOOLEAN DEFAULT true,
  
  -- Sol: Görsel
  image_url TEXT,                           -- Ana görsel (R2)
  image_caption VARCHAR(255),               -- Görsel alt yazısı
  
  -- Deneyim Rozeti (Görsel üzerinde)
  experience_badge JSONB DEFAULT '{
    "years": 15,
    "text": "Yıllık Tecrübe"
  }'::jsonb,
  
  -- Sağ: İçerik
  pre_title VARCHAR(100) DEFAULT 'Bizi Tanıyın',
  title VARCHAR(255) NOT NULL DEFAULT 'Aklar İnşaat',
  highlight_word VARCHAR(100),              -- "Güven" veya "Kalite"
  description TEXT,                         -- Ana açıklama (rich text)
  
  -- Özellikler Grid (2x2 veya 1x4)
  features JSONB DEFAULT '[
    {
      "icon": "Shield",
      "title": "Güvenilirlik",
      "description": "20 yılı aşkın tecrübemizle her projemizde güvence sunuyoruz."
    },
    {
      "icon": "Award",
      "title": "Kalite",
      "description": "En yüksek kalite standartlarında inşaat yapıyoruz."
    },
    {
      "icon": "Clock",
      "title": "Zamanında Teslim",
      "description": "Projelerimizi söz verdiğimiz tarihte teslim ediyoruz."
    },
    {
      "icon": "Heart",
      "title": "Müşteri Memnuniyeti",
      "description": "Mutlu müşterilerimiz bizim en büyük referansımızdır."
    }
  ]'::jsonb,
  
  -- CTA
  cta_text VARCHAR(100) DEFAULT 'Daha Fazla Bilgi',
  cta_link VARCHAR(255) DEFAULT '/kurumsal',
  
  -- Meta
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- About için RLS
ALTER TABLE about_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read about_sections" ON about_sections
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage about_sections" ON about_sections
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- ============================================================
-- 4. VIDEO SECTION TABLOSU
-- ============================================================

CREATE TABLE IF NOT EXISTS video_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  name VARCHAR(100) NOT NULL DEFAULT 'Tanıtım Videosu',
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  
  -- Arka Plan (Poster)
  background_image TEXT NOT NULL,           -- Kapak görseli (R2)
  
  -- Video Bilgileri
  video_type VARCHAR(20) DEFAULT 'youtube' 
    CHECK (video_type IN ('youtube', 'vimeo', 'self_hosted')),
  video_url TEXT,                           -- Direct URL (self_hosted için)
  video_id VARCHAR(100),                    -- YouTube/Vimeo ID
  
  -- Overlay İçerik (Opsiyonel)
  title VARCHAR(255),                       -- "Hayalinizdeki Yaşam"
  description TEXT,                         -- Kısa açıklama
  play_button_text VARCHAR(100) DEFAULT 'Videoyu İzle',
  
  -- Otomatik Oynatma (Lightbox açıldığında)
  autoplay BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video için RLS
ALTER TABLE video_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read video_sections" ON video_sections
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage video_sections" ON video_sections
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- ============================================================
-- 5. INFO CARDS TABLOSU (İstatistik Kartları)
-- ============================================================

CREATE TABLE IF NOT EXISTS info_cards_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  name VARCHAR(100) NOT NULL DEFAULT 'İstatistikler',
  is_active BOOLEAN DEFAULT true,
  
  -- Section Header
  pre_title VARCHAR(100) DEFAULT 'Rakamlarla Biz',
  title VARCHAR(255) DEFAULT 'Başarı Hikayemiz',
  description TEXT,
  
  -- Carousel Ayarları
  autoplay BOOLEAN DEFAULT true,
  autoplay_speed INTEGER DEFAULT 4000,      -- Milisaniye
  show_arrows BOOLEAN DEFAULT true,
  show_dots BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS info_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID REFERENCES info_cards_sections(id) ON DELETE CASCADE,
  
  -- Kart İçeriği
  icon VARCHAR(50) NOT NULL DEFAULT 'Building',  -- Lucide icon adı
  title VARCHAR(255) NOT NULL,                   -- "Tamamlanan Proje"
  value VARCHAR(100) NOT NULL,                   -- "50" veya "1000"
  suffix VARCHAR(20),                            -- "+", "%", "m²"
  
  -- Animasyon
  animation_type VARCHAR(20) DEFAULT 'countUp' 
    CHECK (animation_type IN ('countUp', 'static')),
  target_number INTEGER,                         -- countUp için hedef sayı
  
  -- Sıralama
  order_index INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Info Cards için RLS
ALTER TABLE info_cards_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE info_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read info_cards_sections" ON info_cards_sections
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage info_cards_sections" ON info_cards_sections
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can read info_cards" ON info_cards
  FOR SELECT TO anon, authenticated;

CREATE POLICY "Admins can manage info_cards" ON info_cards
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- ============================================================
-- 6. FOOTER TABLOSU
-- ============================================================

CREATE TABLE IF NOT EXISTS footer_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  is_active BOOLEAN DEFAULT true,
  
  -- Column 1: Brand
  logo_url TEXT,                            -- Logo (R2)
  description TEXT,                         -- Şirket açıklaması
  
  -- Sosyal Medya
  social_links JSONB DEFAULT '[
    {"platform": "facebook", "url": "https://facebook.com/aklarinsaat"},
    {"platform": "instagram", "url": "https://instagram.com/aklarinsaat"},
    {"platform": "linkedin", "url": "https://linkedin.com/company/aklarinsaat"}
  ]'::jsonb,
  
  -- Column 2: Quick Links
  quick_links JSONB DEFAULT '[
    {"label": "Ana Sayfa", "url": "/"},
    {"label": "Kurumsal", "url": "/kurumsal"},
    {"label": "Projeler", "url": "/projeler"},
    {"label": "İletişim", "url": "/iletisim"}
  ]'::jsonb,
  
  -- Column 4: İletişim
  contact_info JSONB DEFAULT '{
    "address": "Örnek Mah. Örnek Cad. No:1 İstanbul",
    "phone": "+90 212 123 45 67",
    "email": "info@aklarinsaat.com",
    "working_hours": "Pzt-Cum: 09:00 - 18:00"
  }'::jsonb,
  
  -- Bottom Bar
  copyright_text VARCHAR(255) DEFAULT '© 2024 Aklar İnşaat. Tüm hakları saklıdır.',
  legal_links JSONB DEFAULT '[
    {"label": "Gizlilik Politikası", "url": "/gizlilik"},
    {"label": "KVKK", "url": "/kvkk"}
  ]'::jsonb,
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Footer için RLS
ALTER TABLE footer_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read footer_settings" ON footer_settings
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage footer_settings" ON footer_settings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- ============================================================
-- 7. SITE SETTINGS (Genel Ayarlar)
-- ============================================================

CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  -- Site Bilgileri
  site_name VARCHAR(255) DEFAULT 'Aklar İnşaat',
  site_tagline VARCHAR(500) DEFAULT 'Kaliteli ve Modern Konut Projeleri',
  
  -- SEO Defaults
  default_meta_title VARCHAR(255),
  default_meta_description TEXT,
  
  -- İletişim (Genel)
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  contact_address TEXT,
  
  -- Sosyal Medya (Genel)
  social_facebook TEXT,
  social_instagram TEXT,
  social_linkedin TEXT,
  social_twitter TEXT,
  social_youtube TEXT,
  
  -- Analytics
  google_analytics_id VARCHAR(50),
  
  -- Bakım Modu
  maintenance_mode BOOLEAN DEFAULT false,
  maintenance_message TEXT DEFAULT 'Sitemiz bakımdadır. Kısa süre içinde döneceğiz.',
  
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sadece bir satır olmalı (singleton pattern)
CREATE UNIQUE INDEX IF NOT EXISTS site_settings_singleton ON site_settings ((true));

-- Site Settings için RLS
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read site_settings" ON site_settings
  FOR SELECT TO anon, authenticated;

CREATE POLICY "Admins can manage site_settings" ON site_settings
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- ============================================================
-- 8. TRIGGER'LAR
-- ============================================================

-- Hero sections updated_at
CREATE TRIGGER IF NOT EXISTS update_hero_sections_updated_at 
  BEFORE UPDATE ON hero_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- About sections updated_at
CREATE TRIGGER IF NOT EXISTS update_about_sections_updated_at 
  BEFORE UPDATE ON about_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Video sections updated_at
CREATE TRIGGER IF NOT EXISTS update_video_sections_updated_at 
  BEFORE UPDATE ON video_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Info cards sections updated_at
CREATE TRIGGER IF NOT EXISTS update_info_cards_sections_updated_at 
  BEFORE UPDATE ON info_cards_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Footer settings updated_at
CREATE TRIGGER IF NOT EXISTS update_footer_settings_updated_at 
  BEFORE UPDATE ON footer_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Site settings updated_at
CREATE TRIGGER IF NOT EXISTS update_site_settings_updated_at 
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 9. DEFAULT VERİLER
-- ============================================================

-- Varsayılan Hero Section
INSERT INTO hero_sections (
  name, title, highlight_word, pre_title, description,
  background_image, stats
) VALUES (
  'Ana Sayfa Hero',
  'Hayalinizdeki Eve',
  'Adım Atın',
  '2005''TEN BERİ',
  '20 yılı aşkın tecrübemizle, modern ve konforlu yaşam alanları inşa ediyoruz. Aklar İnşaat güvencesiyle hayalinizdeki eve kavuşun.',
  '/images/hero-bg.jpg',
  '[
    {"label": "Tamamlanan Proje", "value": "50+"},
    {"label": "Yıllık Deneyim", "value": "15+"},
    {"label": "Mutlu Müşteri", "value": "1000+"}
  ]'::jsonb
) ON CONFLICT DO NOTHING;

-- Varsayılan About Section
INSERT INTO about_sections (
  title, highlight_word, description, image_url
) VALUES (
  'Aklar İnşaat',
  'Güven',
  'Aklar İnşaat olarak, 2005 yılından bu yana kaliteli ve modern konut projeleri üretiyoruz. Müşteri memnuniyetini ön planda tutarak, her projemizde estetik ve fonksiyonelliği bir araya getiriyoruz.',
  '/images/about-building.jpg'
) ON CONFLICT DO NOTHING;

-- Varsayılan Video Section
INSERT INTO video_sections (
  name, background_image, video_type, video_id, title, description
) VALUES (
  'Tanıtım Videosu',
  '/images/video-poster.jpg',
  'youtube',
  'dQw4w9WgXcQ',
  'Hayalinizdeki Yaşam',
  'Aklar İnşaat projelerini keşfedin'
) ON CONFLICT DO NOTHING;

-- Varsayılan Info Cards Section
INSERT INTO info_cards_sections (title, description)
VALUES (
  'Rakamlarla Biz',
  'Aklar İnşaat''ın başarı hikayesi rakamlarla daha da anlamlı'
) ON CONFLICT DO NOTHING;

-- Varsayılan Info Cards
INSERT INTO info_cards (section_id, icon, title, value, suffix, animation_type, target_number, order_index)
SELECT 
  id,
  'Building',
  'Tamamlanan Proje',
  '50',
  '+',
  'countUp',
  50,
  0
FROM info_cards_sections LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO info_cards (section_id, icon, title, value, suffix, animation_type, target_number, order_index)
SELECT 
  id,
  'Calendar',
  'Yıllık Deneyim',
  '15',
  '+',
  'countUp',
  15,
  1
FROM info_cards_sections LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO info_cards (section_id, icon, title, value, suffix, animation_type, target_number, order_index)
SELECT 
  id,
  'Users',
  'Mutlu Müşteri',
  '1000',
  '+',
  'countUp',
  1000,
  2
FROM info_cards_sections LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO info_cards (section_id, icon, title, value, suffix, animation_type, target_number, order_index)
SELECT 
  id,
  'Award',
  'Memnuniyet Oranı',
  '98',
  '%',
  'countUp',
  98,
  3
FROM info_cards_sections LIMIT 1
ON CONFLICT DO NOTHING;

-- Varsayılan Footer
INSERT INTO footer_settings (description)
VALUES (
  'Aklar İnşaat olarak, 2005 yılından bu yana kaliteli ve modern konut projeleri üretiyoruz.'
) ON CONFLICT DO NOTHING;

-- Varsayılan Site Settings
INSERT INTO site_settings (site_name)
VALUES ('Aklar İnşaat')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 10. PROJECTS TABLOSU GÜNCELLEMESİ
-- ============================================================

-- Projeler için slug ekle (SEO dostu URL'ler)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS slug VARCHAR(255) UNIQUE;

-- Featured image için ayrı kolon
ALTER TABLE projects ADD COLUMN IF NOT EXISTS featured_image TEXT;

-- Öne çıkarma sırası
ALTER TABLE projects ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- Detaylı açıklama (rich text)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS detailed_description TEXT;

-- Proje özellikleri (JSON)
ALTER TABLE projects ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '[]';
-- Örnek: [{"icon": "Bed", "label": "Oda", "value": "3+1"}, {"icon": "Maximize", "label": "Alan", "value": "150 m²"}]

-- Harita koordinatları
ALTER TABLE projects ADD COLUMN IF NOT EXISTS map_lat DECIMAL(10, 8);
ALTER TABLE projects ADD COLUMN IF NOT EXISTS map_lng DECIMAL(11, 8);

-- Slug otomatik oluşturma (basit versiyon)
CREATE OR REPLACE FUNCTION generate_slug()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug IS NULL OR NEW.slug = '' THEN
    NEW.slug = LOWER(REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_project_slug ON projects;
CREATE TRIGGER set_project_slug
  BEFORE INSERT OR UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION generate_slug();

-- ============================================================
-- 11. INDEXLER (Performans)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_is_published ON pages(is_published);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_is_published ON projects(is_published);
CREATE INDEX IF NOT EXISTS idx_projects_is_featured ON projects(is_featured);
CREATE INDEX IF NOT EXISTS idx_project_images_project_id ON project_images(project_id);
CREATE INDEX IF NOT EXISTS idx_info_cards_section_id ON info_cards(section_id);
CREATE INDEX IF NOT EXISTS idx_hero_sections_is_active ON hero_sections(is_active);
CREATE INDEX IF NOT EXISTS idx_about_sections_is_active ON about_sections(is_active);
CREATE INDEX IF NOT EXISTS idx_video_sections_is_active ON video_sections(is_active);

-- ============================================================
-- TAMAMLANDI
-- ============================================================
