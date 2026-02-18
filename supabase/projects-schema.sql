-- =====================================================
-- PROJE DETAY SAYFASI SCHEMA
-- Next.js 15 + Supabase + Cloudflare R2
-- =====================================================

-- ─────────────────────────────────────────
-- 1. PROJELER TABLOSU
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS projects (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug            TEXT UNIQUE NOT NULL,

  -- BÖLÜM 1: Proje Hakkında
  name            TEXT NOT NULL,
  about_text      TEXT,              -- Tanıtım paragrafı
  about_image_url TEXT,              -- Sol taraf büyük görsel (R2 URL)
  cta_text        TEXT DEFAULT 'Devamı',
  
  -- BÖLÜM 4: Proje Konumu
  location_image_url    TEXT,        -- Sol taraf konum görseli (R2 URL)
  apartment_options     TEXT,        -- "3+1 130 – 2+1 90 M2 DAİRE SEÇENEKLERİ"
  neighborhood          TEXT,        -- "ŞAHİNCİLİ MAHALLESİ"
  location_description  TEXT,        -- Uzun konum açıklaması

  -- Durum
  status          TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft', 'published', 'archived')),
  sort_order      INT DEFAULT 0,
  is_featured     BOOLEAN DEFAULT false,

  -- SEO
  meta_title      TEXT,
  meta_desc       TEXT,
  og_image_url    TEXT,

  -- Meta
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  created_by      UUID REFERENCES auth.users(id)
);

-- ─────────────────────────────────────────
-- 2. MEDYA TABLOSU (BÖLÜM 2-3-4)
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS project_media (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- R2 URL bilgileri
  r2_key      TEXT NOT NULL,         -- projects/{project_id}/exterior/abc123.webp
  url         TEXT NOT NULL,         -- https://cdn.domain.com/... (public URL)
  thumb_url   TEXT,                  -- Thumbnail versiyonu

  -- Kategori
  category    TEXT NOT NULL
              CHECK (category IN (
                'about',             -- Bölüm 1 ana görsel
                'exterior',          -- Bölüm 2: Dış Mekan
                'interior',          -- Bölüm 3: İç Mekan
                'location'           -- Bölüm 4 konum görseli
              )),

  -- Metadata
  alt_text    TEXT,
  file_name   TEXT,
  file_size   INT,
  width       INT,
  height      INT,
  sort_order  SMALLINT DEFAULT 0,

  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 3. LEAD FORMLARI
-- ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS project_leads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id  UUID NOT NULL REFERENCES projects(id),

  full_name   TEXT NOT NULL,
  phone       TEXT NOT NULL,
  email       TEXT,
  message     TEXT,

  status      TEXT DEFAULT 'new'
              CHECK (status IN ('new','contacted','interested','not_interested','sold')),
  notes       TEXT,

  -- UTM & tracking
  utm_source  TEXT,
  utm_medium  TEXT,
  page_url    TEXT,

  kvkk_consent    BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─────────────────────────────────────────
-- 4. İNDEKSLER
-- ─────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_projects_slug 
    ON projects(slug) 
    WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_projects_status 
    ON projects(status, sort_order);

CREATE INDEX IF NOT EXISTS idx_media_project 
    ON project_media(project_id, category, sort_order);

CREATE INDEX IF NOT EXISTS idx_leads_project 
    ON project_leads(project_id, created_at DESC);

-- ─────────────────────────────────────────
-- 5. AUTO-UPDATE updated_at
-- ─────────────────────────────────────────

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS trg_projects_updated_at ON projects;
CREATE TRIGGER trg_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_project_leads_updated_at ON project_leads;
CREATE TRIGGER trg_project_leads_updated_at
    BEFORE UPDATE ON project_leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ─────────────────────────────────────────
-- 6. ROW LEVEL SECURITY
-- ─────────────────────────────────────────

-- Projects: Public okuma (sadece published), admin tam yetki
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public published projects" ON projects;
CREATE POLICY "Public published projects"
    ON projects FOR SELECT
    USING (status = 'published');

DROP POLICY IF EXISTS "Admin full access projects" ON projects;
CREATE POLICY "Admin full access projects"
    ON projects FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Media: Public okuma, admin tam yetki
ALTER TABLE project_media ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public media read" ON project_media;
CREATE POLICY "Public media read"
    ON project_media FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM projects p
        WHERE p.id = project_id AND p.status = 'published'
    ));

DROP POLICY IF EXISTS "Admin media full access" ON project_media;
CREATE POLICY "Admin media full access"
    ON project_media FOR ALL
    USING (auth.role() = 'authenticated');

