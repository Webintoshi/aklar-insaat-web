import { Metadata } from 'next'
import Image from 'next/image'

// Kurumsal page with site layout (Header + Footer)
export const metadata: Metadata = {
  title: 'Kurumsal | Aklar İnşaat',
  description: 'Aklar İnşaat hakkında bilgi. Vizyon, misyon ve değerlerimiz.',
}

export default function KurumsalPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-[#1E3A5F] py-16 lg:py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <h1 className="text-4xl sm:text-5xl font-bold text-white">
            Kurumsal
          </h1>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left: Image */}
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden shadow-lg">
              <Image
                src="/images/about-building.jpg"
                alt="Aklar İnşaat"
                fill
                className="object-cover"
              />
            </div>

            {/* Right: Content */}
            <div>
              {/* Subtitle with line */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-0.5 bg-[#CF000C]" />
                <span className="text-[#CF000C] text-sm font-semibold tracking-wider uppercase">
                  AKLAR İNŞAAT
                </span>
              </div>

              {/* Paragraphs */}
              <div className="space-y-6 text-gray-700 leading-relaxed">
                <p>
                  Aklar İnşaat, uzun yıllardır Ordu'da hizmet vermektedir. "Hız ve Kalite Bizim İşimiz" 
                  sloganıyla sektöre adım atan firmamız, her geçen gün kendini yenileyerek büyümeye devam 
                  etmektedir. Son yıllarda artan iş talebi ve büyümekte olan inşaat sektörü konusunda 
                  yaptığımız çalışmalar, şirketin bilgi birikimi ve sahip olduğu uzman kadrosunu, inşaat, 
                  proje alanında çalışmaya yöneltmiştir. Aklar İnşaat, kurumsal ve bireysel müşterilerden 
                  gelen talepler doğrultusunda standartlara uygun, bilimsel ve güvenilir mühendislik, 
                  inşaat işleri hazırlayan bir şirkettir.
                </p>
                <p>
                  Sunduğumuz kaliteli, etkin hizmetlerimizle bugün; bölgemizde faaliyet gösteren seçkin 
                  ve tercih edilen hizmet kuruluşlarından biri olmanın haklı gururunu yaşamaktayız.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Highlight Box */}
      <section className="pb-16 lg:pb-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="bg-[#8B0000] p-8 lg:p-10">
            <p className="text-white text-sm lg:text-base leading-relaxed">
              Hem ulaştığımız kitle hemde takım arkadaşlarımız arasında sinerji yaratabilmek için 
              benimsediğimiz değerler; Müşterilerimizin kalite, fiyat, teslim süresi ve yüksek 
              standartlardaki beklentilerini sorunsuz bir şekilde karşılamak.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
