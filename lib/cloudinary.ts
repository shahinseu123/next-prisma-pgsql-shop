// src/lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key:    process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
})

export interface UploadResult {
  url:      string
  publicId: string
}

// ─────────────────────────────────────────────────────────
// Core upload function — takes a Buffer, returns url + publicId
// ─────────────────────────────────────────────────────────
function uploadToCloudinary(
  buffer: Buffer,
  folder: string
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder,
          transformation: [
            { quality: 'auto' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error || !result) return reject(error)
          resolve({
            url:      result.secure_url,
            publicId: result.public_id,
          })
        }
      )
      .end(buffer)
  })
}

// ─────────────────────────────────────────────────────────
// Single image upload — used for category
// ─────────────────────────────────────────────────────────
export async function uploadSingleImage(
  file: File,
  folder = 'categories'
): Promise<UploadResult> {
  const buffer = Buffer.from(await file.arrayBuffer())
  return uploadToCloudinary(buffer, folder)
}

// ─────────────────────────────────────────────────────────
// Multiple image upload — used for products
// Runs all uploads in parallel with Promise.all
// ─────────────────────────────────────────────────────────
export async function uploadMultipleImages(
  files: File[],
  folder = 'products'
): Promise<UploadResult[]> {
  const uploads = files.map(async (file) => {
    const buffer = Buffer.from(await file.arrayBuffer())
    return uploadToCloudinary(buffer, folder)
  })
  return Promise.all(uploads)   // all uploads run at the same time
}

// ─────────────────────────────────────────────────────────
// Validate image before uploading
// Call this before uploadSingleImage or uploadMultipleImages
// ─────────────────────────────────────────────────────────
export function validateImage(file: File): string | null {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
  const maxSize      = 5 * 1024 * 1024 // 5MB

  if (!allowedTypes.includes(file.type)) {
    return 'Invalid file type. Only JPEG, PNG, WebP and GIF allowed.'
  }
  if (file.size > maxSize) {
    return 'Image too large. Maximum size is 5MB.'
  }
  return null // null means valid
}

// ─────────────────────────────────────────────────────────
// Delete image — call when replacing or deleting
// ─────────────────────────────────────────────────────────
export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId)
}

export async function deleteMultipleImages(publicIds: string[]): Promise<void> {
  await Promise.all(publicIds.map(deleteImage))
}