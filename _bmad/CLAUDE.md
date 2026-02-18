# Claude Code + BMAD Method Rehberi

## Hızlı Başlangıç

### Yeni Feature Geliştirme
```
1. Gereksinimleri anla
2. Mevcut kodu incele
3. BMAD standartlarına göre implemente et
4. Test et
5. Review için sun
```

### Kod Standartları
- TypeScript strict mode zorunlu
- `src/` altında çalış
- Component'ler PascalCase
- Fonksiyonlar camelCase
- Tailwind kullan (inline CSS yok)

### UI/UX Kuralları
- Mobile-first yaklaşım
- Kırmızı (#CF000C) aksan rengi
- Navy (#1E3A5F) primary
- Smooth transitions
- Loading states unutma

### Database İşlemleri
- Supabase RLS politikalarına uy
- Server Actions kullan
- Error handling yap
- Type safety koru

### BMAD Workflow
1. **Plan**: Ne yapılacağını tanımla
2. **Design**: Yapıyı tasarla
3. **Build**: Kodu yaz
4. **Test**: Kontrol et
5. **Deploy**: Yayınla

## Komutlar
```bash
# BMAD status check
npx bmad-method status

# BMAD agent çalıştır
npx bmad-method run [agent-name]
```

## Önemli Dosyalar
- `bmad.config.js` - Ana yapılandırma
- `_bmad/project-context.md` - Proje bilgisi
- `_bmad/agents/*.md` - Agent tanımları
