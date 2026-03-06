-- =====================================================
-- Setup remaining tables for admin panel
-- Safe to run multiple times
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1) Core tables
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  content_json JSONB DEFAULT NULL,
  content_type VARCHAR(20) DEFAULT 'html' CHECK (content_type IN ('html', 'json', 'markdown')),
  meta_title VARCHAR(255),
  meta_description TEXT,
  is_published BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.project_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_type VARCHAR(50) NOT NULL CHECK (image_type IN ('exterior', 'interior', 'location')),
  caption VARCHAR(255),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2) Home/admin content tables
CREATE TABLE IF NOT EXISTS public.hero_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  desktop_image TEXT,
  mobile_image TEXT,
  title TEXT,
  subtitle TEXT,
  button_text TEXT,
  button_link TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.hero_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL DEFAULT 'Ana Sayfa Hero',
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  background_type VARCHAR(20) DEFAULT 'image' CHECK (background_type IN ('image', 'video', 'slider')),
  background_image TEXT,
  background_video TEXT,
  slider_images JSONB DEFAULT '[]'::jsonb,
  show_gradient_overlay BOOLEAN DEFAULT true,
  autoplay BOOLEAN DEFAULT true,
  autoplay_speed INTEGER DEFAULT 5000,
  pre_title VARCHAR(255) DEFAULT 'SIZE OZEL DAIRELER',
  title VARCHAR(500) DEFAULT 'Size Ozel Yasam',
  highlight_word VARCHAR(100) DEFAULT 'MODERN YASAM',
  description TEXT,
  badge_text VARCHAR(50) DEFAULT '3+1',
  badge_subtext VARCHAR(100) DEFAULT 'DAIRELER',
  primary_cta JSONB DEFAULT '{"text":"INCELE","link":"/projeler","variant":"primary"}'::jsonb,
  secondary_cta JSONB DEFAULT '{"text":"","link":"","variant":"outline"}'::jsonb,
  stats JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.about_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL DEFAULT 'Hakkimizda',
  is_active BOOLEAN DEFAULT true,
  image_url TEXT,
  image_caption VARCHAR(255),
  experience_badge JSONB DEFAULT '{"years":15,"text":"Yillik Tecrube"}'::jsonb,
  pre_title VARCHAR(100) DEFAULT 'Bizi Taniyin',
  title VARCHAR(255) NOT NULL DEFAULT 'Aklar Insaat',
  highlight_word VARCHAR(100),
  description TEXT,
  features JSONB DEFAULT '[]'::jsonb,
  cta_text VARCHAR(100) DEFAULT 'Daha Fazla Bilgi',
  cta_link VARCHAR(255) DEFAULT '/kurumsal',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.video_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL DEFAULT 'Tanitim Videosu',
  is_active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  background_image TEXT,
  video_type VARCHAR(20) DEFAULT 'youtube' CHECK (video_type IN ('youtube', 'vimeo', 'self_hosted')),
  video_url TEXT,
  video_id VARCHAR(100),
  title VARCHAR(255),
  description TEXT,
  play_button_text VARCHAR(100) DEFAULT 'Videoyu Izle',
  autoplay BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.info_cards_sections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL DEFAULT 'Istatistikler',
  is_active BOOLEAN DEFAULT true,
  pre_title VARCHAR(100) DEFAULT 'Rakamlarla Biz',
  title VARCHAR(255) DEFAULT 'Basari Hikayemiz',
  description TEXT,
  autoplay BOOLEAN DEFAULT true,
  autoplay_speed INTEGER DEFAULT 4000,
  show_arrows BOOLEAN DEFAULT true,
  show_dots BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.info_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_id UUID REFERENCES public.info_cards_sections(id) ON DELETE CASCADE,
  icon VARCHAR(50) NOT NULL DEFAULT 'Building',
  title VARCHAR(255) NOT NULL,
  value VARCHAR(100) NOT NULL,
  suffix VARCHAR(20),
  animation_type VARCHAR(20) DEFAULT 'countUp' CHECK (animation_type IN ('countUp', 'static')),
  target_number INTEGER,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.footer_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_active BOOLEAN DEFAULT true,
  logo_url TEXT,
  description TEXT,
  social_links JSONB DEFAULT '[]'::jsonb,
  quick_links JSONB DEFAULT '[]'::jsonb,
  contact_info JSONB DEFAULT '{}'::jsonb,
  copyright_text VARCHAR(255) DEFAULT '© Aklar Insaat. Tum haklari saklidir.',
  legal_links JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.whatsapp_widget_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  position VARCHAR(20) NOT NULL DEFAULT 'bottom-right'
    CHECK (position IN ('bottom-right','bottom-left','top-right','top-left')),
  button_color VARCHAR(7) NOT NULL DEFAULT '#25D366',
  button_size SMALLINT NOT NULL DEFAULT 60 CHECK (button_size BETWEEN 40 AND 80),
  show_tooltip BOOLEAN NOT NULL DEFAULT true,
  tooltip_text VARCHAR(100) DEFAULT 'Bize yazin!',
  pulse_animation BOOLEAN NOT NULL DEFAULT true,
  show_delay_ms INT NOT NULL DEFAULT 2000 CHECK (show_delay_ms BETWEEN 0 AND 30000),
  show_on_mobile BOOLEAN NOT NULL DEFAULT true,
  show_on_desktop BOOLEAN NOT NULL DEFAULT true,
  hidden_url_patterns TEXT[] DEFAULT ARRAY['/checkout', '/cart', '/admin'],
  default_message VARCHAR(300) DEFAULT 'Merhaba, bilgi almak istiyorum.',
  is_multi_agent BOOLEAN NOT NULL DEFAULT false,
  phone_number VARCHAR(20),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_phone_format CHECK (
    phone_number IS NULL OR phone_number ~ '^\+[1-9]\d{7,14}$'
  )
);

