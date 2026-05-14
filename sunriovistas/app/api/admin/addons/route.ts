import { NextResponse } from 'next/server'
import { getServerAuthSession, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const session = await getServerAuthSession()
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const addOns = await prisma.addOn.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      priceRules: { orderBy: { startDate: 'asc' } },
      _count: { select: { bookingAddOns: true } },
    },
  })

  return NextResponse.json({ data: addOns })
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
    basePrice: number
    isActive?: boolean
    sortOrder?: number
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.name || !body.slug || !body.description || body.basePrice == null) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const existing = await prisma.addOn.findUnique({ where: { slug: body.slug } })
  if (existing) {
    return NextResponse.json({ error: 'Slug already in use' }, { status: 409 })
  }

  const addOn = await prisma.addOn.create({
    data: {
      name: body.name,
      slug: body.slug,
      description: body.description,
      longDescription: body.longDescription,
      basePrice: body.basePrice,
      isActive: body.isActive ?? true,
      sortOrder: body.sortOrder ?? 0,
    },
  })

  return NextResponse.json({ data: addOn }, { status: 201 })
}
