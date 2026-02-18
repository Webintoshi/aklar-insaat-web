import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { 
  ArrowDown, 
  MapPin, 
  Home, 
  Maximize, 
  ChevronLeft, 
  ChevronRight 
} from 'lucide-react'
import Link from 'next/link'

// ISR: 5 dakikada bir revalidate
export const revalidate = 300

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('projects')
    .select('meta_title, meta_desc, name')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (!data) return {}

  return {
    title: data.meta_title || `${data.name} | Aklar İnşaat`,
    description: data.meta_desc,
  }
}

export default async function ProjeDetayPage({ 
  params 
}: { 
  params: { slug: string } 
}) {
  const supabase = await createClient()

  // Proje ve medyaları tek sorguda al
  const { data: project } = await supabase
    .from('projects')
    .select(`
      *,
      project_media (
        id, url, category, sort_order
      )
    `)
    .eq('slug', params.slug)
    .eq('status', 'published')
    .order('sort_order', { referencedTable: 'project_media', ascending: true })
    .single()

  if (!project) {
    notFound()
  }

  // Medyaları kategoriye göre grupla
  const aboutImage = project.project_media?.find((m: any) => m.category === 'about')?.url 
    || project.about_image_url
  const exteriorImages = project.project_media?.filter((m: any) => m.category === 'exterior') || []
  const interiorImages = project.project_media?.filter((m: any) => m.category === 'interior') || []
  const locationImage = project.project_media?.find((m: any) => m.category === 'location')?.url 
    || project.location_image_url

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-6">
        <Link
          href="/projeler"
          className="inline-flex items-center text-gray-600 hover:text-[#1E3A5F] transition-colors"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Tüm Projeler
        </Link>
      </div>

      {/* BÖLÜM 1: Proje Hakkında */}
      <section id="about" className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-center">
            {/* Sol: Görsel */}
            <div className="lg:col-span-3">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                {aboutImage ? (
                  <img
                    src={aboutImage}
                    alt={project.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <Home className="w-24 h-24 text-gray-300" />
                  </div>
                )}
              </div>
            </div>

            {/* Sağ: İçerik */}
            <div className="lg:col-span-2">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                {project.name}
              </h1>
              <div className="text-2xl md:text-3xl font-bold text-[#C9A962] mb-6 leading-tight">
                {project.about_text?.split('\n')[0] || 'Modern Yaşam Alanları'}
              </div>
              <p className="text-gray-600 text-lg leading-relaxed mb-8">
                {project.about_text}
              </p>
              <a
                href="#location"
                className="inline-flex items-center px-6 py-3 bg-[#1E3A5F] text-white rounded-lg hover:bg-[#0F1D2F] transition-colors"
              >
                {project.cta_text || 'Devamı'}
                <ArrowDown className="w-5 h-5 ml-2" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* BÖLÜM 2: Dış Mekan */}
      {exteriorImages.length > 0 && (
        <section className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              Dış Mekan
            </h2>
            <div className="relative">
              <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {exteriorImages.map((image: any, index: number) => (
                  <div
                    key={image.id}
                    className="flex-shrink-0 w-[400px] snap-center"
                  >
                    <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
                      <img
                        src={image.url}
                        alt={`Dış mekan ${index + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
              {/* Scroll indicators */}
              <div className="flex justify-center gap-2 mt-6">
                {exteriorImages.map((_: any, index: number) => (
                  <div
                    key={index}
                    className={`w-2 h-2 rounded-full ${
                      index === 0 ? 'bg-[#1E3A5F]' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* BÖLÜM 3: İç Mekan */}
      {interiorImages.length > 0 && (
        <section className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
              İç Mekan
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {interiorImages.map((image: any, index: number) => (
                <div
                  key={image.id}
                  className="aspect-square rounded-lg overflow-hidden shadow-md group"
                >
                  <img
                    src={image.url}
                    alt={`İç mekan ${index + 1}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* BÖLÜM 4: Proje Konumu */}
      <section id="location" className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Sol: Konum Görseli */}
            <div>
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                {locationImage ? (
                  <img
                    src={locationImage}
                    alt="Proje konumu"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <MapPin className="w-24 h-24 text-gray-300" />
                  </div>
                )}
              </div>
            </div>

            {/* Sağ: Konum Bilgileri */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Proje Konumu
              </h2>
              
              {project.apartment_options && (
                <div className="text-2xl font-bold text-[#C9A962] mb-4">
                  {project.apartment_options}
                </div>
              )}
              
              {project.neighborhood && (
                <div className="text-xl text-[#1E3A5F] font-semibold mb-6">
                  {project.neighborhood}
                </div>
              )}
              
              {project.location_description && (
                <p className="text-gray-600 text-lg leading-relaxed">
                  {project.location_description}
                </p>
              )}

              {/* WhatsApp CTA */}
              <div className="mt-8 p-6 bg-[#25D366]/10 rounded-xl border border-[#25D366]/20">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Bilgi Almak İster misiniz?
                </h3>
                <p className="text-gray-600 mb-4">
                  WhatsApp üzerinden bize ulaşın, detaylı bilgi alın.
                </p>
                <a
                  href="https://wa.me/905000000000?text=Merhaba, Aklar İnşaat hakkında bilgi almak istiyorum."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-6 py-3 bg-[#25D366] text-white rounded-lg hover:bg-[#128C7E] transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  WhatsApp'tan Bize Ulaşın
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
