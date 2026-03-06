-- ============================================================
-- AKLAR İNŞAAT - TAM KURULUM SQL DOSYASI
-- Bu dosya, yeni Supabase projesi için tüm tabloları,
-- ilişkileri, RLS politikalarını ve varsayılan verileri içerir
-- ============================================================

-- ============================================================
-- 1. TEMEL AYARLAR
-- ============================================================

-- UUID extension'ı etkinleştir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- updated_at kolonunu otomatik güncelleyen fonksiyon
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 2. ANA TABLOLAR
-- ============================================================

-- Admin kullanıcıları tablosu
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Sayfalar tablosu
CREATE TABLE IF NOT EXISTS pages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  content_json JSONB DEFAULT NULL,
  content_type VARCHAR(20) DEFAULT 'html' CHECK (content_type IN ('html', 'json', 'markdown')),
  meta_title VARCHAR(255),
  meta_description TEXT,
  is_published BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Projeler tablosu (Güncellenmiş yapı)
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  title VARCHAR(255),
  description TEXT,
  about_text TEXT,
  about_image_url TEXT,
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  project_status VARCHAR(50) DEFAULT 'ongoing' CHECK (project_status IN ('completed', 'ongoing')),
  location VARCHAR(255),
  neighborhood VARCHAR(255),
  location_description TEXT,
  completion_date DATE,
  cta_text VARCHAR(255) DEFAULT 'Detayları Gör',
  apartment_options TEXT,
  is_published BOOLEAN DEFAULT false,
  is_featured BOOLEAN DEFAULT false,
  meta_title VARCHAR(255),
  meta_desc TEXT,
  sort_order INTEGER DEFAULT 0,
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Proje görselleri (eski yapı - geriye uyumluluk için)
CREATE TABLE IF NOT EXISTS project_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_type VARCHAR(50) NOT NULL CHECK (image_type IN ('exterior', 'interior', 'location')),
  caption VARCHAR(255),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Proje medya (yeni yapı - API için)
CREATE TABLE IF NOT EXISTS project_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('about', 'exterior', 'interior', 'location')),
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- İletişim mesajları tablosu
CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 3. FRONTEND BÖLÜM TABLOLARI
-- ============================================================

-- Hero Section tablosu
CREATE TABLE IF NOT EXISTS hero_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL DEFAULT 'Ana Sayfa Hero',
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  background_type VARCHAR(20) DEFAULT 'image' CHECK (background_type IN ('image', 'video', 'slider')),
  background_image TEXT,
  background_video TEXT,
  slider_images JSONB DEFAULT '[]',
  show_gradient_overlay BOOLEAN DEFAULT true,
  autoplay BOOLEAN DEFAULT true,
  autoplay_speed INTEGER DEFAULT 5000,
  pre_title VARCHAR(255) DEFAULT 'SİZE ÖZEL DAİRELER',
  title VARCHAR(500) DEFAULT 'Size Özel Yaşam',
  highlight_word VARCHAR(100) DEFAULT 'MODERN YAŞAM',
  description TEXT,
  badge_text VARCHAR(50) DEFAULT '3+1',
  badge_subtext VARCHAR(100) DEFAULT 'DAİRELER',
  primary_cta JSONB DEFAULT '{"text": "İNCELE", "link": "/projeler", "variant": "primary"}'::jsonb,
  secondary_cta JSONB DEFAULT '{"text": "", "link": "", "variant": "outline"}'::jsonb,
  stats JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- About Section tablosu
CREATE TABLE IF NOT EXISTS about_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL DEFAULT 'Hakkımızda',
  is_active BOOLEAN DEFAULT true,
  image_url TEXT,
  image_caption VARCHAR(255),
  experience_badge JSONB DEFAULT '{"years": 15, "text": "Yıllık Tecrübe"}'::jsonb,
  pre_title VARCHAR(100) DEFAULT 'Bizi Tanıyın',
  title VARCHAR(255) NOT NULL DEFAULT 'Aklar İnşaat',
  highlight_word VARCHAR(100),
  description TEXT,
  features JSONB DEFAULT '[
    {"icon": "Shield", "title": "Güvenilirlik", "description": "20 yılı aşkın tecrübemizle her projemizde güvence sunuyoruz."},
    {"icon": "Award", "title": "Kalite", "description": "En yüksek kalite standartlarında inşaat yapıyoruz."},
    {"icon": "Clock", "title": "Zamanında Teslim", "description": "Projelerimizi söz verdiğimiz tarihte teslim ediyoruz."},
    {"icon": "Heart", "title": "Müşteri Memnuniyeti", "description": "Mutlu müşterilerimiz bizim en büyük referansımızdır."}
  ]'::jsonb,
  cta_text VARCHAR(100) DEFAULT 'Daha Fazla Bilgi',
  cta_link VARCHAR(255) DEFAULT '/kurumsal',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Video Section tablosu
