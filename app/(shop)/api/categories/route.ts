import { verifyToken } from "@/lib/auth"
import { uploadSingleImage, validateImage } from "@/lib/cloudinary"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/utils"
import { NextRequest, NextResponse } from "next/server"



export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  })
  return NextResponse.json(categories)
}

export async function POST(request: NextRequest) {
  try {
    // ── Auth ─────────────────────────────────────────────
    const token   = request.cookies.get('token')?.value
    const payload = token ? verifyToken(token) : null
    if (!payload || payload.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // ── Parse FormData ────────────────────────────────────
    const formData = await request.formData()
    const name     = formData.get('name') as string | null
    const file     = formData.get('image') as File | null

    if (!name?.trim()) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      )
    }

    // ── Validate + upload single image ────────────────────
    let imageUrl:      string | null = null
    let imagePublicId: string | null = null
    console.log("before save image")
    if (file && file.size > 0) {
      // validate first — returns error string or null
      const validationError = validateImage(file)
      if (validationError) {
        return NextResponse.json({ error: validationError }, { status: 400 })
      }

      // upload to cloudinary/categories folder
      const uploaded = await uploadSingleImage(file, 'categories')
      imageUrl       = uploaded.url
      imagePublicId  = uploaded.publicId
    }
    // ── Save to DB ────────────────────────────────────────
    const slug     = slugify(name)
    const existing = await prisma.category.findUnique({ where: { slug } })
    if (existing) {
      return NextResponse.json(
        { error: 'Category already exists' },
        { status: 409 }
      )
    }

    const category = await prisma.category.create({
      data: { name: name.trim(), slug, imageUrl, imagePublicId },
    })

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('[POST /api/categories]', error)
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 })
  }
}