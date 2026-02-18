-- =====================================================
-- PROJE DETAY SAYFASI SCHEMA - FIX
-- Eğer tablo zaten varsa kolonları ekle
-- =====================================================

-- 1. Projects tablosuna eksik kolonları ekle (eğer yoksa)
DO $$
BEGIN
    -- slug kolonu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'slug') THEN
        ALTER TABLE projects ADD COLUMN slug TEXT UNIQUE;
    END IF;

    -- about_text kolonu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'about_text') THEN
        ALTER TABLE projects ADD COLUMN about_text TEXT;
    END IF;

    -- about_image_url kolonu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'about_image_url') THEN
        ALTER TABLE projects ADD COLUMN about_image_url TEXT;
    END IF;

    -- cta_text kolonu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'cta_text') THEN
        ALTER TABLE projects ADD COLUMN cta_text TEXT DEFAULT 'Devamı';
    END IF;

    -- location_image_url kolonu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'location_image_url') THEN
        ALTER TABLE projects ADD COLUMN location_image_url TEXT;
    END IF;

    -- apartment_options kolonu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'apartment_options') THEN
        ALTER TABLE projects ADD COLUMN apartment_options TEXT;
    END IF;

    -- neighborhood kolonu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'neighborhood') THEN
        ALTER TABLE projects ADD COLUMN neighborhood TEXT;
    END IF;

    -- location_description kolonu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'location_description') THEN
        ALTER TABLE projects ADD COLUMN location_description TEXT;
    END IF;

    -- is_featured kolonu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'is_featured') THEN
        ALTER TABLE projects ADD COLUMN is_featured BOOLEAN DEFAULT false;
    END IF;

    -- meta_title kolonu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'meta_title') THEN
        ALTER TABLE projects ADD COLUMN meta_title TEXT;
    END IF;

    -- meta_desc kolonu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'meta_desc') THEN
        ALTER TABLE projects ADD COLUMN meta_desc TEXT;
    END IF;

    -- og_image_url kolonu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'og_image_url') THEN
        ALTER TABLE projects ADD COLUMN og_image_url TEXT;
    END IF;

    -- created_by kolonu
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'created_by') THEN
        ALTER TABLE projects ADD COLUMN created_by UUID REFERENCES auth.users(id);
    END IF;

    -- sort_order kolonu (eğer yoksa)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'projects' AND column_name = 'sort_order') THEN
        ALTER TABLE projects ADD COLUMN sort_order INT DEFAULT 0;
    END IF;
END $$;

-- 2. Eğer tablo hiç yoksa baştan oluştur
CREATE TABLE IF NOT EXISTS projects (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            TEXT UNIQUE,
    name            TEXT NOT NULL,
    about_text      TEXT,
    about_image_url TEXT,
    cta_text        TEXT DEFAULT 'Devamı',
    location_image_url    TEXT,
    apartment_options     TEXT,
    neighborhood          TEXT,
    location_description  TEXT,
    status          TEXT NOT NULL DEFAULT 'draft'
                    CHECK (status IN ('draft', 'published', 'archived')),
    sort_order      INT DEFAULT 0,
    is_featured     BOOLEAN DEFAULT false,
    meta_title      TEXT,
    meta_desc       TEXT,
    og_image_url    TEXT,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    created_by      UUID REFERENCES auth.users(id)
);

-- 3. project_media tablosunu oluştur (eğer yoksa)
CREATE TABLE IF NOT EXISTS project_media (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id  UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    r2_key      TEXT NOT NULL,
    url         TEXT NOT NULL,
    thumb_url   TEXT,
    category    TEXT NOT NULL
                CHECK (category IN ('about', 'exterior', 'interior', 'location')),
    alt_text    TEXT,
    file_name   TEXT,
    file_size   INT,
    width       INT,
    height      INT,
    sort_order  SMALLINT DEFAULT 0,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- 4. project_leads tablosunu oluştur (eğer yoksa)
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
    utm_source  TEXT,
    utm_medium  TEXT,
    page_url    TEXT,
    kvkk_consent    BOOLEAN NOT NULL DEFAULT false,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 5. İndeksler
CREATE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug) WHERE status = 'published';
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status, sort_order);
CREATE INDEX IF NOT EXISTS idx_media_project ON project_media(project_id, category, sort_order);
CREATE INDEX IF NOT EXISTS idx_leads_project ON project_leads(project_id, created_at DESC);

