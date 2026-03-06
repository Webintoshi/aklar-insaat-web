-- 🏗️ BULVAR 2025 Test Projesi Oluştur

-- 1. Projeyi ekle
INSERT INTO projects (
  name, 
  slug, 
  description,
  status, 
  project_status, 
  location, 
  is_featured,
  is_published,
  about_text,
  created_at
) VALUES (
  'Bulvar 2025',
  'bulvar-2025',
  'Modern yaşam konseptiyle tasarlanmış, şehrin merkezinde konforlu yaşam alanları sunan yeni projemiz.',
  'published',
  'ongoing',
  'Ordu, Altınordu',
  true,
  true,
  'Bulvar 2025 projesi, modern mimari anlayışı ve fonksiyonel yaşam alanlarıyla öne çıkıyor. Geniş peyzaj alanları, kapalı otoparkı ve 7/24 güvenlik hizmetiyle aileler için ideal bir yaşam merkezi.',
  NOW()
)
RETURNING id;

-- 2. Son eklenen projenin ID'sini al ve görselleri ekle
DO $$
DECLARE
  project_id UUID;
BEGIN
  -- Son eklenen projeyi bul
  SELECT id INTO project_id FROM projects WHERE slug = 'bulvar-2025' ORDER BY created_at DESC LIMIT 1;
  
  -- Dış mekan görselleri (ilki featured image olarak da kullanılacak)
  INSERT INTO project_images (project_id, image_url, image_type, caption) VALUES
  (project_id, '/BULVAR 2025/WhatsApp Image 2026-02-07 at 16.13.38.jpeg', 'exterior', 'Proje Dış Görünüm 1'),
  (project_id, '/BULVAR 2025/WhatsApp Image 2026-02-07 at 16.13.38 (1).jpeg', 'exterior', 'Proje Dış Görünüm 2'),
  (project_id, '/BULVAR 2025/WhatsApp Image 2026-02-07 at 16.13.39.jpeg', 'exterior', 'Proje Dış Görünüm 3'),
  (project_id, '/BULVAR 2025/WhatsApp Image 2026-02-07 at 16.13.39 (1).jpeg', 'exterior', 'Proje Dış Görünüm 4'),
  (project_id, '/BULVAR 2025/WhatsApp Image 2026-02-07 at 16.13.39 (2).jpeg', 'location', 'Konum Görünümü'),
  (project_id, '/BULVAR 2025/WhatsApp Image 2026-02-07 at 16.13.39 (3).jpeg', 'interior', 'İç Mekan 1'),
  (project_id, '/BULVAR 2025/WhatsApp Image 2026-02-07 at 16.13.39 (4).jpeg', 'interior', 'İç Mekan 2'),
  (project_id, '/BULVAR 2025/WhatsApp Image 2026-02-07 at 16.13.39 (5).jpeg', 'interior', 'İç Mekan 3'),
  (project_id, '/BULVAR 2025/WhatsApp Image 2026-02-07 at 16.13.39 (6).jpeg', 'interior', 'İç Mekan 4'),
  (project_id, '/BULVAR 2025/WhatsApp Image 2026-02-07 at 16.13.39 (7).jpeg', 'interior', 'İç Mekan 5'),
  (project_id, '/BULVAR 2025/WhatsApp Image 2026-02-07 at 16.19.02.jpeg', 'exterior', 'Proje Genel Görünüm');
  
  RAISE NOTICE '✅ Bulvar 2025 projesi ve görselleri eklendi! Project ID: %', project_id;
END $$;

-- 3. Schema cache temizle
NOTIFY pgrst, 'reload schema';

-- 4. Kontrol
SELECT 
  p.id,
  p.name,
  p.slug,
  p.location,
  p.is_published,
  COUNT(pi.id) as image_count
FROM projects p
LEFT JOIN project_images pi ON pi.project_id = p.id
WHERE p.slug = 'bulvar-2025'
GROUP BY p.id, p.name, p.slug, p.location, p.is_published;
