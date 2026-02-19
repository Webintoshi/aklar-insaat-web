-- =====================================================
-- SCHEMA CACHE SORUNU ÇÖZÜMÜ + ÇOKLU GÖRSEL DESTEĞİ
-- =====================================================

-- 1. Eksik kolonları ekle (varsa tekrar ekleme)
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS about_image_url TEXT,
ADD COLUMN IF NOT EXISTS project_status TEXT DEFAULT 'ongoing' CHECK (project_status IN ('completed', 'ongoing')),
ADD COLUMN IF NOT EXISTS created_by UUID REFERENCES auth.users(id);

-- 2. project_media tablosunun varlığını kontrol et
CREATE TABLE IF NOT EXISTS project_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- R2 URL bilgileri
  r2_key TEXT NOT NULL,
  url TEXT NOT NULL,
  thumb_url TEXT,
  
  -- Kategori
  category TEXT NOT NULL CHECK (category IN ('about', 'exterior', 'interior', 'location')),
  
  -- Metadata
  alt_text TEXT,
  file_name TEXT,
  file_size INT,
  width INT,
  height INT,
  sort_order SMALLINT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Index'ler
CREATE INDEX IF NOT EXISTS idx_media_project 
ON project_media(project_id, category, sort_order);

-- 4. RLS Politikaları
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

-- 5. Mevcut projeleri varsayılan değerlerle güncelle
UPDATE projects 
SET project_status = COALESCE(project_status, 'ongoing'),
    status = COALESCE(status, 'draft')
WHERE project_status IS NULL OR status IS NULL;
