'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, Loader2, Plus, Trash2, GripVertical, Save } from 'lucide-react'
import Link from 'next/link'

interface InfoCard {
  id?: string
  section_id?: string
  icon: string
  title: string
  value: string
  suffix: string
  animation_type: 'countUp' | 'static'
  target_number: number | null
  order_index: number
}

const iconOptions = [
  'Building', 'Users', 'Award', 'TrendingUp', 'Home', 'Shield', 'CheckCircle',
  'Star', 'Heart', 'Clock', 'Calendar', 'MapPin', 'Phone', 'Mail'
]

export default function CardsManagerPage({ params }: { params: { _id: string } }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [sectionName, setSectionName] = useState('')
  const [cards, setCards] = useState<InfoCard[]>([])

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const [{ data: section }, { data: cardsData }] = await Promise.all([
      supabase.from('info_cards_sections').select('name').eq('id', params._id).single(),
      supabase.from('info_cards').select('*').eq('section_id', params._id).order('order_index', { ascending: true }),
    ])
    
    if (section) setSectionName(section.name)
    setCards(cardsData || [])
    setLoading(false)
  }

  const addCard = () => {
    const newCard = {
      section_id: params._id,
      icon: 'Building',
      title: '',
      value: '',
      suffix: '',
      animation_type: 'countUp' as const,
      target_number: null,
      order_index: cards.length,
    }
    setCards([...cards, newCard])
  }

  const removeCard = async (index: number, id?: string) => {
    if (id) {
      await supabase.from('info_cards').delete().eq('id', id)
    }
    setCards(cards.filter((_, i) => i !== index))
  }

  const updateCard = (index: number, field: keyof InfoCard, value: any) => {
    const newCards = [...cards]
    newCards[index] = { ...newCards[index], [field]: value }
    setCards(newCards)
  }

  const handleSave = async () => {
    setSaving(true)
    
    for (const card of cards) {
      const payload = {
        section_id: params._id,
        icon: card.icon,
        title: card.title,
        value: card.value,
        suffix: card.suffix || null,
        animation_type: card.animation_type,
        target_number: card.target_number,
        order_index: cards.indexOf(card),
      }
      
      if (card.id) {
        await supabase.from('info_cards').update(payload).eq('id', card.id)
      } else {
        await supabase.from('info_cards').insert(payload)
      }
    }
    
    setSaving(false)
    router.push('/admin/infocards')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Link href="/admin/infocards" className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Kartları Düzenle</h1>
            <p className="text-gray-500">{sectionName}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={addCard}
            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5 mr-2" />
            Kart Ekle
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Save className="w-5 h-5 mr-2" />
            )}
            Kaydet
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200"
          >
            <div className="flex items-start gap-4">
              <div className="p-2 text-gray-400 cursor-move">
                <GripVertical className="w-5 h-5" />
              </div>
              
              <div className="flex-1 grid md:grid-cols-6 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">İkon</label>
                  <select
                    value={card.icon}
                    onChange={(e) => updateCard(index, 'icon', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  >
                    {iconOptions.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Başlık</label>
                  <input
                    type="text"
                    value={card.title}
                    onChange={(e) => updateCard(index, 'title', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    placeholder="Tamamlanan Proje"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Değer</label>
                  <input
                    type="text"
                    value={card.value}
                    onChange={(e) => updateCard(index, 'value', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    placeholder="50"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Sonek</label>
                  <input
                    type="text"
                    value={card.suffix || ''}
                    onChange={(e) => updateCard(index, 'suffix', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    placeholder="+"
                  />
                </div>
                
                <div className="flex items-end gap-2">
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Animasyon</label>
                    <select
                      value={card.animation_type}
                      onChange={(e) => updateCard(index, 'animation_type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    >
                      <option value="countUp">Sayı Artışı</option>
                      <option value="static">Sabit</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => removeCard(index, card.id)}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
            
            {card.animation_type === 'countUp' && (
              <div className="mt-3 ml-11">
                <label className="block text-xs font-medium text-gray-500 mb-1">Hedef Sayı (CountUp için)</label>
                <input
                  type="number"
                  value={card.target_number || ''}
                  onChange={(e) => updateCard(index, 'target_number', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                  placeholder="50"
                />
              </div>
            )}
          </div>
        ))}
        
        {cards.length === 0 && (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 mb-4">Henüz kart eklenmemiş.</p>
            <button
              onClick={addCard}
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5 mr-2" />
              İlk Kartı Ekle
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
