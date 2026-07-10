# Aklar İnşaat Coolify Taşıma Tasarımı

## Amaç

`Webintoshi/aklar-insaat-web` Next.js uygulamasını Vercel üretim davranışını koruyarak Coolify'a taşımak, `orduaklarinsaat.com` ve `www.orduaklarinsaat.com` alan adlarını Cloudflare üzerinden yeni yayına geçirmek ve sunucudaki sürekli kaynak kullanımını sınırlamak.

## Kaynak Durumu

- Kaynak: GitHub `main`, doğrulanan üretim commit'i `9ff33c42c1ba98b5d144e3a5a353f89a82cc632c`.
- Çalışma biçimi: Next.js 16 App Router; SSR, API route'ları, admin alanı, Supabase ve Cloudflare R2 kullanıyor.
- Vercel ortamı: 10 adet Supabase/R2 değişkeni tüm ortamlarda tanımlı.
- Statik export uygun değil; API, kimlik doğrulama, yönetim paneli ve yükleme akışları Node.js runtime gerektiriyor.

## Mimari

1. Uygulama `output: "standalone"` ile çok aşamalı, rootless bir Docker imajına dönüştürülür.
2. Docker imajı GitHub Actions'ın barındırılan runner'ında üretilir ve public GHCR paketine gönderilir. Repo zaten public olduğu için bu seçim kaynak kodunun görünürlüğünü artırmaz ve Coolify'da ek registry parolası gerektirmez. Coolify sunucusunda kaynak tüketen `next build` çalıştırılmaz.
3. Coolify hazır GHCR imajını çalıştırır; özel Supabase/R2 değerleri yalnızca Coolify runtime ortamında tutulur.
4. Cloudflare, Coolify/TLS yayınının health check ve fonksiyon testleri geçtikten sonra alan adını yeni origin'e yönlendirir.
5. DNS geçişi tamamlanana kadar mevcut yayın değiştirilmez; böylece kesinti riski azaltılır.

## Kaynak ve Güvenlik Ayarları

- Runtime: tek replika, 1 vCPU sınırı, 512 MiB bellek rezervasyonu ve başlangıçta 768 MiB bellek sınırı.
- Node.js: production modu, telemetri kapalı, root olmayan kullanıcı ve yalnızca standalone çıktı.
- Uygulama portu: `3000`; Coolify health check ana sayfaya HTTP isteği gönderir.
- Yeniden başlatma: yalnızca hata durumunda ve sınırlı gecikmeyle; sağlıksız konteyner sonsuz hızlı döngüye sokulmaz.
- React/React DOM `19.2.7`, self-host ortamında Vercel WAF korumasına güvenmemek için uygulanır; üretim bağımlılık taramasındaki DoS, proxy bypass, XSS ve cache-poisoning açıklarını kapatan Next.js `16.2.10` sürümü kullanılır.
- `SUPABASE_SERVICE_ROLE_KEY`, `R2_ACCESS_KEY_ID` ve `R2_SECRET_ACCESS_KEY` imaja, GitHub'a veya build loglarına yazılmaz.
- `NEXT_PUBLIC_*` değerleri istemci paketine girdiği için build aşamasında verilir; aynı değerler runtime'da da tanımlanır.

## Ortam Değişkenleri

Aktarılacak anahtarlar:

- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `R2_ENDPOINT`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`
- `NEXT_PUBLIC_R2_PUBLIC_URL`
- `R2_ACCOUNT_ID`
- `R2_REGION`
- `NEXT_PUBLIC_SITE_URL=https://orduaklarinsaat.com`

Değerlerin kendileri tasarım belgesine veya repoya kaydedilmez.

## Yayın ve DNS Akışı

1. Dockerfile, bağımlılık yamaları ve GHCR workflow'u branch üzerinde hazırlanır.
2. Yerel üretim build'i ve konteyner smoke test'i çalıştırılır.
3. Branch GitHub'a gönderilir, workflow başarıyla GHCR imajı üretir.
4. Coolify'da hazır imaj uygulaması oluşturulur, ortam değişkenleri aktarılır ve geçici Coolify adresinde deploy edilir.
5. Ana sayfa, proje detayları, admin login, API yanıtları, Supabase okuma ve R2 medya erişimi doğrulanır.
6. Cloudflare DNS kayıtları Coolify origin'ine çevrilir; proxy açık, SSL/TLS `Full (strict)` ve WebSocket desteği korunur.
7. `https://orduaklarinsaat.com` ve `https://www.orduaklarinsaat.com` üzerinden son test yapılır; `www` kanonik kök domaine yönlendirilir.

## Hata Yönetimi ve Geri Dönüş

- Docker/GHCR build başarısızsa DNS değiştirilmez.
- Coolify health check veya uygulama testi başarısızsa mevcut yayın korunur ve Coolify loglarından neden düzeltilir.
- DNS sonrası kritik hata görülürse Cloudflare kaydı önceki hedefe geri alınır; Coolify konteyneri inceleme için açık tutulur.
- Supabase şeması ve R2 verileri taşınmaz; aynı yönetilen servisler kullanılmaya devam ettiği için veri kopyalama ve tutarsızlık riski yoktur.

## Doğrulama Ölçütleri

- GitHub Actions build'i ve yerel `npm run build` başarılı.
- Konteyner health check'i başarılı; yeniden başlatma döngüsü yok.
- Ana sayfa ve proje sayfaları `200`; beklenen statik dosyalar ve R2 medyaları yükleniyor.
- Admin login sayfası açılıyor ve Supabase oturum akışı hata üretmiyor.
- API route'larında 5xx hatası yok; yükleme/presign işlemleri yetkili akışta çalışıyor.
- Her iki domain geçerli TLS sertifikasıyla açılıyor; kök domain kanonik hedef.
- Coolify runtime ölçümleri belirlenen CPU/bellek sınırları içinde kalıyor.

## Kapsam Dışı

- Supabase veritabanı şemasını veya R2 bucket içeriğini değiştirmek.
- Uygulama özelliklerini ya da tasarımını yeniden geliştirmek.
- Doğrulanmış Coolify yayını tamamlanmadan Vercel projesini veya eski DNS hedefini silmek.
