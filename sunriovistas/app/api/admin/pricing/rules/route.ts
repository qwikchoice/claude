import { NextResponse } from 'next/server'
import { getServerAuthSession, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const session = await getServerAuthSession()
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const rvId = searchParams.get('rvId')
  const addOnId = searchParams.get('addOnId')

  if (addOnId) {
    const rules = await prisma.addOnPriceRule.findMany({
      where: { addOnId },
      orderBy: { startDate: 'asc' },
      include: { addOn: { select: { name: true } } },
    })
    return NextResponse.json({ data: rules })
  }

  const rules = await prisma.rVPriceRule.findMany({
    where: rvId ? { rvId } : undefined,
    orderBy: { startDate: 'asc' },
    include: { rv: { select: { name: true, emoji: true } } },
  })

  return NextResponse.json({ data: rules })
}

export async function POST(request: Request) {
  const session = await getServerAuthSession()
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    type: 'rv' | 'addon'
    rvId?: string
    addOnId?: string
    name: string
    startDate: string
    endDate: string
    nightlyRate?: number
    weekendRate?: number
    price?: number
    minNights?: number
    isActive?: boolean
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.type || !body.name || !body.startDate || !body.endDate) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const start = new Date(body.startDate)
  const end = new Date(body.endDate)
  if (end <= start) {
    return NextResponse.json({ error: 'End date must be after start date' }, { status: 400 })
  }

  if (body.type === 'addon') {
    if (!body.addOnId || body.price == null) {
      return NextResponse.json({ error: 'addOnId and price required for addon rule' }, { status: 400 })
    }
    const rule = await prisma.addOnPriceRule.create({
      data: {
        addOnId: body.addOnId,
        startDate: start,
        endDate: end,
        price: body.price,
        isActive: body.isActive ?? true,
      },
    })
    return NextResponse.json({ data: rule }, { status: 201 })
  }

  if (!body.rvId || body.nightlyRate == null) {
    return NextResponse.json({ error: 'rvId and nightlyRate required for rv rule' }, { status: 400 })
  }

  const rule = await prisma.rVPriceRule.create({
    data: {
      rvId: body.rvId,
      name: body.name,
      startDate: start,
      endDate: end,
      nightlyRate: body.nightlyRate,
      weekendRate: body.weekendRate ?? null,
      minNights: body.minNights ?? 2,
      isActive: body.isActive ?? true,
    },
  })

  return NextResponse.json({ data: rule }, { status: 201 })
}
