# Aklar İnşaat - Proje Konteksti

## Proje Özeti
**Aklar İnşaat** - Ordu merkezli modern konut projeleri ve inşaat çözümleri şirketi.

## Teknoloji Stack
- **Framework**: Next.js 16.1.6 (App Router)
- **Language**: TypeScript 5.0+
- **Styling**: Tailwind CSS v4
- **Database**: Supabase (PostgreSQL)
- **Storage**: Cloudflare R2
- **Auth**: Supabase Auth
- **Animations**: Framer Motion, Embla Carousel

## Proje Yapısı
```
web/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (site)/            # Site routes
│   │   │   ├── _sections/     # Page sections
│   │   │   ├── page.tsx       # Home page
│   │   │   └── layout.tsx     # Site layout
│   │   ├── admin/             # Admin panel
│   │   └── api/               # API routes
│   ├── components/
│   │   └── ui/                # UI components
│   ├── lib/
│   │   ├── api/               # API functions
│   │   ├── supabase/          # Supabase clients
│   │   └── utils.ts           # Utilities
│   └── types/                 # TypeScript types
├── public/                    # Static files
├── _bmad/                     # BMAD Method
└── supabase/                  # SQL migrations
```

## Renk Paleti
- **Primary**: #1E3A5F (Navy)
- **Secondary**: #CF000C (Red)
- **Background**: #FAFAF8 (Off-white)

## Sayfalar
1. **Ana Sayfa**: Hero slider, About, Projects, Video, Values, Footer
2. **Kurumsal**: Şirket hakkında bilgi
3. **Projeler**: Tamamlanan ve devam eden projeler
4. **İletişim**: İletişim formu ve bilgileri

## Admin Panel
- Hero Section yönetimi
- About Section yönetimi
- Video Section yönetimi
- Info Cards (Değerler) yönetimi
- Footer ayarları

## Önemli Notlar
- Türkçe içerik
- Responsive design
- RLS policies aktif
- Image uploads R2'ye yapılıyor
