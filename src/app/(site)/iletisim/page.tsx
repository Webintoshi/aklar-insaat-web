'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  Instagram,
  ArrowUpRight,
  CheckCircle2,
  Building2,
  MessageSquare,
  ChevronDown
} from 'lucide-react'

// İletişim bilgileri
const contactInfo = [
  {
    icon: MapPin,
    title: 'Adres',
    content: 'ŞİRİNEVLER MAH ZÜBEYDE HANIM CAD NO:243/A',
    subContent: 'Ordu / ALTINORDU',
    href: 'https://maps.google.com/?q=ŞİRİNEVLER+MAH+ZÜBEYDE+HANIM+CAD+NO:243/A+Ordu',
    color: 'from-rose-500 to-red-600'
  },
  {
    icon: Phone,
    title: 'Telefon',
    content: '0545 727 72 97',
    subContent: 'Hafta içi 09:00 - 18:00',
    href: 'tel:05457277297',
    color: 'from-blue-500 to-cyan-600'
  },
  {
    icon: Mail,
    title: 'E-posta',
    content: 'aklarinsaat@outlook.com',
    subContent: '7/24 online destek',
    href: 'mailto:aklarinsaat@outlook.com',
    color: 'from-amber-500 to-orange-600'
  }
]

// SSS verisi
const faqs = [
  {
    question: 'Proje görüşmesi için randevu almam gerekiyor mu?',
    answer: 'Evet, size daha iyi hizmet verebilmek için önceden randevu almanızı öneririz. Telefon veya e-posta ile bize ulaşabilirsiniz.'
  },
  {
    question: 'Hangi bölgelerde hizmet veriyorsunuz?',
    answer: 'Ordu ve çevre illerde inşaat ve taahhüt hizmetleri sunuyoruz. Özel projeler için Türkiye genelinde çalışabiliyoruz.'
  },
  {
    question: 'Proje teslim süreniz nedir?',
    answer: 'Projenin kapsamına göre teslim süresi değişmektedir. Standart konut projelerinde ortalama 12-18 ay, büyük ölçekli projelerde detaylı programlama yapıyoruz.'
  },
  {
    question: 'Ödeme seçenekleri nelerdir?',
    answer: 'Peşin ödeme, banka kredisi ve taksitli ödeme seçenekleri sunuyoruz. Detaylı bilgi için ofisimizi ziyaret edebilirsiniz.'
  }
]

