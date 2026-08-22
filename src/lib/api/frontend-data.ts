// AKLAR İNŞAAT - FRONTEND DATA API

import { and, asc, desc, eq, inArray } from 'drizzle-orm'

import { db } from '@/db/client'
import { mediaAssets, projectMedia, projects, projectUnitTypes, siteSections } from '@/db/schema'
import { resolveR2ContentUrls } from '@/lib/migration/supabase-transform'

// ============================================================
// TYPES
// ============================================================

export interface Slide {
  id: string
  image: string
  pre_title?: string
  title?: string
  highlight_word?: string
  badge_text?: string
  badge_subtext?: string
  cta_text?: string
  cta_link?: string
}

export interface HeroSection {
  id: string
  name: string
  background_type: 'image' | 'video' | 'slider'
  background_image: string
  background_video: string | null
  slider_images: Slide[]
  pre_title: string
  title: string
  highlight_word: string
  description: string
  badge_text?: string
  badge_subtext?: string
  primary_cta: { text: string; link: string; variant: string }
  secondary_cta: { text: string; link: string; variant: string }
  stats: { label: string; value: string }[]
  show_gradient_overlay?: boolean
  autoplay?: boolean
  autoplay_speed?: number
}

export interface AboutSection {
  id: string
  image_url: string
  image_caption: string | null
  experience_badge: { years: number; text: string }
  subtitle: string
  paragraphs: string[]
  highlight_text: string
  // Legacy fields (deprecated)
  pre_title?: string
  title?: string
  highlight_word?: string
  description?: string
  features?: { icon: string; title: string; description: string }[]
  cta_text?: string
  cta_link?: string
}

export interface VideoSection {
  id: string
  background_image: string
  video_type: 'youtube' | 'vimeo' | 'self_hosted'
  video_url: string | null
  video_id: string
  title: string | null
  description: string | null
  play_button_text: string
  autoplay: boolean
}

export interface InfoCard {
  id: string
  icon: string
  title: string
  value: string
  suffix: string | null
  animation_type: 'countUp' | 'static'
  target_number: number | null
  description: string | null
}

export interface InfoCardsSection {
  id: string
  type: 'stats' | 'values'
  pre_title: string
  title: string
  description: string | null
  autoplay: boolean
  autoplay_speed: number
  show_arrows: boolean
  show_dots: boolean
  cards: InfoCard[]
}

export interface Project {
  id: string
  slug: string
  title: string
  name?: string | null
  description: string | null
  status: 'completed' | 'ongoing'
  project_status?: 'completed' | 'ongoing' | null
  location: string | null
  completion_date: string | null
  featured_image: string | null
  features: { icon: string; label: string; value: string }[]
}

export interface FooterSettings {
  logo_url: string | null
  description: string
  social_links: { platform: 'facebook' | 'instagram' | 'linkedin' | 'twitter' | 'youtube'; url: string }[]
  quick_links: { label: string; url: string }[]
  contact_info: { address: string; phone: string; email: string; working_hours: string }
  copyright_text: string
  legal_links: { label: string; url: string }[]
}

// ============================================================
// DEFAULT DATA (Placeholder)
// ============================================================

const defaultHero: HeroSection = {
  id: 'default',
  name: 'Ana Sayfa Hero',
  background_type: 'slider',
  background_image: '/images/hero-banner.jpg',
  background_video: null,
  slider_images: [
    {
      id: '1',
      image: '/images/hero-banner.jpg',
      pre_title: 'SİZE ÖZEL DAİRELER',
      title: 'Size Özel Yaşam',
      highlight_word: 'MODERN YAŞAM',
      badge_text: '3+1',
      badge_subtext: 'DAİRELER',
      cta_text: 'İNCELE',
      cta_link: '/projeler',
    },
    {
      id: '2',
      image: '/images/hero-banner-2.jpg',
      pre_title: 'YENİ PROJE',
      title: 'Lotus Yaşam Evleri',
      highlight_word: 'TATİL KONSEPTLİ',
      badge_text: '2+1',
      badge_subtext: 'DAİRELER',
      cta_text: 'DETAYLAR',
      cta_link: '/projeler/lotus-yasam-evleri',
    },
  ],
  pre_title: 'SİZE ÖZEL DAİRELER',
  title: 'Size Özel Yaşam',
  highlight_word: 'MODERN YAŞAM',
  description: '',
  badge_text: '3+1',
  badge_subtext: 'DAİRELER',
  primary_cta: { text: 'İNCELE', link: '/projeler', variant: 'primary' },
  secondary_cta: { text: '', link: '', variant: 'outline' },
  stats: [],
  show_gradient_overlay: true,
  autoplay: true,
  autoplay_speed: 5000,
}

