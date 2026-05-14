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

  const blockouts = await prisma.calendarBlockout.findMany({
    where: rvId ? { rvId } : undefined,
    orderBy: { startDate: 'asc' },
    include: { rv: { select: { name: true, emoji: true } } },
  })

  return NextResponse.json({ data: blockouts })
}

export async function POST(request: Request) {
  const session = await getServerAuthSession()
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { rvId: string; startDate: string; endDate: string; reason?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.rvId || !body.startDate || !body.endDate) {
    return NextResponse.json({ error: 'rvId, startDate, and endDate are required' }, { status: 400 })
  }

  const start = new Date(body.startDate)
  const end = new Date(body.endDate)
  if (end < start) {
    return NextResponse.json({ error: 'End date must be on or after start date' }, { status: 400 })
  }

  const blockout = await prisma.calendarBlockout.create({
    data: {
      rvId: body.rvId,
      startDate: start,
      endDate: end,
      reason: body.reason ?? null,
    },
    include: { rv: { select: { name: true, emoji: true } } },
  })

  return NextResponse.json({ data: blockout }, { status: 201 })
}

export async function DELETE(request: Request) {
  const session = await getServerAuthSession()
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) {
    return NextResponse.json({ error: 'id query param required' }, { status: 400 })
  }

  await prisma.calendarBlockout.delete({ where: { id } })
  return NextResponse.json({ data: { success: true } })
}
