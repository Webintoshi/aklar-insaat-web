import { Metadata } from 'next'
import Image from 'next/image'
import { CheckCircle, Eye, Target, Award, Users, Building2 } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Kurumsal | Aklar İnşaat',
  description: 'Aklar İnşaat vizyon, misyon ve değerlerimiz. 20 yılı aşkın tecrübemizle Ordu\'da kaliteli konut projeleri üretiyoruz.',
  keywords: ['Aklar İnşaat', 'kurumsal', 'vizyon', 'misyon', 'hakkımızda', 'Ordu inşaat'],
}

const values = [
  {
    icon: Award,
    title: 'Kalite',
    description: 'En yüksek kalite standartlarında projeler üretmek için sürekli kendimizi geliştiriyoruz.'
  },
  {
    icon: Users,
    title: 'Müşteri Memnuniyeti',
    description: 'Müşterilerimizin beklentilerini aşmak için titizlikle çalışıyoruz.'
  },
  {
    icon: CheckCircle,
    title: 'Güvenilirlik',
    description: 'Sözümüzü tutuyor, projelerimizi zamanında ve eksiksiz teslim ediyoruz.'
  },
  {
    icon: Building2,
    title: 'İnovasyon',
    description: 'Modern mimari ve teknolojileri kullanarak yenilikçi projeler üretiyoruz.'
  }
]

export default function KurumsalPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-[#1E3A5F] py-12 lg:py-16 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/images/about-building.jpg"
            alt=""
            fill
            className="object-cover"
          />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
          <div className="max-w-3xl">
            <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
              <a href="/" className="hover:text-white transition-colors">Anasayfa</a>
              <span>/</span>
              <span className="text-white">Kurumsal</span>
            </nav>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Kurumsal
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              20 yılı aşkın tecrübemizle hayallerinizi inşa ediyoruz. 
              Kalite, güven ve müşteri memnuniyeti ilkelerimizden ödün vermeden büyümeye devam ediyoruz.
            </p>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left: Image */}
            <div className="relative">
              <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/about-building.jpg"
                  alt="Aklar İnşaat - Kaliteli Konut Projeleri"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
              {/* Stats Card */}
              <div className="absolute -bottom-6 -right-6 lg:-right-12 bg-[#CF000C] text-white p-6 lg:p-8 rounded-xl shadow-xl">
                <div className="text-4xl lg:text-5xl font-bold mb-2">20+</div>
                <div className="text-sm lg:text-base text-white/90">Yıllık Tecrübe</div>
              </div>
            </div>

            {/* Right: Content */}
            <div>
              {/* Subtitle with line */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-1 bg-[#CF000C]" />
                <span className="text-[#CF000C] text-sm font-bold tracking-wider uppercase">
                  Hakkımızda
                </span>
              </div>

              <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-6">
                Hız ve Kalite Bizim İşimiz
              </h2>

              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Aklar İnşaat, uzun yıllardır Ordu'da hizmet vermektedir. "Hız ve Kalite Bizim İşimiz" 
                  sloganıyla sektöre adım atan firmamız, her geçen gün kendini yenileyerek büyümeye devam 
                  etmektedir.
                </p>
                <p>
                  Son yıllarda artan iş talebi ve büyümekte olan inşaat sektörü konusunda 
                  yaptığımız çalışmalar, şirketin bilgi birikimi ve sahip olduğu uzman kadrosunu, inşaat, 
                  proje alanında çalışmaya yöneltmiştir.
                </p>
                <p>
                  Aklar İnşaat, kurumsal ve bireysel müşterilerden gelen talepler doğrultusunda 
                  standartlara uygun, bilimsel ve güvenilir mühendislik, inşaat işleri hazırlayan bir şirkettir.
                </p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-6 mt-8 pt-8 border-t border-gray-100">
                <div>
                  <div className="text-2xl lg:text-3xl font-bold text-[#1E3A5F]">50+</div>
                  <div className="text-sm text-gray-500 mt-1">Tamamlanan Proje</div>
                </div>
                <div>
                  <div className="text-2xl lg:text-3xl font-bold text-[#1E3A5F]">1000+</div>
                  <div className="text-sm text-gray-500 mt-1">Mutlu Müşteri</div>
                </div>
                <div>
                  <div className="text-2xl lg:text-3xl font-bold text-[#1E3A5F]">25+</div>
                  <div className="text-sm text-gray-500 mt-1">Uzman Personel</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {/* Vision */}
            <div className="bg-white p-8 lg:p-10 rounded-2xl shadow-lg">
              <div className="w-14 h-14 bg-[#CF000C]/10 rounded-xl flex items-center justify-center mb-6">
                <Eye className="w-7 h-7 text-[#CF000C]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Vizyonumuz</h3>
              <p className="text-gray-600 leading-relaxed">
                İnşaat sektöründe yenilikçi ve sürdürülebilir projelerle öncü olmak, 
                müşterilerimizin yaşam kalitesini artıran yaşam alanları tasarlamak ve 
                bölgenin en güvenilir inşaat firması olmaktır.
              </p>
            </div>

            {/* Mission */}
            <div className="bg-white p-8 lg:p-10 rounded-2xl shadow-lg">
              <div className="w-14 h-14 bg-[#1E3A5F]/10 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-[#1E3A5F]" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Misyonumuz</h3>
              <p className="text-gray-600 leading-relaxed">
                Modern mimari anlayışı, kaliteli işçilik ve zamanında teslimat ilkeleriyle 
                müşterilerimize değer katan projeler üretmek. Etik değerlere bağlı kalarak 
                sektörde örnek bir firma olmak.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 lg:py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-12 lg:mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="w-12 h-1 bg-[#CF000C]" />
              <span className="text-[#CF000C] text-sm font-bold tracking-wider uppercase">
                Değerlerimiz
              </span>
              <div className="w-12 h-1 bg-[#CF000C]" />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">
              Bizi Biz Yapan Değerler
            </h2>
          </div>

          {/* Values Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {values.map((value, index) => (
              <div 
                key={index}
                className="group p-6 lg:p-8 bg-white border border-gray-100 rounded-2xl hover:shadow-xl hover:border-[#CF000C]/20 transition-all duration-300"
              >
                <div className="w-14 h-14 bg-[#CF000C]/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-[#CF000C] transition-colors duration-300">
                  <value.icon className="w-7 h-7 text-[#CF000C] group-hover:text-white transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{value.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us / Highlight Section */}
      <section className="py-16 lg:py-24 bg-[#1E3A5F]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Neden Aklar İnşaat?
            </h2>
            <p className="text-lg text-white/80 leading-relaxed mb-10">
              Hem ulaştığımız kitle hem de takım arkadaşlarımız arasında sinerji yaratabilmek için 
              benimsediğimiz değerler; Müşterilerimizin kalite, fiyat, teslim süresi ve yüksek 
              standartlardaki beklentilerini sorunsuz bir şekilde karşılamak.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a 
                href="/projeler" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-[#CF000C] text-white font-semibold rounded-lg hover:bg-[#a8000a] transition-colors"
              >
                Projelerimizi İnceleyin
              </a>
              <a 
                href="/iletisim" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 text-white font-semibold rounded-lg hover:bg-white/20 transition-colors"
              >
                Bize Ulaşın
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
