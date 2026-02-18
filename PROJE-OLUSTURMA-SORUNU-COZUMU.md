# Proje Oluşturma Sorunu Çözümü

## Sorun
`/admin/projeler/yeni` sayfasında proje eklerken "Proje oluşturulurken bir hata oluştu: Failed to create" hatası alınıyor.

## Tespit Edilen Nedenler

### 1. İki Farklı Veritabanı Şeması
Projede iki farklı `projects` tablo şeması mevcut:

**Eski Şema** (`schema.sql`):
- `title`, `description`, `location`, `completion_date`
- `status`: 'completed' | 'ongoing'
- `is_published`: boolean
- `project_images` ilişkili tablo

**Yeni Şema** (`projects-schema.sql`):
- `name`, `slug`, `about_text`, `neighborhood`
- `status`: 'draft' | 'published' | 'archived'
- `is_featured`: boolean
- `created_by`: UUID (foreign key)
- `project_media` ilişkili tablo

### 2. RLS (Row Level Security) Politikası Sorunu
Supabase'deki mevcut RLS politikaları `auth.role() = 'authenticated'` kullanıyor, ancak bu bazen çalışmıyor. Daha güvenli yaklaşım `auth.uid() IS NOT NULL` kullanmaktır.

### 3. Eksik Tablo Kolonları
Veritabanında yeni şemaya göre bazı kolonlar eksik olabilir.

---

## Çözüm Adımları

### Adım 1: SQL Dosyasını Çalıştır

`web/supabase/fix-projects-creation.sql` dosyasını Supabase SQL Editor'de çalıştırın:

1. Supabase Dashboard'a gidin: https://app.supabase.com
2. Projenizi seçin
3. Sol menüden "SQL Editor" seçin
4. "New query" butonuna tıklayın
5. `fix-projects-creation.sql` dosyasının içeriğini kopyalayıp yapıştırın
6. "Run" butonuna tıklayın

Bu SQL script şunları yapar:
- Eksik kolonları ekler
- RLS politikalarını günceller
- `project_media` tablosunu oluşturur (eğer yoksa)
- Gerekli indexleri ekler

### Adım 2: Vercel'e Yeniden Deploy Edin

```bash
cd web
git add .
git commit -m "Fix: Proje oluşturma hatası düzeltildi"
git push origin main
```

Veya Vercel Dashboard'dan "Redeploy" yapın.

### Adım 3: Test Edin

1. `/admin/projeler/yeni` sayfasına gidin
2. Yeni bir proje oluşturmayı deneyin
3. Hata mesajı varsa, detaylı hata mesajı görünecektir

---

## Yapılan Kod Değişiklikleri

### 1. API Hata Yönetimi (`src/app/api/projects/route.ts`)
- Daha detaylı hata loglama eklendi
- Validasyon kontrolleri eklendi
- PostgreSQL hata kodlarına göre anlamlı mesajlar:
  - `23505`: Duplicate slug hatası
  - `23503`: Foreign key hatası
  - `23502`: Not null hatası
  - `42501`: RLS yetki hatası

### 2. Frontend Hata Gösterimi (`src/app/admin/projeler/yeni/page.tsx`)
- Form validasyonu eklendi
- Hata mesajları için UI banner eklendi
- Kullanıcıya anlamlı hata mesajları gösteriliyor

---

## Hala Sorun Yaşıyorsanız

### Hata Mesajlarını Kontrol Edin

1. **Browser Console**: F12 → Console sekmesi
2. **Vercel Logs**: Vercel Dashboard → Proje → Logs
3. **Supabase Logs**: Supabase Dashboard → Logs → API

### Yaygın Hatalar ve Çözümleri

#### "Unauthorized" Hatası
- Oturumunuzun süresi dolmuş olabilir, tekrar giriş yapın
- Supabase Auth yapılandırmasını kontrol edin

#### "relation 'projects' does not exist"
- Tablo oluşturulmamış, SQL schema dosyasını çalıştırın

#### "column 'X' does not exist"
- Eksik kolon var, SQL fix dosyasını çalıştırın

#### "violates row-level security policy"
- RLS politikalarını kontrol edin
- Kullanıcı giriş yapmış mı kontrol edin

#### "duplicate key value violates unique constraint"
- Aynı slug ile başka proje var
- Farklı bir proje adı deneyin

---

## Manuel Kontrol Sorguları

Supabase SQL Editor'de çalıştırabilirsiniz:

```sql
-- Tablo yapısını kontrol et
\d projects

-- Mevcut politikaları listele
SELECT * FROM pg_policies WHERE tablename = 'projects';

-- Test insert (kendi user_id'niz ile)
INSERT INTO projects (name, slug, status, created_by) 
VALUES ('Test Projesi', 'test-projesi-123', 'draft', 'SIZIN_USER_ID');

-- Mevcut projeleri listele
SELECT id, name, slug, status, created_at FROM projects;
```

---

## İletişim

Sorun devam ederse:
1. Browser console'daki tam hata mesajını alın
2. Vercel logs'u kontrol edin
3. Bu bilgilerle destek talebi oluşturun
