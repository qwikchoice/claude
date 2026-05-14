import { NextResponse } from 'next/server'
import { getServerAuthSession, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/rvs
export async function GET() {
  const session = await getServerAuthSession()
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rvs = await prisma.rV.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      priceRules: { orderBy: { startDate: 'asc' } },
      blockouts: { orderBy: { startDate: 'asc' } },
      _count: { select: { bookings: true } },
    },
  })

  return NextResponse.json({ data: rvs })
}

// POST /api/admin/rvs
export async function POST(request: Request) {
  const session = await getServerAuthSession()
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    name: string
    slug: string
    tagline: string
    theme?: string
    description: string
    longDescription?: string
    maxGuests: number
    bedrooms?: number
    bathrooms?: number
    amenities?: string[]
    images?: string[]
    emoji: string
    colorScheme?: string
    isActive?: boolean
    sortOrder?: number
    bestFor?: string[]
    vibe?: string[]
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.name || !body.slug || !body.tagline || !body.description || !body.emoji || !body.maxGuests) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const existing = await prisma.rV.findUnique({ where: { slug: body.slug } })
  if (existing) {
    return NextResponse.json({ error: 'Slug already in use' }, { status: 409 })
  }

  const rv = await prisma.rV.create({
    data: {
      name: body.name,
      slug: body.slug,
      tagline: body.tagline,
      theme: body.theme ?? '',
      description: body.description,
      longDescription: body.longDescription,
      maxGuests: body.maxGuests,
      bedrooms: body.bedrooms ?? 1,
      bathrooms: body.bathrooms ?? 1,
      amenities: body.amenities ?? [],
      images: body.images ?? [],
      emoji: body.emoji,
      colorScheme: body.colorScheme ?? '',
      isActive: body.isActive ?? true,
      sortOrder: body.sortOrder ?? 0,
      bestFor: body.bestFor ?? [],
      vibe: body.vibe ?? [],
    },
  })

  return NextResponse.json({ data: rv }, { status: 201 })
}
