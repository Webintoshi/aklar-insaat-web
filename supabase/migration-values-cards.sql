-- ============================================================
-- AKLAR İNŞAAT - DEĞER KARTLARI MİGRASYONU
-- İstatistik kartları -> Değer kartları dönüşümü
-- ============================================================

-- 1. info_cards_sections tablosuna type alanı ekle
ALTER TABLE info_cards_sections 
ADD COLUMN IF NOT EXISTS type VARCHAR(20) DEFAULT 'stats' 
CHECK (type IN ('stats', 'values'));

-- 2. info_cards tablosuna description alanı ekle (değer kartları için)
ALTER TABLE info_cards 
ADD COLUMN IF NOT EXISTS description TEXT;

-- 3. Mevcut section'ı değer kartlarına dönüştür
UPDATE info_cards_sections 
SET 
  type = 'values',
  pre_title = 'DEĞERLERİMİZ',
  title = 'AKLAR İNŞAAT OLARAK BENİMSEDIĞIMIZ DEĞERLERIMIZ',
  description = NULL
WHERE id = (SELECT id FROM info_cards_sections ORDER BY created_at LIMIT 1);

-- 4. Mevcut kartları temizle ve yeni değer kartlarını ekle
DELETE FROM info_cards WHERE section_id = (SELECT id FROM info_cards_sections WHERE type = 'values' ORDER BY created_at LIMIT 1);

-- 5. Yeni değer kartlarını ekle
INSERT INTO info_cards (section_id, icon, title, description, order_index) VALUES
((SELECT id FROM info_cards_sections WHERE type = 'values' ORDER BY created_at LIMIT 1), 'Shield', 'Güvenilirlik', 'Geleneksel ve itibarlı tüccar kimliğinden hiçbir zaman taviz vermemek, taahhütlerimizi zamanında ve eksiksiz olarak yerine getirmek.', 0),
((SELECT id FROM info_cards_sections WHERE type = 'values' ORDER BY created_at LIMIT 1), 'Award', 'Kalite', 'Sağlamlıktan, kaliteden ve iş güvenliğinden ödün vermeden titizlik ile yeni estetik ve modern konutlar üretmek.', 1),
((SELECT id FROM info_cards_sections WHERE type = 'values' ORDER BY created_at LIMIT 1), 'Heart', 'Aile Olmak', 'Bir aile şirketi çatısı altında, bütün çalışanlarımız ile karşılıklı güven ve saygıya dayalı, başarı hedefleyen bir ilişki içinde olmak.', 2),
((SELECT id FROM info_cards_sections WHERE type = 'values' ORDER BY created_at LIMIT 1), 'Lightbulb', 'Yenilikçi', 'Sağlamlık ve estetikten uzaklaşmadan, en güncel malzemeleri, teknolojileri ve uygulamalarını takip etmek ve bunları inşaatlarımızda uygulamak.', 3),
((SELECT id FROM info_cards_sections WHERE type = 'values' ORDER BY created_at LIMIT 1), 'Smile', 'Memnuniyet', 'Müşteri ve arsa sahiplerini hepsini memnun etmeyi amaçlamak; şeffaf, pratik ve çözüm odaklı çalışmak. 100% Müşteri Memnuniyeti Hedeflemek.', 4),
((SELECT id FROM info_cards_sections WHERE type = 'values' ORDER BY created_at LIMIT 1), 'Clock', 'Tecrübe', 'Firmamızın köklü geçmişinden gelen güç ile yenilikçi, güvenilir ve dürüst anlayışını koruyarak çalışmalarını devam ettirmektedir.', 5),
((SELECT id FROM info_cards_sections WHERE type = 'values' ORDER BY created_at LIMIT 1), 'CheckCircle', 'Taahhüt', 'Firmamız geçmişten günümüze kadarki tüm taahhütleri zamanından önce eksiksiz yerine getirmenin verdiği güvenle tanınmaktadır.', 6),
((SELECT id FROM info_cards_sections WHERE type = 'values' ORDER BY created_at LIMIT 1), 'HardHat', 'Güvenlik', 'Firmamız çalışanlarının sağlığı ve güvenliği ile ilgili tehlikeleri en aza indirmek için yıllardır büyük çaba göstermektedir.', 7),
((SELECT id FROM info_cards_sections WHERE type = 'values' ORDER BY created_at LIMIT 1), 'Cpu', 'Teknoloji', 'Gelişen dünyanın ve modern çağın gerektirdiği tüm yeni teknolojiler ve teknik gelişmeleri yaptığımız konutlarda uygulamaktayız.', 8),
((SELECT id FROM info_cards_sections WHERE type = 'values' ORDER BY created_at LIMIT 1), 'ScrollText', 'İlkelerimiz', 'Firmamız, kalitenin oluşturulması, geliştirilmesi, uygulanması ve etkinliğinin sürekli iyileştirilmesi için gerekli olan faaliyetlerin yerine getirilmesi kararlığındadır.', 9);

-- ============================================================
-- TAMAMLANDI
-- ============================================================
