import { NextResponse } from 'next/server'
import { getServerAuthSession, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerAuthSession()
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const destinations = await prisma.destination.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: { select: { bookings: true } },
    },
  })

  return NextResponse.json({ data: destinations })
}

export async function POST(request: Request) {
  const session = await getServerAuthSession()
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    name: string
    slug: string
    description: string
    longDescription?: string
    location: string
    campgroundFeeEstimate: string
    campgroundFeeNote?: string
    campgroundFeeDisclaimer?: string
    hookupAvailable?: boolean
    activities?: string[]
    highlights?: string[]
    images?: string[]
    emoji: string
    isActive?: boolean
    sortOrder?: number
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.name || !body.slug || !body.description || !body.location || !body.emoji) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const existing = await prisma.destination.findUnique({ where: { slug: body.slug } })
  if (existing) {
    return NextResponse.json({ error: 'Slug already in use' }, { status: 409 })
  }

  const destination = await prisma.destination.create({
    data: {
      name: body.name,
      slug: body.slug,
      description: body.description,
      longDescription: body.longDescription,
      location: body.location,
      campgroundFeeEstimate: body.campgroundFeeEstimate ?? '',
      campgroundFeeNote: body.campgroundFeeNote,
      campgroundFeeDisclaimer: body.campgroundFeeDisclaimer,
      hookupAvailable: body.hookupAvailable ?? false,
      activities: body.activities ?? [],
      highlights: body.highlights ?? [],
      images: body.images ?? [],
      emoji: body.emoji,
      isActive: body.isActive ?? true,
      sortOrder: body.sortOrder ?? 0,
    },
  })

  return NextResponse.json({ data: destination }, { status: 201 })
}
