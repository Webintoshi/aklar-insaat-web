-- =====================================================
-- PROJE OLUŞTURMA SORUNU ÇÖZÜMÜ
-- 
-- Sorun: /admin/projeler/yeni sayfasında "Failed to create" hatası
-- Nedenler:
-- 1. Eski ve yeni şema çakışması
-- 2. RLS politikaları yetersiz
-- 3. created_by foreign key kontrolü
-- =====================================================

-- ─────────────────────────────────────────
-- 1. TABLO YAPISINI GÜNCELLE (Eski -> Yeni)
-- ─────────────────────────────────────────

-- Önce mevcut projects tablosunun yapısını kontrol edelim
-- ve eksik kolonları ekleyelim

-- Mevcut kolonları kontrol et (psql'de çalıştırılabilir)
-- \d projects

-- Eksik kolonları ekle (IF NOT EXISTS ile güvenli)
ALTER TABLE projects 
  ADD COLUMN IF NOT EXISTS name TEXT,
  ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS about_text TEXT,
  ADD COLUMN IF NOT EXISTS about_image_url TEXT,
  ADD COLUMN IF NOT EXISTS cta_text TEXT DEFAULT 'Devamı',
  ADD COLUMN IF NOT EXISTS location_image_url TEXT,
  ADD COLUMN IF NOT EXISTS apartment_options TEXT,
  ADD COLUMN IF NOT EXISTS neighborhood TEXT,
  ADD COLUMN IF NOT EXISTS location_description TEXT,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS meta_title TEXT,
  ADD COLUMN IF NOT EXISTS meta_desc TEXT,
  ADD COLUMN IF NOT EXISTS og_image_url TEXT,
  ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Eski status kolonunu güncelle (eğer CHECK constraint varsa)
-- Önce mevcut constraint'i kaldır
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;

-- Yeni status constraint'i ekle
ALTER TABLE projects ADD CONSTRAINT projects_status_check 
  CHECK (status IN ('draft', 'published', 'archived', 'completed', 'ongoing'));

-- ─────────────────────────────────────────
-- 2. RLS POLITIKALARINI DÜZELT
-- ─────────────────────────────────────────

-- Önce mevcut politikaları kaldır
DROP POLICY IF EXISTS "Public published projects" ON projects;
DROP POLICY IF EXISTS "Admin full access projects" ON projects;
DROP POLICY IF EXISTS "Public can read projects" ON projects;
DROP POLICY IF EXISTS "Admins can manage projects" ON projects;
DROP POLICY IF EXISTS "Allow authenticated insert" ON projects;
DROP POLICY IF EXISTS "Allow authenticated update" ON projects;
DROP POLICY IF EXISTS "Allow authenticated delete" ON projects;
DROP POLICY IF EXISTS "Allow authenticated select" ON projects;

-- RLS'i etkinleştir
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- YENI POLITIKALAR

-- 1. Public: Sadece published projeleri oku
CREATE POLICY "Public published projects"
  ON projects FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

-- 2. Admin: Tüm yetkiler - auth kontrolü ile
CREATE POLICY "Admin full access projects"
  ON projects FOR ALL
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- ─────────────────────────────────────────
-- 3. project_media TABLOSUNU KONTROL ET
-- ─────────────────────────────────────────

-- project_media tablosu var mı kontrol et
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables 
                 WHERE table_name = 'project_media') THEN
    
    CREATE TABLE project_media (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
      r2_key TEXT NOT NULL,
      url TEXT NOT NULL,
      thumb_url TEXT,
      category TEXT NOT NULL CHECK (category IN ('about', 'exterior', 'interior', 'location')),
      alt_text TEXT,
      file_name TEXT,
      file_size INT,
      width INT,
      height INT,
      sort_order SMALLINT DEFAULT 0,
      created_at TIMESTAMPTZ DEFAULT NOW()
    );

    -- Indexes
    CREATE INDEX idx_media_project ON project_media(project_id, category, sort_order);
    
    -- RLS
    ALTER TABLE project_media ENABLE ROW LEVEL SECURITY;
    
    CREATE POLICY "Public media read"
      ON project_media FOR SELECT
      TO anon, authenticated
      USING (EXISTS (
        SELECT 1 FROM projects p
        WHERE p.id = project_id AND p.status = 'published'
      ));
    
    CREATE POLICY "Admin media full access"
      ON project_media FOR ALL
      TO authenticated
      USING (auth.uid() IS NOT NULL);
      
  ELSE
    -- Tablo varsa eksik kolonları ekle
    ALTER TABLE project_media
      ADD COLUMN IF NOT EXISTS r2_key TEXT,
      ADD COLUMN IF NOT EXISTS thumb_url TEXT,
      ADD COLUMN IF NOT EXISTS category TEXT,
      ADD COLUMN IF NOT EXISTS alt_text TEXT,
      ADD COLUMN IF NOT EXISTS file_name TEXT,
      ADD COLUMN IF NOT EXISTS file_size INT,
      ADD COLUMN IF NOT EXISTS width INT,
      ADD COLUMN IF NOT EXISTS height INT,
      ADD COLUMN IF NOT EXISTS sort_order SMALLINT DEFAULT 0;
    
    -- Eski image_type kolonunu category'e taşı (eğer varsa)
    -- Bu migration manuel yapılmalı
  END IF;
END $$;

-- ─────────────────────────────────────────
-- 4. ESKI project_images TABLOSU (varsa)
-- ─────────────────────────────────────────

-- Eski tabloyu yeni yapıya taşıma (opsiyonel)
-- Bu sadece eski verileri korumak için

-- ─────────────────────────────────────────
-- 5. TEST VERISI (opsiyonel)
-- ─────────────────────────────────────────

-- Örnek proje ekle (test için)
INSERT INTO projects (
  slug,
  name,
  status,
  is_featured,
  about_text,
  cta_text,
  apartment_options,
  neighborhood,
  location_description,
  meta_title,
  meta_desc
) VALUES (
  'test-proje',
  'Test Projesi',
  'draft',
  false,
  'Bu bir test projesidir.',
  'Devamı',
  '2+1, 3+1 Daireler',
  'Test Mahallesi',
  'Test konum açıklaması',
  'Test Proje | Aklar İnşaat',
  'Test projesi açıklaması'
)
ON CONFLICT (slug) DO NOTHING;

-- ─────────────────────────────────────────
-- 6. GEREKLI INDEXLER
-- ─────────────────────────────────────────

CREATE INDEX IF NOT EXISTS idx_projects_slug 
  ON projects(slug) 
  WHERE status = 'published';

CREATE INDEX IF NOT EXISTS idx_projects_status 
  ON projects(status, sort_order);

CREATE INDEX IF NOT EXISTS idx_projects_featured 
  ON projects(is_featured) 
  WHERE is_featured = true;

-- ─────────────────────────────────────────
-- 7. TRIGGER GÜNCELLEME
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

-- ─────────────────────────────────────────
-- 8. MANUEL KONTROL SORGULARI
-- ─────────────────────────────────────────

-- Aşağıdaki sorguları Supabase SQL Editor'de çalıştırarak 
-- yapıyı kontrol edebilirsiniz:

-- Tablo yapısını görüntüle:
-- \d projects

-- Mevcut politikaları listele:
-- SELECT * FROM pg_policies WHERE tablename = 'projects';

-- Test insert (kendi user_id'niz ile):
-- INSERT INTO projects (name, slug, status, created_by) 
-- VALUES ('Test', 'test', 'draft', 'SIZIN_USER_ID');
