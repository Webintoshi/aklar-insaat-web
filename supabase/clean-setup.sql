-- TEMIZ SQL - Supabase Setup
-- Bu SQL'i oldugu gibi kopyalayıp SQL Editor'de calıstır

-- 1. Tabloları temizle
DROP TABLE IF EXISTS project_images CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

-- 2. Projects tablosu
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'published',
  project_status VARCHAR(50) DEFAULT 'ongoing',
  location VARCHAR(255),
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT true,
  about_text TEXT,
  about_image_url TEXT,
  cta_text VARCHAR(255),
  apartment_options VARCHAR(255),
  neighborhood VARCHAR(255),
  location_description TEXT,
  meta_title VARCHAR(255),
  meta_desc TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Project images tablosu
CREATE TABLE project_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_type VARCHAR(50) NOT NULL CHECK (image_type IN ('exterior', 'interior', 'location')),
  caption VARCHAR(255),
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Admin users tablosu
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. RLS aktif et
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 6. Politikalari temizle ve olustur
DROP POLICY IF EXISTS projects_select ON projects;
DROP POLICY IF EXISTS projects_insert ON projects;
DROP POLICY IF EXISTS projects_update ON projects;
DROP POLICY IF EXISTS projects_delete ON projects;

CREATE POLICY projects_select ON projects FOR SELECT USING (true);
CREATE POLICY projects_insert ON projects FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY projects_update ON projects FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY projects_delete ON projects FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS images_select ON project_images;
DROP POLICY IF EXISTS images_insert ON project_images;
DROP POLICY IF EXISTS images_delete ON project_images;

CREATE POLICY images_select ON project_images FOR SELECT USING (true);
CREATE POLICY images_insert ON project_images FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY images_delete ON project_images FOR DELETE TO authenticated USING (true);

DROP POLICY IF EXISTS admin_select ON admin_users;
DROP POLICY IF EXISTS admin_insert ON admin_users;

CREATE POLICY admin_select ON admin_users FOR SELECT TO authenticated USING (true);
CREATE POLICY admin_insert ON admin_users FOR INSERT TO authenticated WITH CHECK (true);

-- 7. Yetkiler
GRANT ALL ON projects TO anon, authenticated;
GRANT ALL ON project_images TO anon, authenticated;
GRANT ALL ON admin_users TO authenticated;

-- 8. Cache temizle
NOTIFY pgrst, 'reload schema';

-- 9. Test verisi
INSERT INTO projects (name, slug, description, status, project_status, location, is_published) 
VALUES ('Ornek Proje', 'ornek-proje', 'Test projesi', 'published', 'ongoing', 'Ordu', true);

-- Sonuc
SELECT 'Tablolar olusturuldu' as result;