-- 3) Helpful defaults
INSERT INTO public.pages (slug, title, content, order_index) VALUES
  ('home', 'Ana Sayfa', '', 1),
  ('kurumsal', 'Kurumsal', '', 2),
  ('taahhut', 'Taahhut', '', 3),
  ('projeler', 'Projeler', '', 4),
  ('iletisim', 'Iletisim', '', 5)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.footer_settings (description)
SELECT 'Aklar Insaat olarak kaliteli ve modern konut projeleri uretiyoruz.'
WHERE NOT EXISTS (SELECT 1 FROM public.footer_settings);

INSERT INTO public.hero_sections (name)
SELECT 'Ana Sayfa Hero'
WHERE NOT EXISTS (SELECT 1 FROM public.hero_sections);

INSERT INTO public.about_sections (name)
SELECT 'Hakkimizda'
WHERE NOT EXISTS (SELECT 1 FROM public.about_sections);

INSERT INTO public.video_sections (name)
SELECT 'Tanitim Videosu'
WHERE NOT EXISTS (SELECT 1 FROM public.video_sections);

INSERT INTO public.info_cards_sections (name)
SELECT 'Istatistikler'
WHERE NOT EXISTS (SELECT 1 FROM public.info_cards_sections);

INSERT INTO public.whatsapp_widget_config (phone_number)
SELECT '+905000000000'
WHERE NOT EXISTS (SELECT 1 FROM public.whatsapp_widget_config);

-- 4) Triggers
DROP TRIGGER IF EXISTS trg_pages_updated_at ON public.pages;
CREATE TRIGGER trg_pages_updated_at
  BEFORE UPDATE ON public.pages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_hero_banners_updated_at ON public.hero_banners;
CREATE TRIGGER trg_hero_banners_updated_at
  BEFORE UPDATE ON public.hero_banners
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_hero_sections_updated_at ON public.hero_sections;
CREATE TRIGGER trg_hero_sections_updated_at
  BEFORE UPDATE ON public.hero_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_about_sections_updated_at ON public.about_sections;
CREATE TRIGGER trg_about_sections_updated_at
  BEFORE UPDATE ON public.about_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_video_sections_updated_at ON public.video_sections;
CREATE TRIGGER trg_video_sections_updated_at
  BEFORE UPDATE ON public.video_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_info_cards_sections_updated_at ON public.info_cards_sections;
CREATE TRIGGER trg_info_cards_sections_updated_at
  BEFORE UPDATE ON public.info_cards_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_footer_settings_updated_at ON public.footer_settings;
CREATE TRIGGER trg_footer_settings_updated_at
  BEFORE UPDATE ON public.footer_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_whatsapp_widget_config_updated_at ON public.whatsapp_widget_config;
