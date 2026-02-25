'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  PencilRuler, 
  ClipboardList, 
  HardHat, 
  Trees,
  CheckCircle,
  Leaf,
  Scale,
  Home,
  UtensilsCrossed,
  BedDouble,
  Baby,
  Bath,
  Square,
  ArrowRight
} from 'lucide-react'

// Hizmet kartları verisi
const services = [
  {
    icon: PencilRuler,
    title: 'Tasarım',
    description: 'İşlevsellik ve bütçe yönetimi gibi temel konuları doğru kurgulayarak başlayın.',
  },
  {
    icon: ClipboardList,
    title: 'Proje',
    description: 'Kalite, iyi tasarlanmış bir proje ile başlar; iş programı dahilinde hayat bulur.',
  },
  {
    icon: HardHat,
    title: 'İnşaat',
    description: 'A\'dan Z\'ye tüm inşaat ve kurulum işlerini, kalite kontrol ile yürüten profesyonel ekibimize bırakın.',
  },
  {
    icon: Trees,
    title: 'Ahşap İmalat',
    description: 'Projelerinizde planlanan sabit/hareketli mobilyaları, tasarımcınızın üretimi ile edinin.',
  },
]

// İlkeler kartları verisi
const principles = [
  {
    icon: CheckCircle,
    title: 'Kalite',
    description: 'Sektörel sorunların aşılması, mutlu müşteriler ile sürdürülebilir iş ilişkileri yürütebilmek için kaliteli hizmet ve projeler üretiyoruz.',
  },
  {
    icon: Leaf,
    title: 'Çevre',
    description: 'Aklar İnşaat taahhüt ettiği projelerde, yasal çevre mevzuatlarını tüm yaptırımları yerine getirmeye azami seviyede özen gösterir.',
  },
  {
    icon: Scale,
    title: 'Eşitlik',
    description: 'Eşitlik, çeşitlilik ve kapsayıcılık (E&C&K) politikamız Aklar İnşaat olarak iş yapma, kariyer oluşturma şeklimizi tanımlar.',
  },
]

// Tab menü verisi
const tabs = [
  { id: 'salon', label: 'Salon', icon: Home },
  { id: 'mutfak', label: 'Mutfak', icon: UtensilsCrossed },
  { id: 'yatak', label: 'Yatak Odası', icon: BedDouble },
  { id: 'cocuk', label: 'Çocuk Odası', icon: Baby },
  { id: 'banyo', label: 'Banyo', icon: Bath },
  { id: 'balkon', label: 'BALKON', icon: Square },
]

const tabContent: Record<string, { title: string; features: string[]; image: string }> = {
  salon: {
    title: 'Salon',
    features: [
      'Geniş ve ferah yaşam alanları',
      'Modern aydınlatma sistemleri',
      'Akıllı ev entegrasyonu',
      'Yüksek tavan ve büyük pencereler',
    ],
    image: '/images/hero-banner.jpg',
  },
  mutfak: {
    title: 'Mutfak',
    features: [
      'Gömme dolap sistemleri',
      'Ankastre beyaz eşya hazırlığı',
      'Granit/tezgah seçenekleri',
      'Fonksiyonel mutfak adaları',
    ],
    image: '/images/hero-banner-2.jpg',
  },
  yatak: {
    title: 'Yatak Odası',
    features: [
      'Geniş giyinme dolapları',
      'En-suite banyo bağlantısı',
      'Ses yalıtımlı duvarlar',
      'Doğal aydınlatma',
    ],
    image: '/images/about-building.jpg',
  },
  cocuk: {
    title: 'Çocuk Odası',
    features: [
      'Güvenlik önlemleri',
      'Ergonomik mobilya seçenekleri',
      'Eğlenceli renk paleti',
      'Büyümeye uygun tasarım',
    ],
    image: '/images/hero-banner.jpg',
  },
  banyo: {
    title: 'Banyo',
    features: [
      'Duşakabin ve küvet seçenekleri',
      'Hilton lavabo tasarımı',
      'Isıtmalı yer döşemesi',
      'Modern batarya ve aksesuarlar',
    ],
    image: '/images/hero-banner-2.jpg',
  },
  balkon: {
    title: 'Balkon',
    features: [
      'Geniş kullanım alanı',
      'Cam korkuluk sistemleri',
      'Dış mekan döşeme seçenekleri',
      'Manzara odaklı tasarım',
    ],
    image: '/images/about-building.jpg',
  },
}

