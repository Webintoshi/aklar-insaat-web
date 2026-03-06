-- Supabase Schema Cache Temizleme ve Düzeltme
-- Bu SQL'i Supabase Dashboard > SQL Editor'de çalıştırın

-- 1. admin_users tablosunun var olduğundan emin ol
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  role VARCHAR(50) DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. RLS Politikalarını yeniden oluştur
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Eski politikaları temizle
DROP POLICY IF EXISTS "Admins can manage admin_users" ON admin_users;
DROP POLICY IF EXISTS "Admin users select" ON admin_users;
DROP POLICY IF EXISTS "Admin users insert" ON admin_users;
DROP POLICY IF EXISTS "Allow admin manage" ON admin_users;

-- Yeni politikalar oluştur
-- Auth olan herkes admin_users tablosuna okuyabilir (login kontrolü için)
CREATE POLICY "Admin users select"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (true);

-- Sadece mevcut adminler yeni admin ekleyebilir
CREATE POLICY "Admin users insert"
  ON admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users au
      WHERE au.user_id = auth.uid()
    )
  );

-- 3. Tablo izinlerini kontrol et
GRANT ALL ON admin_users TO authenticated;
GRANT SELECT ON admin_users TO anon;

-- 4. Mevcut verileri koru (eğer varsa)
-- Eğer önceki screenshot'taki adminler varsa, bunlar zaten tabloda

-- 5. Schema cache'i temizlemek için dummy update
COMMENT ON TABLE admin_users IS 'Admin kullanıcıları tablosu - ' || NOW();

-- 6. Tabloyu yeniden oluşturma (son çare - mevcut verileri yedekle!)
-- NOT: Bu sadece tablo bozuksa kullanılmalı
-- Şimdilik sadece görüntüleme
SELECT 
  'admin_users tablosu durumu:' as info,
  COUNT(*) as kayit_sayisi,
  NOW() as kontrol_zamani
FROM admin_users;
