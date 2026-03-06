import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Building2, CheckCircle2, Clock3, PhoneCall, ChevronRight } from 'lucide-react'
import { MediaGallerySection } from './MediaGallerySection'

export const revalidate = 300

interface RouteParams {
  slug: string
}

interface ProjectMedia {
  id: string
  url: string
  category: 'about' | 'exterior' | 'interior' | 'location'
  sort_order: number | null
}

interface ProjectRecord {
  id: string
  name: string | null
  title: string | null
  slug: string
  status: string | null
  project_status: 'completed' | 'ongoing' | null
  about_text: string | null
  about_image_url: string | null
  cta_text: string | null
  apartment_options: string | null
  neighborhood: string | null
  location_description: string | null
  location_image_url: string | null
  meta_title: string | null
  meta_desc: string | null
}

async function getProjectDetail(slug: string): Promise<{ project: ProjectRecord; media: ProjectMedia[] } | null> {
  const supabase = await createClient()

  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('slug', slug)
    .or('status.eq.published,is_published.eq.true')
    .single()

  if (projectError || !project) {
    return null
  }

  const { data: media } = await supabase
    .from('project_media')
    .select('id,url,category,sort_order')
    .eq('project_id', project.id)
    .order('sort_order', { ascending: true })

  return {
    project: project as ProjectRecord,
    media: (media || []) as ProjectMedia[],
  }
}

export async function generateMetadata({ params }: { params: Promise<RouteParams> }) {
  const { slug } = await params
  const detail = await getProjectDetail(slug)

  if (!detail) {
    return {
      title: 'Proje Bulunamadı | Aklar İnşaat',
      description: 'İstenen proje kaydı bulunamadı.',
    }
  }

  const projectName = detail.project.name || detail.project.title || 'Proje Detayı'

  return {
    title: detail.project.meta_title || `${projectName} | Aklar İnşaat`,
    description: detail.project.meta_desc || detail.project.about_text || 'Aklar İnşaat proje detay sayfası.',
  }
}

function StatusBadge({ status }: { status: ProjectRecord['project_status'] }) {
  if (status === 'completed') {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-blue-600/10 px-4 py-2 text-sm font-semibold text-blue-700">
        <CheckCircle2 className="h-4 w-4" />
        Tamamlandi
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-amber-500/15 px-4 py-2 text-sm font-semibold text-amber-700">
      <Clock3 className="h-4 w-4" />
      Devam Ediyor
    </span>
  )
}

