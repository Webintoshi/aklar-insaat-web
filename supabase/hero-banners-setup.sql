-- Hero Banners Tablosu
CREATE TABLE IF NOT EXISTS hero_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  desktop_image TEXT,
  mobile_image TEXT,
  title TEXT,
  subtitle TEXT,
  button_text TEXT,
  button_link TEXT,
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true
);

-- RLS Aktif Et
ALTER TABLE hero_banners ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları temizle
DROP POLICY IF EXISTS "Public read hero_banners" ON hero_banners;
DROP POLICY IF EXISTS "Admin insert hero_banners" ON hero_banners;
DROP POLICY IF EXISTS "Admin update hero_banners" ON hero_banners;
DROP POLICY IF EXISTS "Admin delete hero_banners" ON hero_banners;

-- Public Read (Siteyi ziyaret edenler görebilir)
CREATE POLICY "Public read hero_banners"
  ON hero_banners
  FOR SELECT
  USING (true);

-- Admin Insert (Authenticated kullanıcılar ekleyebilir)
CREATE POLICY "Admin insert hero_banners"
  ON hero_banners
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Admin Update (Authenticated kullanıcılar güncelleyebilir)
CREATE POLICY "Admin update hero_banners"
  ON hero_banners
  FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Admin Delete (Authenticated kullanıcılar silebilir)
CREATE POLICY "Admin delete hero_banners"
  ON hero_banners
  FOR DELETE
  USING (auth.role() = 'authenticated');

-- Tablo yapısını kontrol et
COMMENT ON TABLE hero_banners IS 'Hero banner slider için görseller ve metinler';

-- Örnek veri (isteğe bağlı)
-- INSERT INTO hero_banners (desktop_image, mobile_image, title, subtitle, button_text, button_link, order_index, is_active)
-- VALUES ('', '', 'Hoş Geldiniz', 'Kaliteli projeler', 'İncele', '/projeler', 0, true);