CREATE TRIGGER trg_whatsapp_widget_config_updated_at
  BEFORE UPDATE ON public.whatsapp_widget_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5) RLS
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hero_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.info_cards_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.info_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.footer_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_widget_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin users select" ON public.admin_users;
DROP POLICY IF EXISTS "Admin users insert" ON public.admin_users;
CREATE POLICY "Admin users select" ON public.admin_users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admin users insert" ON public.admin_users FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read pages" ON public.pages;
DROP POLICY IF EXISTS "Admins can manage pages" ON public.pages;
CREATE POLICY "Public can read pages" ON public.pages FOR SELECT TO anon, authenticated USING (is_published = true);
CREATE POLICY "Admins can manage pages" ON public.pages FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read project images" ON public.project_images;
DROP POLICY IF EXISTS "Admins can manage project images" ON public.project_images;
CREATE POLICY "Public can read project images" ON public.project_images FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage project images" ON public.project_images FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can insert contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can read contact messages" ON public.contact_messages;
DROP POLICY IF EXISTS "Admins can delete contact messages" ON public.contact_messages;
CREATE POLICY "Anyone can insert contact messages" ON public.contact_messages FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins can read contact messages" ON public.contact_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can delete contact messages" ON public.contact_messages FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS "Public read hero_banners" ON public.hero_banners;
DROP POLICY IF EXISTS "Admin manage hero_banners" ON public.hero_banners;
CREATE POLICY "Public read hero_banners" ON public.hero_banners FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admin manage hero_banners" ON public.hero_banners FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read hero_sections" ON public.hero_sections;
DROP POLICY IF EXISTS "Admins can manage hero_sections" ON public.hero_sections;
CREATE POLICY "Public can read hero_sections" ON public.hero_sections FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins can manage hero_sections" ON public.hero_sections FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read about_sections" ON public.about_sections;
DROP POLICY IF EXISTS "Admins can manage about_sections" ON public.about_sections;
CREATE POLICY "Public can read about_sections" ON public.about_sections FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins can manage about_sections" ON public.about_sections FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read video_sections" ON public.video_sections;
DROP POLICY IF EXISTS "Admins can manage video_sections" ON public.video_sections;
CREATE POLICY "Public can read video_sections" ON public.video_sections FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins can manage video_sections" ON public.video_sections FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read info_cards_sections" ON public.info_cards_sections;
DROP POLICY IF EXISTS "Admins can manage info_cards_sections" ON public.info_cards_sections;
CREATE POLICY "Public can read info_cards_sections" ON public.info_cards_sections FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins can manage info_cards_sections" ON public.info_cards_sections FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read info_cards" ON public.info_cards;
DROP POLICY IF EXISTS "Admins can manage info_cards" ON public.info_cards;
CREATE POLICY "Public can read info_cards" ON public.info_cards FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage info_cards" ON public.info_cards FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read footer_settings" ON public.footer_settings;
DROP POLICY IF EXISTS "Admins can manage footer_settings" ON public.footer_settings;
CREATE POLICY "Public can read footer_settings" ON public.footer_settings FOR SELECT TO anon, authenticated USING (is_active = true);
CREATE POLICY "Admins can manage footer_settings" ON public.footer_settings FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can read whatsapp_widget_config" ON public.whatsapp_widget_config;
DROP POLICY IF EXISTS "Admins can manage whatsapp_widget_config" ON public.whatsapp_widget_config;
CREATE POLICY "Public can read whatsapp_widget_config" ON public.whatsapp_widget_config FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins can manage whatsapp_widget_config" ON public.whatsapp_widget_config FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 6) Grants + refresh schema cache
GRANT SELECT ON public.pages, public.project_images, public.contact_messages, public.hero_banners,
  public.hero_sections, public.about_sections, public.video_sections, public.info_cards_sections,
  public.info_cards, public.footer_settings, public.whatsapp_widget_config, public.admin_users TO anon;

GRANT ALL ON public.pages, public.project_images, public.contact_messages, public.hero_banners,
  public.hero_sections, public.about_sections, public.video_sections, public.info_cards_sections,
  public.info_cards, public.footer_settings, public.whatsapp_widget_config, public.admin_users TO authenticated;

NOTIFY pgrst, 'reload schema';

-- 7) Quick check
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'admin_users','pages','project_images','contact_messages','hero_banners','hero_sections',
    'about_sections','video_sections','info_cards_sections','info_cards','footer_settings',
    'whatsapp_widget_config','projects','project_media'
  )
ORDER BY table_name;
