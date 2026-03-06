-- 🚨 ACİL DÜZELTME - Tüm tabloları yeniden oluştur

-- 1. Önce mevcut tabloları temizle (DİKKAT: Veriler silinir!)
DROP TABLE IF EXISTS project_images CASCADE;
DROP TABLE IF EXISTS projects CASCADE;
DROP TABLE IF EXISTS admin_users CASCADE;

-- 2. Schema cache'i temizle
NOTIFY pgrst, 'reload schema';

-- 3. Projects tablosunu oluştur
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'draft',
  project_status VARCHAR(50) DEFAULT 'ongoing' CHECK (project_status IN ('ongoing', 'completed')),
  location VARCHAR(255),
  is_featured BOOLEAN DEFAULT false,
  is_published BOOLEAN DEFAULT false,
  about_text TEXT,
  about_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Project images tablosu
CREATE TABLE project_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  image_type VARCHAR(50) NOT NULL CHECK (image_type IN ('exterior', 'interior', 'location')),
  caption VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Admin users tablosu
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. RLS Aktif et
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- 7. Politikalar (Test için açık)
DROP POLICY IF EXISTS projects_all ON projects;
CREATE POLICY projects_all ON projects FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS images_all ON project_images;
CREATE POLICY images_all ON project_images FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS admin_all ON admin_users;
CREATE POLICY admin_all ON admin_users FOR ALL USING (true) WITH CHECK (true);

-- 8. Yetkiler
GRANT ALL ON projects TO anon, authenticated;
GRANT ALL ON project_images TO anon, authenticated;
GRANT ALL ON admin_users TO anon, authenticated;

-- 9. Test verisi ekle
INSERT INTO projects (name, slug, status, project_status, location, is_published) VALUES
('Modern Yaşam Projesi', 'modern-yasam', 'published', 'ongoing', 'Ordu Merkez', true);

-- 10. Tekrar cache temizle
NOTIFY pgrst, 'reload schema';

-- Başarı mesajı
SELECT '✅ Tablolar oluşturuldu!' as result;