CREATE TABLE IF NOT EXISTS video_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL DEFAULT 'Tanıtım Videosu',
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  background_image TEXT,
  video_type VARCHAR(20) DEFAULT 'youtube' CHECK (video_type IN ('youtube', 'vimeo', 'self_hosted')),
  video_url TEXT,
  video_id VARCHAR(100),
  title VARCHAR(255),
  description TEXT,
  play_button_text VARCHAR(100) DEFAULT 'Videoyu İzle',
  autoplay BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Info Cards Section tablosu
CREATE TABLE IF NOT EXISTS info_cards_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL DEFAULT 'İstatistikler',
  is_active BOOLEAN DEFAULT true,
  pre_title VARCHAR(100) DEFAULT 'Rakamlarla Biz',
  title VARCHAR(255) DEFAULT 'Başarı Hikayemiz',
  description TEXT,
  autoplay BOOLEAN DEFAULT true,
  autoplay_speed INTEGER DEFAULT 4000,
  show_arrows BOOLEAN DEFAULT true,
  show_dots BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Info Cards tablosu
CREATE TABLE IF NOT EXISTS info_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID REFERENCES info_cards_sections(id) ON DELETE CASCADE,
  icon VARCHAR(50) NOT NULL DEFAULT 'Building',
  title VARCHAR(255) NOT NULL,
  value VARCHAR(100) NOT NULL,
  suffix VARCHAR(20),
  animation_type VARCHAR(20) DEFAULT 'countUp' CHECK (animation_type IN ('countUp', 'static')),
  target_number INTEGER,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Footer Settings tablosu
CREATE TABLE IF NOT EXISTS footer_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  is_active BOOLEAN DEFAULT true,
  logo_url TEXT,
  description TEXT,
  social_links JSONB DEFAULT '[
    {"platform": "facebook", "url": "https://facebook.com/aklarinsaat"},
    {"platform": "instagram", "url": "https://instagram.com/aklarinsaat"},
    {"platform": "linkedin", "url": "https://linkedin.com/company/aklarinsaat"}
  ]'::jsonb,
  quick_links JSONB DEFAULT '[
    {"label": "Ana Sayfa", "url": "/"},
    {"label": "Kurumsal", "url": "/kurumsal"},
    {"label": "Projeler", "url": "/projeler"},
    {"label": "İletişim", "url": "/iletisim"}
  ]'::jsonb,
  contact_info JSONB DEFAULT '{
    "address": "Örnek Mah. Örnek Cad. No:1 İstanbul",
    "phone": "+90 212 123 45 67",
    "email": "info@aklarinsaat.com",
    "working_hours": "Pzt-Cum: 09:00 - 18:00"
  }'::jsonb,
  copyright_text VARCHAR(255) DEFAULT '© 2024 Aklar İnşaat. Tüm hakları saklıdır.',
  legal_links JSONB DEFAULT '[
    {"label": "Gizlilik Politikası", "url": "/gizlilik"},
    {"label": "KVKK", "url": "/kvkk"}
  ]'::jsonb,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site Settings tablosu
CREATE TABLE IF NOT EXISTS site_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  site_name VARCHAR(255) DEFAULT 'Aklar İnşaat',
  site_tagline VARCHAR(500) DEFAULT 'Kaliteli ve Modern Konut Projeleri',
  default_meta_title VARCHAR(255),
  default_meta_description TEXT,
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  contact_address TEXT,
  social_facebook TEXT,
  social_instagram TEXT,
  social_linkedin TEXT,
  social_twitter TEXT,
  social_youtube TEXT,
  google_analytics_id VARCHAR(50),
  maintenance_mode BOOLEAN DEFAULT false,
  maintenance_message TEXT DEFAULT 'Sitemiz bakımdadır. Kısa süre içinde döneceğiz.',
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Singleton index (sadece 1 kayıt olmasını sağlar)
CREATE UNIQUE INDEX IF NOT EXISTS site_settings_singleton ON site_settings ((true));