export default async function ProjeDetayPage({ params }: { params: Promise<RouteParams> }) {
  const { slug } = await params
  const detail = await getProjectDetail(slug)

  if (!detail) {
    notFound()
  }

  const { project, media } = detail
  const projectName = project.name || project.title || 'Proje Detayı'

  const aboutImage = media.find((m) => m.category === 'about')?.url || project.about_image_url
  const exteriorImages = media.filter((m) => m.category === 'exterior')
  const interiorImages = media.filter((m) => m.category === 'interior')
  const locationImage = media.find((m) => m.category === 'location')?.url || project.location_image_url

  return (
    <div className="min-h-screen bg-[#f5f7fa]">
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0f1d2f] via-[#1E3A5F] to-[#2E5A8F] text-white">
        <div className="absolute inset-0 opacity-15">
          {aboutImage ? <img src={aboutImage} alt="" className="h-full w-full object-cover" /> : null}
        </div>
        <div className="container mx-auto px-4 py-10 lg:py-14 relative z-10">
          <Link href="/projeler" className="mb-8 inline-flex items-center text-white/85 transition hover:text-white">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Projelere Dön
          </Link>

          <div className="grid gap-8 lg:grid-cols-12 lg:items-end">
            <div className="lg:col-span-8">
              <StatusBadge status={project.project_status} />
              <h1 className="mt-5 text-4xl font-semibold leading-tight md:text-6xl">{projectName}</h1>
              <p className="mt-5 max-w-3xl text-base text-white/90 md:text-lg">
                {project.about_text || 'Bu proje için detaylı tanıtım metni yakında eklenecektir.'}
              </p>
            </div>

            <div className="lg:col-span-4">
              <div className="rounded-2xl border border-white/25 bg-white/10 p-6 backdrop-blur-md">
                <p className="text-xs uppercase tracking-[0.18em] text-white/70">Hizli Bilgi</p>
                <p className="mt-3 text-2xl font-semibold">{project.apartment_options || 'Daire secenekleri yakinda'}</p>
                <p className="mt-2 text-white/80">{project.neighborhood || 'Konum bilgisi guncelleniyor'}</p>
                <a
                  href="#konum"
                  className="mt-6 inline-flex items-center rounded-xl bg-[#CF000C] px-5 py-3 text-sm font-semibold transition hover:bg-[#990000]"
                >
                  {project.cta_text || 'Konumu Incele'}
                  <ChevronRight className="ml-1 h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="container mx-auto space-y-12 px-4 py-12 lg:space-y-16">
        <section className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7 overflow-hidden rounded-3xl bg-white shadow-xl">
            {aboutImage ? (
              <img src={aboutImage} alt={projectName} className="h-full min-h-[300px] w-full object-cover" />
            ) : (
              <div className="flex min-h-[300px] items-center justify-center bg-gray-100 text-gray-300">
                <Building2 className="h-16 w-16" />
              </div>
            )}
          </div>

          <div className="lg:col-span-5 rounded-3xl bg-white p-8 shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2E5A8F]">Proje Özeti</p>
            <h2 className="mt-3 text-3xl font-semibold text-[#0F1D2F]">Mimari ve Yaşam Kurgusu</h2>
            <p className="mt-5 text-gray-600">
              {project.about_text || 'Proje açıklaması henüz admin panelinden doldurulmadı.'}
            </p>
            <ul className="mt-6 space-y-3 text-sm text-gray-700">
              <li className="rounded-lg bg-[#f4f7fb] px-4 py-3">Daire Seçenekleri: {project.apartment_options || 'Belirtilmedi'}</li>
              <li className="rounded-lg bg-[#f4f7fb] px-4 py-3">Mahalle: {project.neighborhood || 'Belirtilmedi'}</li>
              <li className="rounded-lg bg-[#f4f7fb] px-4 py-3">Durum: {project.project_status === 'completed' ? 'Tamamlandı' : 'Devam Ediyor'}</li>
            </ul>
          </div>
        </section>

        {exteriorImages.length > 0 ? (
          <MediaGallerySection
            title="Dış Mekan"
            projectName={projectName}
            imageType="dış mekan"
            images={exteriorImages.map((image) => ({ id: image.id, url: image.url }))}
          />
        ) : null}

        {interiorImages.length > 0 ? (
          <MediaGallerySection
            title="İç Mekan"
            projectName={projectName}
            imageType="iç mekan"
            images={interiorImages.map((image) => ({ id: image.id, url: image.url }))}
          />
        ) : null}

        <section id="konum" className="grid gap-8 lg:grid-cols-12">
          <div className="lg:col-span-7 overflow-hidden rounded-3xl bg-white shadow-xl">
            {locationImage ? (
              <img src={locationImage} alt={`${projectName} konum`} className="h-full min-h-[320px] w-full object-cover" />
            ) : (
              <div className="flex min-h-[320px] items-center justify-center bg-gray-100 text-gray-300">
                <MapPin className="h-16 w-16" />
              </div>
            )}
          </div>

          <div className="lg:col-span-5 rounded-3xl bg-white p-8 shadow-xl">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#2E5A8F]">Konum</p>
            <h3 className="mt-2 text-3xl font-semibold text-[#0F1D2F]">Ulaşım ve Çevre</h3>
            <p className="mt-5 text-gray-600">
              {project.location_description || 'Konum açıklaması henüz eklenmedi. Ayrıntılı bilgi için bizimle iletişime geçebilirsiniz.'}
            </p>

            <div className="mt-8 rounded-2xl border border-[#25D366]/25 bg-[#25D366]/10 p-5">
              <p className="font-semibold text-[#0F1D2F]">Detaylı Bilgi Alın</p>
              <p className="mt-2 text-sm text-gray-700">Satış ekibimizle hemen görüşüp fiyat ve ödeme planlarını öğrenin.</p>
              <a
                href="https://wa.me/905457277297?text=Merhaba, proje hakkında detaylı bilgi almak istiyorum."
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center rounded-xl bg-[#25D366] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#128C7E]"
              >
                <PhoneCall className="mr-2 h-4 w-4" />
                WhatsApp ile İletişim
              </a>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