export default function IletisimPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    setIsSubmitting(false)
    setIsSubmitted(true)
    setTimeout(() => setIsSubmitted(false), 3000)
  }

  return (
    <main className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-[#1E3A5F] py-16 lg:py-24 overflow-hidden">
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
              <span className="text-white">İletişim</span>
            </nav>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              İletişim
            </h1>
            <p className="text-xl text-white/80 leading-relaxed">
              Hayalinizdeki projeyi konuşalım. Uzman ekibimiz size yardımcı olmak için hazır.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards - Bento Grid */}
      <section className="relative z-20 -mt-8 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {contactInfo.map((info, index) => {
              const Icon = info.icon
              return (
                <motion.a
                  key={info.title}
                  href={info.href}
                  target={info.title === 'Adres' ? '_blank' : undefined}
                  rel={info.title === 'Adres' ? 'noopener noreferrer' : undefined}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="group relative bg-white rounded-2xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
                >
                  {/* Gradient Top Border */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${info.color}`} />
                  
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${info.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Content */}
                  <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">
                    {info.title}
                  </h3>
                  <p className="text-slate-800 font-semibold text-lg mb-1">
                    {info.content}
                  </p>
                  <p className="text-slate-500 text-sm">
                    {info.subContent}
                  </p>

                  {/* Hover Arrow */}
                  <div className="absolute top-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowUpRight className="w-5 h-5 text-slate-400" />
                  </div>
                </motion.a>
              )
            })}
          </div>
        </div>
      </section>

      {/* Map & Form Section - Split Layout */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
            
            {/* Left: Map */}
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                  Bizi Ziyaret Edin
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  Ofisimiz Ordu merkezde, kolay ulaşılabilir bir konumda yer almaktadır. 
                  Kahvemizi içerek projelerinizi konuşalım.
                </p>
              </div>

              {/* Map Container */}
              <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-2xl shadow-slate-200">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3011.7175!2d37.8736!3d40.9833!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDDCsDU4JzYwLjAiTiAzN8KwNTInMjUuMCJF!5e0!3m2!1str!2str!4v1609459200000!5m2!1str!2str"
                  width="100%"
                  height="100%"
                  style={{ border: 0, filter: 'grayscale(20%) contrast(1.1)' }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="absolute inset-0"
                />
                
                {/* Map Overlay Card */}
                <div className="absolute bottom-6 left-6 right-6 bg-white/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#CF000C]/10 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-[#CF000C]" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">Aklar İnşaat Ofisi</p>
                      <p className="text-sm text-slate-500">Şirinevler Mah. Zübeyde Hanım Cad.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Working Hours */}
              <div className="bg-white rounded-xl p-6 border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-5 h-5 text-[#CF000C]" />
                  <h3 className="font-semibold text-slate-800">Çalışma Saatleri</h3>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Pazartesi - Cuma</span>
                    <span className="font-medium text-slate-800">09:00 - 18:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Cumartesi</span>
                    <span className="font-medium text-slate-800">10:00 - 14:00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Pazar</span>
                    <span className="font-medium text-slate-500">Kapalı</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="bg-white rounded-2xl p-8 md:p-10 shadow-xl shadow-slate-200/50 border border-slate-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#CF000C] to-rose-600 flex items-center justify-center">
                    <MessageSquare className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Bize Yazın</h2>
                    <p className="text-slate-500 text-sm">Formu doldurun, size dönüş yapalım</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Adınız Soyadınız</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#CF000C] focus:ring-2 focus:ring-[#CF000C]/20 outline-none transition-all bg-slate-50/50"
                        placeholder="örn: Ahmet Yılmaz"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">E-posta Adresiniz</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#CF000C] focus:ring-2 focus:ring-[#CF000C]/20 outline-none transition-all bg-slate-50/50"
                        placeholder="ornek@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Telefon Numaranız</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#CF000C] focus:ring-2 focus:ring-[#CF000C]/20 outline-none transition-all bg-slate-50/50"
                        placeholder="05XX XXX XX XX"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700">Konu</label>
                      <select
                        value={formData.subject}
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#CF000C] focus:ring-2 focus:ring-[#CF000C]/20 outline-none transition-all bg-slate-50/50"
                        required
                      >
                        <option value="">Seçiniz</option>
                        <option value="proje">Proje Bilgisi</option>
                        <option value="satilik">Satılık Daire</option>
                        <option value="taahhut">Taahhüt Hizmetleri</option>
                        <option value="diger">Diğer</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">Mesajınız</label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-[#CF000C] focus:ring-2 focus:ring-[#CF000C]/20 outline-none transition-all bg-slate-50/50 resize-none"
                      placeholder="Projeniz hakkında kısa bir bilgi verin..."
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-4 bg-gradient-to-r from-[#CF000C] to-rose-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-rose-500/25 transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                      />
                    ) : isSubmitted ? (
                      <>
                        <CheckCircle2 className="w-5 h-5" />
                        Gönderildi
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Gönder
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-800 mb-4">
                Sıkça Sorulan Sorular
              </h2>
              <p className="text-slate-600">
                Aklınıza takılan soruların cevaplarını burada bulabilirsiniz
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="border border-slate-200 rounded-xl overflow-hidden"
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                  >
                    <span className="font-medium text-slate-800 pr-4">{faq.question}</span>
                    <motion.div
                      animate={{ rotate: openFaq === index ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="w-5 h-5 text-slate-400 shrink-0" />
                    </motion.div>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{ 
                      height: openFaq === index ? 'auto' : 0,
                      opacity: openFaq === index ? 1 : 0
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 text-slate-600 leading-relaxed">
                      {faq.answer}
                    </p>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Social Connect Section */}
      <section className="py-16 bg-slate-900">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Bizi Takip Edin</h3>
              <p className="text-slate-400">Projelerimizi ve güncellemeleri sosyal medyadan takip edin</p>
            </div>
            <motion.a
              href="https://www.instagram.com/aklarinsaat.ordu/"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
              className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500 flex items-center justify-center text-white hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300"
            >
              <Instagram className="w-5 h-5" />
            </motion.a>
          </div>
        </div>
      </section>
    </main>
  )
}
