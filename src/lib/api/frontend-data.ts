// AKLAR İNŞAAT - FRONTEND DATA API

import { createClient } from '@/lib/supabase/server'

// ============================================================
// TYPES
// ============================================================

export interface HeroSection {
  id: string
  name: string
  background_type: 'image' | 'video' | 'slider'
  background_image: string
  background_video: string | null
  slider_images: string[]
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
}

export interface AboutSection {
  id: string
  image_url: string
  image_caption: string | null
  experience_badge: { years: number; text: string }
  pre_title: string
  title: string
  highlight_word: string
  description: string
  features: { icon: string; title: string; description: string }[]
  cta_text: string
  cta_link: string
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
}

export interface InfoCardsSection {
  id: string
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
  background_type: 'image',
  background_image: '/images/hero-banner.jpg',
  background_video: null,
  slider_images: [],
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
}

const defaultAbout: AboutSection = {
  id: 'default',
  image_url: '/images/about-building.jpg',
  image_caption: 'Modern Yaşam Projesi',
  experience_badge: { years: 15, text: 'Yıllık Tecrübe' },
  pre_title: 'Bizi Tanıyın',
  title: 'Aklar İnşaat',
  highlight_word: 'Güven',
  description: 'Aklar İnşaat olarak, 2005 yılından bu yana kaliteli ve modern konut projeleri üretiyoruz. Müşteri memnuniyetini ön planda tutarak, her projemizde estetik ve fonksiyonelliği bir araya getiriyoruz.',
  features: [
    { icon: 'Shield', title: 'Güvenilirlik', description: '20 yılı aşkın tecrübemizle her projemizde güvence sunuyoruz.' },
    { icon: 'Award', title: 'Kalite', description: 'En yüksek kalite standartlarında inşaat yapıyoruz.' },
    { icon: 'Clock', title: 'Zamanında Teslim', description: 'Projelerimizi söz verdiğimiz tarihte teslim ediyoruz.' },
    { icon: 'Heart', title: 'Müşteri Memnuniyeti', description: 'Mutlu müşterilerimiz bizim en büyük referansımızdır.' },
  ],
  cta_text: 'Daha Fazla Bilgi',
  cta_link: '/kurumsal',
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
  pre_title: 'Rakamlarla Biz',
  title: 'Başarı Hikayemiz',
  description: 'Aklar İnşaat\'ın başarı hikayesi rakamlarla daha da anlamlı',
  autoplay: true,
  autoplay_speed: 4000,
  show_arrows: true,
  show_dots: true,
  cards: [
    { id: '1', icon: 'Building', title: 'Tamamlanan Proje', value: '50', suffix: '+', animation_type: 'countUp', target_number: 50 },
    { id: '2', icon: 'Calendar', title: 'Yıllık Deneyim', value: '15', suffix: '+', animation_type: 'countUp', target_number: 15 },
    { id: '3', icon: 'Users', title: 'Mutlu Müşteri', value: '1000', suffix: '+', animation_type: 'countUp', target_number: 1000 },
    { id: '4', icon: 'Award', title: 'Memnuniyet Oranı', value: '98', suffix: '%', animation_type: 'countUp', target_number: 98 },
  ],
}

const defaultFooter: FooterSettings = {
  logo_url: null,
  description: 'Aklar İnşaat olarak, 2005 yılından bu yana kaliteli ve modern konut projeleri üretiyoruz. Müşteri memnuniyetini ön planda tutarak, her projemizde estetik ve fonksiyonelliği bir araya getiriyoruz.',
  social_links: [
    { platform: 'facebook', url: 'https://facebook.com' },
    { platform: 'instagram', url: 'https://instagram.com' },
    { platform: 'linkedin', url: 'https://linkedin.com' },
  ],
  quick_links: [
    { label: 'Ana Sayfa', url: '/' },
    { label: 'Kurumsal', url: '/kurumsal' },
    { label: 'Projeler', url: '/projeler' },
    { label: 'İletişim', url: '/iletisim' },
  ],
  contact_info: {
    address: 'İstanbul, Türkiye',
    phone: '+90 212 123 45 67',
    email: 'info@aklarinsaat.com',
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