export default function TaahhutPage() {
  const [activeTab, setActiveTab] = useState('salon')

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-[#1E3A5F] py-12 lg:py-16 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 opacity-10">
          <img
            src="/images/about-building.jpg"
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 relative z-10">
          <div className="max-w-3xl">
            <nav className="flex items-center gap-2 text-sm text-white/60 mb-6">
              <a href="/" className="hover:text-white transition-colors">Anasayfa</a>
              <span>/</span>
              <span className="text-white">Taahhüt</span>
            </nav>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Taahhüt
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              Uzman ekibimizle A'dan Z'ye tüm inşaat ve taahhüt işlerinizi profesyonelce yürütüyoruz.
              Kalite standartlarından ödün vermeden projelerinizi hayata geçiriyoruz.
            </p>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="py-12 md:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <p className="text-gray-600 text-sm md:text-base leading-relaxed">
              Müşteri memnuniyeti ve ödeme kolaylığı prensibi ile kusursuz ve kaliteli hizmeti hedefleyen Aklar İnşaat profesyonel ve eğitimli ekibi ile birlikte projelendirme, inşaat taahhüt 
              (uygulama, duvar, sıva, alçı, boya, seramik, elektrik, su tesisatı, demir ve çelik işleri, alüminyum, cam işleri) ve mobilya üretimini kendi bünyesinde çözümlemektedir.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white border border-gray-200 rounded-lg p-6 text-center group hover:shadow-lg transition-all duration-300 hover:border-[#CF000C]/30"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-3 group-hover:text-[#CF000C] transition-colors">
                  {service.title}
                </h3>
                <div className="w-12 h-0.5 bg-gray-300 mx-auto mb-4 group-hover:bg-[#CF000C] transition-colors" />
                <p className="text-gray-500 text-sm leading-relaxed">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Principles Section */}
      <section className="py-12 md:py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-10"
          >
            <p className="text-xs font-medium tracking-[0.2em] text-gray-400 uppercase mb-2">
              İlke ve Politikalarımız
            </p>
            <h2 className="text-xl font-semibold text-gray-800">
              Neleri Önemsiyoruz?
            </h2>
          </motion.div>

          {/* Principles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {principles.map((principle, index) => (
              <motion.div
                key={principle.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white border border-gray-200 rounded-lg p-8 text-center group hover:shadow-lg transition-all duration-300 hover:border-[#CF000C]/30"
              >
                <h3 className="text-lg font-semibold text-gray-800 mb-3 group-hover:text-[#CF000C] transition-colors">
                  {principle.title}
                </h3>
                <div className="w-12 h-0.5 bg-gray-300 mx-auto mb-4 group-hover:bg-[#CF000C] transition-colors" />
                <p className="text-gray-500 text-sm leading-relaxed">
                  {principle.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-12 md:py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-8">
            <div className="flex flex-wrap gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      px-4 py-3 text-sm font-medium transition-all duration-300 relative
                      flex items-center gap-2
                      ${isActive 
                        ? 'text-gray-900' 
                        : 'text-gray-500 hover:text-gray-700'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#CF000C]"
                      />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center"
          >
            <div>
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {tabContent[activeTab].title}
              </h3>
              <ul className="space-y-3">
                {tabContent[activeTab].features.map((feature, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex items-center gap-3 text-gray-600"
                  >
                    <ArrowRight className="w-4 h-4 text-[#CF000C] shrink-0" />
                    <span>{feature}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            <div className="relative h-64 md:h-80 rounded-xl overflow-hidden shadow-lg">
              <img
                src={tabContent[activeTab].image}
                alt={tabContent[activeTab].title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>
    </main>
  )
}
