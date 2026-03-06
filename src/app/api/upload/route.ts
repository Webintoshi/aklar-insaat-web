import { NextRequest, NextResponse } from 'next/server'
import { uploadToR2 } from '@/lib/r2'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    // Auth kontrolü
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'uploads'
    
    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 })
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Sadece görsel dosyaları yüklenebilir' }, { status: 400 })
    }

    // Dosya boyutu kontrolü (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Dosya boyutu 10MB\'dan küçük olmalıdır' }, { status: 400 })
    }

    // Buffer'a çevir
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // R2'ye yükle
    const fileName = `${folder}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '-')}`
    const url = await uploadToR2(buffer, fileName, file.type)

    return NextResponse.json({ 
      success: true, 
      url,
      fileName 
    })

  } catch (error: any) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error.message || 'Yükleme hatası' },
      { status: 500 }
    )
  }
}

// Boyut limitini artır