const defaultAbout: AboutSection = {
  id: 'default',
  image_url: '/images/about-building.jpg',
  image_caption: 'Modern Yaşam Projesi',
  experience_badge: { years: 15, text: 'Yıllık Tecrübe' },
  subtitle: 'AKLAR İNŞAAT',
  paragraphs: [
    `Aklar İnşaat, uzun yıllardır Ordu'da hizmet vermektedir. 'Hız ve Kalite Bizim İşimiz' sloganıyla sektöre adım atan firmamız, her geçen gün kendini yenileyerek büyümeye devam etmektedir. Son yıllarda artan iş talebi ve büyümekte olan inşaat sektörü konusunda yaptığımız çalışmalar, şirketin bilgi birikimi ve sahip olduğu uzman kadrosunu, inşaat, proje alanında çalışmaya yöneltmiştir. Aklar İnşaat, kurumsal ve bireysel müşterilerden gelen talepler doğrultusunda standartlara uygun, bilimsel ve güvenilir mühendislik, inşaat işleri hazırlayan bir şirkettir.`,
    'Sunduğumuz kaliteli, etkin hizmetlerimizle bugün; bölgemizde faaliyet gösteren seçkin ve tercih edilen hizmet kuruluşlarından biri olmanın haklı gururunu yaşamaktayız.'
  ],
  highlight_text: 'Hem ulaştığımız kitle hemde takım arkadaşlarımız arasında sinerji yaratabilmek için benimsediğimiz değerler; Müşterilerimizin kalite, fiyat, teslim süresi ve yüksek standartlardaki beklentilerini sorunsuz bir şekilde karşılamak.',
}

const defaultVideo: VideoSection = {
  id: 'default',
  background_image: '/images/hero-banner-2.jpg',
  video_type: 'youtube',
  video_url: null,
  video_id: 'dQw4w9WgXcQ',
  title: 'Hayalinizdeki Yaşam',
  description: 'Aklar İnşaat projelerini keşfedin ve hayalinizdeki eve adım atın.',
  play_button_text: 'Videoyu İzle',
  autoplay: true,
}

