import { NextResponse } from 'next/server'
import { uploadToR2 } from '@/lib/r2'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json({ error: 'Dosya bulunamadı' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const url = await uploadToR2(buffer, file.name, file.type)

    return NextResponse.json({ url, success: true })
  } catch (error) {
    console.error('R2 Upload Error:', error)
    return NextResponse.json({ error: 'Yükleme hatası' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ 
    message: 'R2 Test Endpoint - POST ile dosya yükleyin',
    expected: {
      file: 'File tipinde bir dosya'
    }
  })
}
