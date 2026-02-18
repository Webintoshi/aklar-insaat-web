import { S3Client } from '@aws-sdk/client-s3'
import { Upload } from '@aws-sdk/lib-storage'

// R2 yapılandırması
const R2_ENDPOINT = process.env.R2_ENDPOINT || `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME
const R2_PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL

// Yapılandırma kontrolü
function validateConfig() {
  if (!R2_ACCESS_KEY_ID) throw new Error('R2_ACCESS_KEY_ID is not defined')
  if (!R2_SECRET_ACCESS_KEY) throw new Error('R2_SECRET_ACCESS_KEY is not defined')
  if (!R2_BUCKET_NAME) throw new Error('R2_BUCKET_NAME is not defined')
  if (!R2_PUBLIC_URL) throw new Error('NEXT_PUBLIC_R2_PUBLIC_URL is not defined')
  if (!R2_ENDPOINT) throw new Error('R2_ENDPOINT or R2_ACCOUNT_ID is not defined')
}

const s3Client = new S3Client({
  region: 'auto',
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID!,
    secretAccessKey: R2_SECRET_ACCESS_KEY!,
  },
  forcePathStyle: true,
})

export async function uploadToR2(
  file: Buffer,
  fileName: string,
  contentType: string
): Promise<string> {
  // Yapılandırmayı kontrol et
  validateConfig()

  const key = `uploads/${Date.now()}-${fileName}`

  try {
    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: file,
        ContentType: contentType,
      },
    })

    await upload.done()

    const publicUrl = `${R2_PUBLIC_URL}/${key}`
    return publicUrl
  } catch (error) {
    console.error('R2 Upload Error:', error)
    throw new Error(`Failed to upload to R2: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function deleteFromR2(url: string): Promise<void> {
  validateConfig()

  const key = url.replace(`${R2_PUBLIC_URL}/`, '')
  
  try {
    const { DeleteObjectCommand } = await import('@aws-sdk/client-s3')
    
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
      })
    )
  } catch (error) {
    console.error('R2 Delete Error:', error)
    throw new Error(`Failed to delete from R2: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}