const defaultInfoCards: InfoCardsSection = {
  id: 'default',
  type: 'values',
  pre_title: 'DEĞERLERİMİZ',
  title: 'AKLAR İNŞAAT OLARAK BENİMSEDIĞIMIZ DEĞERLERIMIZ',
  description: null,
  autoplay: true,
  autoplay_speed: 4000,
  show_arrows: true,
  show_dots: true,
  cards: [
    { id: '1', icon: 'Shield', title: 'Güvenilirlik', value: '', suffix: null, animation_type: 'static', target_number: null, description: 'Geleneksel ve itibarlı tüccar kimliğinden hiçbir zaman taviz vermemek, taahhütlerimizi zamanında ve eksiksiz olarak yerine getirmek.' },
    { id: '2', icon: 'Award', title: 'Kalite', value: '', suffix: null, animation_type: 'static', target_number: null, description: 'Sağlamlıktan, kaliteden ve iş güvenliğinden ödün vermeden titizlik ile yeni estetik ve modern konutlar üretmek.' },
    { id: '3', icon: 'Heart', title: 'Aile Olmak', value: '', suffix: null, animation_type: 'static', target_number: null, description: 'Bir aile şirketi çatısı altında, bütün çalışanlarımız ile karşılıklı güven ve saygıya dayalı, başarı hedefleyen bir ilişki içinde olmak.' },
    { id: '4', icon: 'Lightbulb', title: 'Yenilikçi', value: '', suffix: null, animation_type: 'static', target_number: null, description: 'Sağlamlık ve estetikten uzaklaşmadan, en güncel malzemeleri, teknolojileri ve uygulamalarını takip etmek ve bunları inşaatlarımızda uygulamak.' },
    { id: '5', icon: 'Smile', title: 'Memnuniyet', value: '', suffix: null, animation_type: 'static', target_number: null, description: 'Müşteri ve arsa sahiplerini hepsini memnun etmeyi amaçlamak; şeffaf, pratik ve çözüm odaklı çalışmak. 100% Müşteri Memnuniyeti Hedeflemek.' },
    { id: '6', icon: 'Clock', title: 'Tecrübe', value: '', suffix: null, animation_type: 'static', target_number: null, description: 'Firmamızın köklü geçmişinden gelen güç ile yenilikçi, güvenilir ve dürüst anlayışını koruyarak çalışmalarını devam ettirmektedir.' },
    { id: '7', icon: 'CheckCircle', title: 'Taahhüt', value: '', suffix: null, animation_type: 'static', target_number: null, description: 'Firmamız geçmişten günümüze kadarki tüm taahhütleri zamanından önce eksiksiz yerine getirmenin verdiği güvenle tanınmaktadır.' },
    { id: '8', icon: 'HardHat', title: 'Güvenlik', value: '', suffix: null, animation_type: 'static', target_number: null, description: 'Firmamız çalışanlarının sağlığı ve güvenliği ile ilgili tehlikeleri en aza indirmek için yıllardır büyük çaba göstermektedir.' },
    { id: '9', icon: 'Cpu', title: 'Teknoloji', value: '', suffix: null, animation_type: 'static', target_number: null, description: 'Gelişen dünyanın ve modern çağın gerektirdiği tüm yeni teknolojiler ve teknik gelişmeleri yaptığımız konutlarda uygulamaktayız.' },
    { id: '10', icon: 'ScrollText', title: 'İlkelerimiz', value: '', suffix: null, animation_type: 'static', target_number: null, description: 'Firmamız, kalitenin oluşturulması, geliştirilmesi, uygulanması ve etkinliğinin sürekli iyileştirilmesi için gerekli olan faaliyetlerin yerine getirilmesi kararlığındadır.' },
  ],
}

const defaultFooter: FooterSettings = {
  logo_url: null,
  description: 'Aklar İnşaat olarak, 2005 yılından bu yana kaliteli ve modern konut projeleri üretiyoruz. Müşteri memnuniyetini ön planda tutarak, her projemizde estetik ve fonksiyonelliği bir araya getiriyoruz.',
  social_links: [
    { platform: 'instagram', url: 'https://www.instagram.com/aklarinsaat.ordu/' },
  ],
  quick_links: [
    { label: 'Ana Sayfa', url: '/' },
    { label: 'Kurumsal', url: '/kurumsal' },
    { label: 'Projeler', url: '/projeler' },
    { label: 'İletişim', url: '/iletisim' },
  ],
  contact_info: {
    address: 'ŞİRİNEVLER MAH ZÜBEYDE HANIM CAD NO:243/A Ordu/ALTINORDU',
    phone: '0532 762 42 67',
    email: 'aklarinsaat@outlook.com',
    working_hours: '08:00 - 19:00',
  },
  copyright_text: '© 2024 Aklar İnşaat. Tüm hakları saklıdır.',
  legal_links: [
    { label: 'Gizlilik Politikası', url: '/gizlilik' },
    { label: 'KVKK', url: '/kvkk' },
  ],
}

// ============================================================
// API FUNCTIONS
// ============================================================

async function getPublishedSection<T>(sectionKey: string, fallback: T): Promise<T> {
  const [section] = await db
    .select({ content: siteSections.content })
    .from(siteSections)
    .where(
      and(
        eq(siteSections.sectionKey, sectionKey),
        eq(siteSections.status, 'published'),
      ),
    )
    .limit(1)

  if (!section) return fallback
  const publicBase = process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://media.orduaklarinsaat.com'
  return resolveR2ContentUrls({ ...fallback, ...section.content }, publicBase) as T
}

export async function getHeroSection(): Promise<HeroSection> {
  return getPublishedSection<HeroSection>('hero', defaultHero)
}

export async function getAboutSection(): Promise<AboutSection> {
  return getPublishedSection<AboutSection>('about', defaultAbout)
}