-- Leads: Sadece admin okuyabilir, herkes kaydedebilir
ALTER TABLE project_leads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert lead" ON project_leads;
CREATE POLICY "Anyone can insert lead"
    ON project_leads FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Admin reads leads" ON project_leads;
CREATE POLICY "Admin reads leads"
    ON project_leads FOR SELECT
    USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Admin updates leads" ON project_leads;
CREATE POLICY "Admin updates leads"
    ON project_leads FOR UPDATE
    USING (auth.role() = 'authenticated');

-- ─────────────────────────────────────────
-- 7. FONKSİYONLAR
-- ─────────────────────────────────────────

-- Projeyi slug ile getir (public)
CREATE OR REPLACE FUNCTION get_project_by_slug(p_slug TEXT)
RETURNS jsonb AS $$
DECLARE
    project_record RECORD;
    media_json jsonb;
BEGIN
    SELECT * INTO project_record 
    FROM projects 
    WHERE slug = p_slug AND status = 'published';
    
    IF NOT FOUND THEN
        RETURN NULL;
    END IF;
    
    -- Medyaları grupla
    SELECT jsonb_object_agg(
        category,
        jsonb_agg(
            jsonb_build_object(
                'id', id,
                'url', url,
                'thumb_url', thumb_url,
                'alt_text', alt_text,
                'sort_order', sort_order
            ) ORDER BY sort_order
        )
    ) INTO media_json
    FROM project_media
    WHERE project_id = project_record.id;
    
    RETURN jsonb_build_object(
        'id', project_record.id,
        'slug', project_record.slug,
        'name', project_record.name,
        'about_text', project_record.about_text,
        'about_image_url', project_record.about_image_url,
        'cta_text', project_record.cta_text,
        'location_image_url', project_record.location_image_url,
        'apartment_options', project_record.apartment_options,
        'neighborhood', project_record.neighborhood,
        'location_description', project_record.location_description,
        'meta_title', project_record.meta_title,
        'meta_desc', project_record.meta_desc,
        'og_image_url', project_record.og_image_url,
        'media', COALESCE(media_json, '{}'::jsonb)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Tüm projeleri listele (public)
CREATE OR REPLACE FUNCTION get_all_projects()
RETURNS jsonb AS $$
DECLARE
    result jsonb;
BEGIN
    SELECT jsonb_agg(
        jsonb_build_object(
            'id', id,
            'slug', slug,
            'name', name,
            'about_image_url', about_image_url,
            'is_featured', is_featured
        ) ORDER BY sort_order, created_at DESC
    ) INTO result
    FROM projects 
    WHERE status = 'published';
    
    RETURN COALESCE(result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Varsayılan örnek proje (test için)
INSERT INTO projects (
    slug,
    name,
    about_text,
    about_image_url,
    cta_text,
    location_image_url,
    apartment_options,
    neighborhood,
    location_description,
    status,
    is_featured,
    meta_title,
    meta_desc
) VALUES (
    'ornek-proje',
    'Örnek Proje',
    '%50 PEŞİN KALANI 12-24 AY 0 VADE FARKSIZ 12-24 AY TAKSİT SEÇENEKLERİ İLE KREDİ KULLANMADAN ÖDEME İMKANI DAİREMİZ BOŞ OLUP, KİRACI DERDİ YOKTUR. ŞAHİNCİLİ TAKSİ DURAĞIYANINDA IHLAMUR VADİSİNİN 50 MT. ÜSTÜNDE KAÇIRILMAYACAK SATILIK DAİREMİZ PAMUKLAR MAHALLESİNDE HASTANE VE 4 LEVENT METRO YANINDA 2+1 SATILIK DAİRE...',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
    'Devamı',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
    '3+1 130 – 2+1 90 M2 DAİRE SEÇENEKLERİ',
    'ŞAHİNCİLİ MAHALLESİ',
    'ŞAHİNCİLİ TAKSİ DURAĞIYANINDA IHLAMUR VADİSİNİN 50 MT. ÜSTÜNDE KAÇIRILMAYACAK SATILIK DAİREMİZ. PAMUKLAR MAHALLESİNDE HASTANE VE 4 LEVENT METRO YANINDA. 2+1 SATILIK DAİRE.',
    'published',
    true,
    'Örnek Proje | Aklar İnşaat',
    'Aklar İnşaat güvencesiyle örnek projemizi keşfedin. Modern yaşam alanları, geniş daire seçenekleri ve ayrıcalıklı konum.'
)
ON CONFLICT (slug) DO NOTHING;