-- ============================================================
-- 4. ROW LEVEL SECURITY (RLS) POLİTİKALARI
-- ============================================================

-- Admin Users RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage admin_users" ON admin_users
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users au2
      WHERE au2.user_id = auth.uid()
      AND au2.role = 'admin'
    )
  );

-- Pages RLS
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read pages" ON pages
  FOR SELECT TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Admins can manage pages" ON pages
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Projects RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read projects" ON projects
  FOR SELECT TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "Admins can manage projects" ON projects
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Project Images RLS
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read project images" ON project_images
  FOR SELECT TO anon, authenticated;

CREATE POLICY "Admins can manage project images" ON project_images
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Project Media RLS
ALTER TABLE project_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read project media" ON project_media
  FOR SELECT TO anon, authenticated;

CREATE POLICY "Admins can manage project media" ON project_media
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Contact Messages RLS
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert contact messages" ON contact_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read contact messages" ON contact_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can delete contact messages" ON contact_messages
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- Hero Sections RLS
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

-- About Sections RLS
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

-- Video Sections RLS
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

-- Info Cards Sections RLS
ALTER TABLE info_cards_sections ENABLE ROW LEVEL SECURITY;

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

-- Info Cards RLS
ALTER TABLE info_cards ENABLE ROW LEVEL SECURITY;

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

-- Footer Settings RLS
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

-- Site Settings RLS
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
-- 5. TRIGGER'LAR
-- ============================================================

-- Pages updated_at
CREATE TRIGGER IF NOT EXISTS update_pages_updated_at 
  BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Projects updated_at
CREATE TRIGGER IF NOT EXISTS update_projects_updated_at 
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Hero Sections updated_at
CREATE TRIGGER IF NOT EXISTS update_hero_sections_updated_at 
  BEFORE UPDATE ON hero_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- About Sections updated_at
CREATE TRIGGER IF NOT EXISTS update_about_sections_updated_at 
  BEFORE UPDATE ON about_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Video Sections updated_at
CREATE TRIGGER IF NOT EXISTS update_video_sections_updated_at 
  BEFORE UPDATE ON video_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Info Cards Sections updated_at
CREATE TRIGGER IF NOT EXISTS update_info_cards_sections_updated_at 
  BEFORE UPDATE ON info_cards_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Footer Settings updated_at
CREATE TRIGGER IF NOT EXISTS update_footer_settings_updated_at 
  BEFORE UPDATE ON footer_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Site Settings updated_at
CREATE TRIGGER IF NOT EXISTS update_site_settings_updated_at 
  BEFORE UPDATE ON site_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 6. İNDEKSLEME (PERFORMANS)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_pages_is_published ON pages(is_published);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_project_status ON projects(project_status);
CREATE INDEX IF NOT EXISTS idx_projects_is_published ON projects(is_published);
CREATE INDEX IF NOT EXISTS idx_projects_is_featured ON projects(is_featured);
CREATE INDEX IF NOT EXISTS idx_project_images_project_id ON project_images(project_id);
CREATE INDEX IF NOT EXISTS idx_project_media_project_id ON project_media(project_id);
CREATE INDEX IF NOT EXISTS idx_info_cards_section_id ON info_cards(section_id);
CREATE INDEX IF NOT EXISTS idx_hero_sections_is_active ON hero_sections(is_active);
CREATE INDEX IF NOT EXISTS idx_about_sections_is_active ON about_sections(is_active);
CREATE INDEX IF NOT EXISTS idx_video_sections_is_active ON video_sections(is_active);

-- ============================================================
-- 7. VARSAYILAN VERİLER
-- ============================================================

-- Varsayılan Sayfalar
INSERT INTO pages (slug, title, content, order_index) VALUES
  ('home', 'Ana Sayfa', '', 1),
  ('kurumsal', 'Kurumsal', '', 2),
  ('tahhut', 'Taahhüt', '', 3),
  ('projeler', 'Projeler', '', 4),
  ('iletisim', 'İletişim', '', 5)
ON CONFLICT (slug) DO NOTHING;

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
-- KURULUM TAMAMLANDI
-- ============================================================
