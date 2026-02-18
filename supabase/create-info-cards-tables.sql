-- ============================================================
-- INFO CARDS TABLOLARI OLUŞTURMA
-- ============================================================

-- 1. info_cards_sections tablosu
CREATE TABLE IF NOT EXISTS info_cards_sections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  
  name VARCHAR(100) NOT NULL DEFAULT 'İstatistikler',
  is_active BOOLEAN DEFAULT true,
  type VARCHAR(20) DEFAULT 'stats' CHECK (type IN ('stats', 'values')),
  
  -- Section Header
  pre_title VARCHAR(100) DEFAULT 'Rakamlarla Biz',
  title VARCHAR(255) DEFAULT 'Başarı Hikayemiz',
  description TEXT,
  
  -- Carousel Ayarları
  autoplay BOOLEAN DEFAULT true,
  autoplay_speed INTEGER DEFAULT 4000,
  show_arrows BOOLEAN DEFAULT true,
  show_dots BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. info_cards tablosu
CREATE TABLE IF NOT EXISTS info_cards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  section_id UUID REFERENCES info_cards_sections(id) ON DELETE CASCADE,
  
  -- Kart İçeriği
  icon VARCHAR(50) NOT NULL DEFAULT 'Building',
  title VARCHAR(255) NOT NULL,
  value VARCHAR(100),
  suffix VARCHAR(20),
  description TEXT,
  
  -- Animasyon
  animation_type VARCHAR(20) DEFAULT 'countUp' CHECK (animation_type IN ('countUp', 'static')),
  target_number INTEGER,
  
  -- Sıralama
  order_index INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. RLS Politikaları
ALTER TABLE info_cards_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE info_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read info_cards_sections" ON info_cards_sections
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "Admins can manage info_cards_sections" ON info_cards_sections
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

CREATE POLICY "Public can read info_cards" ON info_cards
  FOR SELECT TO anon, authenticated;

CREATE POLICY "Admins can manage info_cards" ON info_cards
  FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.user_id = auth.uid()
    )
  );

-- 4. Trigger
CREATE TRIGGER IF NOT EXISTS update_info_cards_sections_updated_at 
  BEFORE UPDATE ON info_cards_sections
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. Varsayılan veriler (Değer Kartları olarak)
INSERT INTO info_cards_sections (name, is_active, type, pre_title, title, description)
VALUES (
  'Değerlerimiz',
  true,
  'values',
  'DEĞERLERİMİZ',
  'AKLAR İNŞAAT OLARAK BENİMSEDIĞIMIZ DEĞERLERIMIZ',
  null
);

-- Varsayılan değer kartları
INSERT INTO info_cards (section_id, title, description, order_index)
SELECT 
  id,
  'Güvenilirlik',
  'Geleneksel ve itibarlı tüccar kimliğinden hiçbir zaman taviz vermemek, taahhütlerimizi zamanında ve eksiksiz olarak yerine getirmek.',
  0
FROM info_cards_sections WHERE type = 'values' LIMIT 1;

INSERT INTO info_cards (section_id, title, description, order_index)
SELECT 
  id,
  'Kalite',
  'Sağlamlıktan, kaliteden ve iş güvenliğinden ödün vermeden titizlik ile yeni estetik ve modern konutlar üretmek.',
  1
FROM info_cards_sections WHERE type = 'values' LIMIT 1;

INSERT INTO info_cards (section_id, title, description, order_index)
SELECT 
  id,
  'Aile Olmak',
  'Bir aile şirketi çatısı altında, bütün çalışanlarımız ile karşılıklı güven ve saygıya dayalı, başarı hedefleyen bir ilişki içinde olmak.',
  2
FROM info_cards_sections WHERE type = 'values' LIMIT 1;

INSERT INTO info_cards (section_id, title, description, order_index)
SELECT 
  id,
  'Yenilikçi',
  'Sağlamlık ve estetikten uzaklaşmadan, en güncel malzemeleri, teknolojileri ve uygulamalarını takip etmek ve bunları inşaatlarımızda uygulamak.',
  3
FROM info_cards_sections WHERE type = 'values' LIMIT 1;

INSERT INTO info_cards (section_id, title, description, order_index)
SELECT 
  id,
  'Memnuniyet',
  'Müşteri ve arsa sahiplerini hepsini memnun etmeyi amaçlamak; şeffaf, pratik ve çözüm odaklı çalışmak. 100% Müşteri Memnuniyeti Hedeflemek.',
  4
FROM info_cards_sections WHERE type = 'values' LIMIT 1;

INSERT INTO info_cards (section_id, title, description, order_index)
SELECT 
  id,
  'Tecrübe',
  'Firmamızın köklü geçmişinden gelen güç ile yenilikçi, güvenilir ve dürüst anlayışını koruyarak çalışmalarını devam ettirmektedir.',
  5
FROM info_cards_sections WHERE type = 'values' LIMIT 1;

INSERT INTO info_cards (section_id, title, description, order_index)
SELECT 
  id,
  'Taahhüt',
  'Firmamız geçmişten günümüze kadarki tüm taahhütleri zamanından önce eksiksiz yerine getirmenin verdiği güvenle tanınmaktadır.',
  6
FROM info_cards_sections WHERE type = 'values' LIMIT 1;

INSERT INTO info_cards (section_id, title, description, order_index)
SELECT 
  id,
  'Güvenlik',
  'Firmamız çalışanlarının sağlığı ve güvenliği ile ilgili tehlikeleri en aza indirmek için yıllardır büyük çaba göstermektedir.',
  7
FROM info_cards_sections WHERE type = 'values' LIMIT 1;

INSERT INTO info_cards (section_id, title, description, order_index)
SELECT 
  id,
  'Teknoloji',
  'Gelişen dünyanın ve modern çağın gerektirdiği tüm yeni teknolojiler ve teknik gelişmeleri yaptığımız konutlarda uygulamaktayız.',
  8
FROM info_cards_sections WHERE type = 'values' LIMIT 1;

INSERT INTO info_cards (section_id, title, description, order_index)
SELECT 
  id,
  'İlkelerimiz',
  'Firmamız, kalitenin oluşturulması, geliştirilmesi, uygulanması ve etkinliğinin sürekli iyileştirilmesi için gerekli olan faaliyetlerin yerine getirilmesi kararlığındadır.',
  9
FROM info_cards_sections WHERE type = 'values' LIMIT 1;

-- ============================================================
-- TAMAMLANDI
-- ============================================================
