# Aklar İnşaat production çalışma kılavuzu

## Coolify kaynakları

- Uygulama ve `postgres:18-alpine` aynı Coolify destination/özel ağı içinde çalışır.
- PostgreSQL public port kapalı tutulur. Uygulamadaki `DATABASE_URL`, Coolify'nin internal bağlantı adresidir.
- Production migration komutu yalnızca `npm run db:migrate` olur; `drizzle-kit push` kullanılmaz.
- Sağlık kontrolü `GET /api/health`, interval 30 saniye, timeout 5 saniye ve üç tekrar olarak ayarlanır.
- Uygulama imajı `ghcr.io/Webintoshi/aklar-insaat-web:sha-<tam-commit>` biçiminde sabitlenir; `latest` kullanılmaz.

## İlk kurulum ve göç

1. Boş veritabanında `npm run db:migrate` ve `npm run db:verify` çalıştırılır.
2. `npm run db:seed-owner` tek sefer çalıştırılır; en az 14 karakterli sahip parolası seed sonrasında ortamdan kaldırılır.
3. Ön göç `npm run db:migrate-supabase -- --dry-run` ile raporlanır.
4. Gerçek göç `npm run db:migrate-supabase` ile uygulanır ve `MIGRATION_REPORT_PATH` raporu saklanır.
5. Proje slug'ları, yayınlanan kayıtlar, mesajlar ve medya anahtarları rapor ile karşılaştırılır.
6. Son fark göçünde admin en fazla 10 dakika salt okunur tutulur. Kabul tamamlanana kadar Supabase değişkenleri geri dönüş için saklanır.

## R2 ve yedekler

- Site medyası: `aklar-insaat-web`, özel alan adı `media.orduaklarinsaat.com`.
- PostgreSQL yedeği: private `aklar-insaat-postgres-backups`; lifecycle 30 gün.
- Coolify yedeği her gün `02:30 Europe/Istanbul`; local retention 7 gün, S3 retention 30 gün.
- R2 uygulama anahtarı yalnızca medya kovasında Object Read/Write yetkilidir. Yedek anahtarı ayrı ve yalnızca yedek kovasına yetkilidir.
- `r2.dev`, özel alan adı `active` olduktan ve örnek medya URL'leri doğrulandıktan sonra kapatılır.

## Restore testi

1. En yeni yedek disposable PostgreSQL 18 kaynağına geri yüklenir.
2. Restore veritabanında `npm run db:verify` çalıştırılır.
3. En az bir yayınlanmış proje, içerik sayfası, mesaj ve medya kaydı SQL ile okunur.
4. Test sonucu tarih, yedek nesne anahtarı, sayımlar ve sorumlu bilgisiyle kaydedilir. Aylık tekrar edilir.

## Geri dönüş

- Uygulama health check başarısızsa Coolify önceki `sha-<commit>` imajına döndürülür.
- Veri göçü kabul edilmemişse önceki Supabase tabanlı imaj yeniden seçilir; son geçişte Supabase'e yazma yeniden açılır.
- R2 nesneleri ve Supabase kaynakları kabul tamamlanmadan silinmez.
