-- =====================================================
-- PROJE DURUMU (completed / ongoing) EKLEME
-- =====================================================

-- 1. projects tablosuna project_status alanı ekle
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS project_status TEXT DEFAULT 'ongoing'
CHECK (project_status IN ('completed', 'ongoing'));

-- 2. Mevcut projeleri varsayılan olarak ongoing yap
UPDATE projects 
SET project_status = 'ongoing' 
WHERE project_status IS NULL;

-- 3. Index ekle (performans için)
CREATE INDEX IF NOT EXISTS idx_projects_project_status 
ON projects(project_status) 
WHERE status = 'published';

-- 4. Composite index (sıralama için)
CREATE INDEX IF NOT EXISTS idx_projects_status_type 
ON projects(status, project_status, sort_order);

-- 5. Güncellenmiş get_all_projects fonksiyonu (project_status filtresi ile)
CREATE OR REPLACE FUNCTION get_projects_by_status(p_status TEXT DEFAULT NULL)
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
            'is_featured', is_featured,
            'project_status', project_status
        ) ORDER BY sort_order, created_at DESC
    ) INTO result
    FROM projects 
    WHERE status = 'published'
    AND (p_status IS NULL OR project_status = p_status);
    
    RETURN COALESCE(result, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Test verisi - örnek projeler
INSERT INTO projects (
    slug,
    name,
    about_text,
    about_image_url,
    cta_text,
    apartment_options,
    neighborhood,
    location_description,
    status,
    project_status,
    is_featured,
    meta_title,
    meta_desc
) VALUES 
(
    'azak-park-evleri',
    'Azak Park Evleri',
    '%50 PEŞİN KALANI 12-24 AY 0 VADE FARKSIZ. ŞAHİNCİLİ TAKSİ DURAĞI YANINDA IHLAMUR VADİSİ''NİN 50 MT. ÜSTÜNDE KAÇIRILMAYACAK SATILIK DAİRELER.',
    'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
    'Detayları İncele',
    '3+1 130 – 2+1 90 M2 DAİRE SEÇENEKLERİ',
    'ŞAHİNCİLİ MAHALLESİ',
    'Şahincili Taksi Durağı yanında, Ihlamur Vadisi''nin 50 mt. üstünde kaçırılmayacak satılık dairelerimiz mevcuttur.',
    'published',
    'completed',
    true,
    'Azak Park Evleri | Aklar İnşaat',
    'Aklar İnşaat güvencesiyle Azak Park Evleri projesini keşfedin.'
),
(
    'lotus-yasam-evleri',
    'Lotus Yaşam Evleri',
    'MODERN MİMARİ VE KALİTELİ İŞÇİLİK BULUŞUYOR. HAVUZLU SİTE İÇERİSİNDE, GÜVENLİKLİ, ÇOCUK PARKLI YAŞAM ALANLARI.',
    'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
    'İncele',
    '4+1 160 – 3+1 120 M2 DAİRE SEÇENEKLERİ',
    'PAMUKLAR MAHALLESİ',
    'Hastane ve 4. Levent Metro yakınında, ulaşımı kolay konumda yeni nesil yaşam projesi.',
    'published',
    'ongoing',
    true,
    'Lotus Yaşam Evleri | Aklar İnşaat',
    'Devam eden Lotus Yaşam Evleri projemizi keşfedin.'
)
ON CONFLICT (slug) DO UPDATE SET 
    project_status = EXCLUDED.project_status,
    status = EXCLUDED.status;