-- 6. Trigger fonksiyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 7. Trigger'ları oluştur
DROP TRIGGER IF EXISTS trg_projects_updated_at ON projects;
CREATE TRIGGER trg_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trg_project_leads_updated_at ON project_leads;
CREATE TRIGGER trg_project_leads_updated_at
    BEFORE UPDATE ON project_leads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. RLS'yi aç
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_leads ENABLE ROW LEVEL SECURITY;

-- 9. RLS Politikaları (önce sil, sonra yeniden oluştur)
DROP POLICY IF EXISTS "Public published projects" ON projects;
DROP POLICY IF EXISTS "Admin full access projects" ON projects;
DROP POLICY IF EXISTS "Public media read" ON project_media;
DROP POLICY IF EXISTS "Admin media full access" ON project_media;
DROP POLICY IF EXISTS "Anyone can insert lead" ON project_leads;
DROP POLICY IF EXISTS "Admin reads leads" ON project_leads;

-- Public: Sadece published projeler okunabilir
CREATE POLICY "Public published projects"
    ON projects FOR SELECT
    USING (status = 'published');

-- Admin: Tüm yetkiler
CREATE POLICY "Admin full access projects"
    ON projects FOR ALL
    USING (auth.role() = 'authenticated')
    WITH CHECK (auth.role() = 'authenticated');

-- Media: Public okuma
CREATE POLICY "Public media read"
    ON project_media FOR SELECT
    USING (EXISTS (
        SELECT 1 FROM projects p
        WHERE p.id = project_id AND p.status = 'published'
    ));

-- Media: Admin yazma
CREATE POLICY "Admin media full access"
    ON project_media FOR ALL
    USING (auth.role() = 'authenticated');

-- Leads: Herkes ekleme
CREATE POLICY "Anyone can insert lead"
    ON project_leads FOR INSERT
    WITH CHECK (true);

-- Leads: Admin okuma
CREATE POLICY "Admin reads leads"
    ON project_leads FOR SELECT
    USING (auth.role() = 'authenticated');

-- 10. Fonksiyonları oluştur
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

-- 11. Örnek veri ekle
INSERT INTO projects (
    slug, name, about_text, about_image_url, cta_text,
    location_image_url, apartment_options, neighborhood, location_description,
    status, is_featured, meta_title, meta_desc
) 
SELECT 
    'ornek-proje',
    'Örnek Proje',
    '%50 PEŞİN KALANI 12-24 AY 0 VADE FARKSIZ 12-24 AY TAKSİT SEÇENEKLERİ İLE KREDİ KULLANMADAN ÖDEME İMKANI DAİREMİZ BOŞ OLUP, KİRACI DERDİ YOKTUR.',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
    'Devamı',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
    '3+1 130 – 2+1 90 M2 DAİRE SEÇENEKLERİ',
    'ŞAHİNCİLİ MAHALLESİ',
    'ŞAHİNCİLİ TAKSİ DURAĞIYANINDA IHLAMUR VADİSİNİN 50 MT. ÜSTÜNDE KAÇIRILMAYACAK SATILIK DAİREMİZ.',
    'published',
    true,
    'Örnek Proje | Aklar İnşaat',
    'Aklar İnşaat güvencesiyle örnek projemizi keşfedin.'
WHERE NOT EXISTS (
    SELECT 1 FROM projects WHERE slug = 'ornek-proje'
);

-- Başarı mesajı
SELECT 'Schema güncellemesi tamamlandı!' as result;
