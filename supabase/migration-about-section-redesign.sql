-- ============================================================
-- AKLAR İNŞAAT - ABOUT SECTION YENİ TASARIM MİGRASYONU
-- ============================================================

-- Yeni alanlar ekle
ALTER TABLE about_sections 
ADD COLUMN IF NOT EXISTS subtitle VARCHAR(100) DEFAULT 'AKLAR İNŞAAT';

ALTER TABLE about_sections 
ADD COLUMN IF NOT EXISTS paragraphs JSONB DEFAULT '[]'::jsonb;

ALTER TABLE about_sections 
ADD COLUMN IF NOT EXISTS highlight_text TEXT;

-- Mevcut veriyi yeni yapıya dönüştür
UPDATE about_sections 
SET 
  subtitle = 'AKLAR İNŞAAT',
  paragraphs = jsonb_build_array(
    COALESCE(description, 'Aklar İnşaat olarak, 2005 yılından bu yana kaliteli ve modern konut projeleri üretiyoruz. Müşteri memnuniyetini ön planda tutarak, her projemizde estetik ve fonksiyonelliği bir araya getiriyoruz.'),
    'Sunduğumuz kaliteli, etkin hizmetlerimizle bugün; bölgemizde faaliyet gösteren seçkin ve tercih edilen hizmet kuruluşlarından biri olmanın haklı gururunu yaşamaktayız.'
  ),
  highlight_text = 'Hem ulaştığımız kitle hemde takım arkadaşlarımız arasında sinerji yaratabilmek için benimsediğimiz değerler; Müşterilerimizin kalite, fiyat, teslim süresi ve yüksek standartlardaki beklentilerini sorunsuz bir şekilde karşılamak.'
WHERE paragraphs IS NULL OR paragraphs = '[]'::jsonb;

-- Varsayılan veriyi güncelle (eğer yoksa)
INSERT INTO about_sections (
  name, is_active, image_url, image_caption, experience_badge,
  subtitle, paragraphs, highlight_text, pre_title, title, highlight_word, description, cta_text, cta_link
) 
SELECT 
  'Hakkımızda',
  true,
  '/images/about-building.jpg',
  'Modern Yaşam Projesi',
  '{"years": 15, "text": "Yıllık Tecrübe"}'::jsonb,
  'AKLAR İNŞAAT',
  '[
    "Aklar İnşaat, uzun yıllardır Ordu''da hizmet vermektedir. ''Hız ve Kalite Bizim İşimiz'' sloganıyla sektöre adım atan firmamız, her geçen gün kendini yenileyerek büyümeye devam etmektedir. Son yıllarda artan iş talebi ve büyümekte olan inşaat sektörü konusunda yaptığımız çalışmalar, şirketin bilgi birikimi ve sahip olduğu uzman kadrosunu, inşaat, proje alanında çalışmaya yöneltmiştir. Aklar İnşaat, kurumsal ve bireysel müşterilerden gelen talepler doğrultusunda standartlara uygun, bilimsel ve güvenilir mühendislik, inşaat işleri hazırlayan bir şirkettir.",
    "Sunduğumuz kaliteli, etkin hizmetlerimizle bugün; bölgemizde faaliyet gösteren seçkin ve tercih edilen hizmet kuruluşlarından biri olmanın haklı gururunu yaşamaktayız."
  ]'::jsonb,
  'Hem ulaştığımız kitle hemde takım arkadaşlarımız arasında sinerji yaratabilmek için benimsediğimiz değerler; Müşterilerimizin kalite, fiyat, teslim süresi ve yüksek standartlardaki beklentilerini sorunsuz bir şekilde karşılamak.',
  'Bizi Tanıyın',
  'Aklar İnşaat',
  'Güven',
  'Aklar İnşaat olarak, 2005 yılından bu yana kaliteli ve modern konut projeleri üretiyoruz.',
  'Daha Fazla Bilgi',
  '/kurumsal'
WHERE NOT EXISTS (SELECT 1 FROM about_sections WHERE name = 'Hakkımızda');

-- ============================================================
-- TAMAMLANDI
-- ============================================================
