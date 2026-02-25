// AKLAR İNŞAAT - FRONTEND DATA API

import { createClient } from '@/lib/supabase/server'

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
  description: string | null
  status: 'completed' | 'ongoing'
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
    phone: '0545 727 72 97',
    email: 'aklarinsaat@outlook.com',
    working_hours: 'Pzt-Cum: 09:00 - 18:00',
  },
  copyright_text: '© 2024 Aklar İnşaat. Tüm hakları saklıdır.',
  legal_links: [
    { label: 'Gizlilik Politikası', url: '/gizlilik' },
    { label: 'KVKK', url: '/kvkk' },
  ],
}

const defaultProjects: Project[] = [
  {
    id: '1',
    slug: 'modern-yasam',
    title: 'Modern Yaşam',
    description: 'Şehir merkezinde modern konut projesi',
    status: 'completed',
    location: 'İstanbul, Kadıköy',
    completion_date: '2023-06-01',
    featured_image: '/images/hero-banner.jpg',
    features: [{ icon: 'Bed', label: 'Oda', value: '3+1' }, { icon: 'Maximize', label: 'Alan', value: '150 m²' }],
  },
  {
    id: '2',
    slug: 'lotus-yasam-evleri',
    title: 'Lotus Yaşam Evleri',
    description: 'Havuzlu site içi konut projesi',
    status: 'ongoing',
    location: 'İstanbul, Beylikdüzü',
    completion_date: null,
    featured_image: '/images/hero-banner-2.jpg',
    features: [{ icon: 'Bed', label: 'Oda', value: '2+1' }, { icon: 'Maximize', label: 'Alan', value: '120 m²' }],
  },
  {
    id: '3',
    slug: 'aklar-residence',
    title: 'Aklar Residence',
    description: 'Lüks konut projesi',
    status: 'completed',
    location: 'İstanbul, Üsküdar',
    completion_date: '2022-12-01',
    featured_image: '/images/about-building.jpg',
    features: [{ icon: 'Bed', label: 'Oda', value: '4+1' }, { icon: 'Maximize', label: 'Alan', value: '200 m²' }],
  },
]

// ============================================================
// API FUNCTIONS
// ============================================================

export async function getHeroSection(): Promise<HeroSection> {
  const supabase = await createClient()
  
  // Önce hero_banners tablosundan aktif banner'ları çek
  const { data: banners } = await supabase
    .from('hero_banners')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true })
  
  // Eğer banner varsa, slider formatına dönüştür
  if (banners && banners.length > 0) {
    const sliderImages = banners.map((banner) => ({
      id: banner.id,
      image: banner.desktop_image || '/images/hero-banner.jpg',
      mobile_image: banner.mobile_image || undefined,
      pre_title: '',
      title: banner.title || '',
      highlight_word: banner.subtitle || '',
      badge_text: '',
      badge_subtext: '',
      cta_text: banner.button_text || 'İNCELE',
      cta_link: banner.button_link || '/projeler',
    }))
    
    return {
      ...defaultHero,
      background_type: 'slider',
      slider_images: sliderImages,
    }
  }
  
  // Banner yoksa hero_sections tablosuna bak
  const { data } = await supabase
    .from('hero_sections')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true })
    .limit(1)
    .single()
  
  return data || defaultHero
}

export async function getAboutSection(): Promise<AboutSection> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('about_sections')
    .select('*')
    .eq('is_active', true)
    .limit(1)
    .single()
  
  return data || defaultAbout
}

export async function getProjects(options?: { status?: 'completed' | 'ongoing'; featured?: boolean; limit?: number }): Promise<Project[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('projects')
    .select(`*, images:project_images(*)`)
    .eq('is_published', true)
    .order('order_index', { ascending: true })
  
  if (options?.status) query = query.eq('status', options.status)
  if (options?.featured) query = query.eq('is_featured', true)
  if (options?.limit) query = query.limit(options.limit)
  
  const { data } = await query
  
  if (!data || data.length === 0) {
    return defaultProjects
  }
  
  return data.map((p: any) => ({
    ...p,
    features: p.features || [],
  }))
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select(`*, images:project_images(*)`)
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  
  if (!data) return null
  
  return {
    ...data,
    features: data.features || [],
  }
}

export async function getVideoSection(): Promise<VideoSection> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('video_sections')
    .select('*')
    .eq('is_active', true)
    .order('order_index', { ascending: true })
    .limit(1)
    .single()
  
  return data || defaultVideo
}

export async function getInfoCardsSection(): Promise<InfoCardsSection> {
  const supabase = await createClient()
  
  const { data: section } = await supabase
    .from('info_cards_sections')
    .select('*')
    .eq('is_active', true)
    .limit(1)
    .single()
  
  if (!section) return defaultInfoCards
  
  const { data: cards } = await supabase
    .from('info_cards')
    .select('*')
    .eq('section_id', section.id)
    .order('order_index', { ascending: true })
  
  return {
    ...section,
    cards: cards?.length ? cards : defaultInfoCards.cards,
  }
}

export async function getFooterSettings(): Promise<FooterSettings> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('footer_settings')
    .select('*')
    .eq('is_active', true)
    .limit(1)
    .single()
  
  return data || defaultFooter
}

export interface HomePageData {
  hero: HeroSection
  about: AboutSection
  projects: Project[]
  video: VideoSection
  infoCards: InfoCardsSection
}

export async function getHomePageData(): Promise<HomePageData> {
  const [hero, about, projects, video, infoCards] = await Promise.all([
    getHeroSection(),
    getAboutSection(),
    getProjects({ featured: true, limit: 6 }),
    getVideoSection(),
    getInfoCardsSection(),
  ])
  
  return { hero, about, projects, video, infoCards }
}