export async function getProjects(options?: { status?: 'completed' | 'ongoing'; featured?: boolean; limit?: number }): Promise<Project[]> {
  const filters = [eq(projects.publicationStatus, 'published')]
  if (options?.status) filters.push(eq(projects.constructionStage, options.status))

  const projectRows = await db
    .select()
    .from(projects)
    .where(and(...filters))
    .orderBy(desc(projects.publishedAt), desc(projects.createdAt))
    .limit(options?.limit ?? 100)

  if (projectRows.length === 0) return []
  const ids = projectRows.map((project) => project.id)
  const [covers, units] = await Promise.all([
    db
      .select({
        projectId: projectMedia.projectId,
        objectKey: mediaAssets.objectKey,
      })
      .from(projectMedia)
      .innerJoin(mediaAssets, eq(projectMedia.mediaAssetId, mediaAssets.id))
      .where(
        and(
          inArray(projectMedia.projectId, ids),
          eq(projectMedia.category, 'cover'),
          eq(mediaAssets.status, 'active'),
        ),
      ),
    db
      .select()
      .from(projectUnitTypes)
      .where(inArray(projectUnitTypes.projectId, ids))
      .orderBy(asc(projectUnitTypes.position)),
  ])

  const mediaBase = (process.env.NEXT_PUBLIC_R2_PUBLIC_URL || 'https://media.orduaklarinsaat.com').replace(/\/+$/, '')
  const coversByProject = new Map(covers.map((cover) => [cover.projectId, cover.objectKey]))
  const unitsByProject = new Map<string, typeof units>()
  for (const unit of units) {
    const projectUnits = unitsByProject.get(unit.projectId) || []
    projectUnits.push(unit)
    unitsByProject.set(unit.projectId, projectUnits)
  }
  return projectRows.map((project) => ({
    id: project.id,
    slug: project.slug,
    title: project.name,
    name: project.name,
    description: project.shortDescription,
    status: project.constructionStage || 'ongoing',
    project_status: project.constructionStage,
    location: [project.neighborhood, project.district, project.city].filter(Boolean).join(', ') || null,
    completion_date: project.completionDate,
    featured_image: coversByProject.has(project.id)
      ? mediaBase + '/' + coversByProject.get(project.id)
      : null,
    features: (unitsByProject.get(project.id) || [])
      .map((unit) => ({
        icon: 'Maximize',
        label: unit.label,
        value: unit.areaMin === unit.areaMax
          ? String(unit.areaMin) + ' m²'
          : String(unit.areaMin) + '-' + String(unit.areaMax) + ' m²',
      })),
  }))
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  return (await getProjects()).find((project) => project.slug === slug) ?? null
}

export async function getVideoSection(): Promise<VideoSection> {
  return getPublishedSection<VideoSection>('video', defaultVideo)
}

export async function getInfoCardsSection(): Promise<InfoCardsSection> {
  return getPublishedSection<InfoCardsSection>('info_cards', defaultInfoCards)
}

export async function getFooterSettings(): Promise<FooterSettings> {
  const footer = await getPublishedSection<FooterSettings>('footer', defaultFooter)
  const rawPhone = footer.contact_info?.phone?.trim() || defaultFooter.contact_info.phone
  const rawWorkingHours = footer.contact_info?.working_hours?.trim() || defaultFooter.contact_info.working_hours

  return {
    ...footer,
    contact_info: {
      ...footer.contact_info,
      phone: rawPhone === '0545 727 72 97' ? defaultFooter.contact_info.phone : rawPhone,
      working_hours:
        rawWorkingHours === '09:00-18:00' || rawWorkingHours === 'Pzt-Cum: 09:00 - 18:00'
          ? defaultFooter.contact_info.working_hours
          : rawWorkingHours,
    },
  }
}

export interface HomePageData {
  hero: HeroSection
  about: AboutSection
  projects: Project[]
  video: VideoSection
  infoCards: InfoCardsSection
}

export async function getHomePageData(): Promise<HomePageData> {
  const [hero, about, featuredProjects, video, infoCards] = await Promise.all([
    getHeroSection(),
    getAboutSection(),
    getProjects({ featured: true, limit: 6 }),
    getVideoSection(),
    getInfoCardsSection(),
  ])

  const projects = featuredProjects.length > 0 ? featuredProjects : await getProjects({ limit: 8 })

  return { hero, about, projects, video, infoCards }
}
