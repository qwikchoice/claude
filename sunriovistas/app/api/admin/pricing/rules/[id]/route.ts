import { NextResponse } from 'next/server'
import { getServerAuthSession, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerAuthSession()
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') ?? 'rv'

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (type === 'addon') {
    const allowedFields = ['startDate', 'endDate', 'price', 'isActive']
    const data: Record<string, unknown> = {}
    for (const f of allowedFields) {
      if (f in body) {
        data[f] = f === 'startDate' || f === 'endDate' ? new Date(body[f] as string) : body[f]
      }
    }
    const rule = await prisma.addOnPriceRule.update({ where: { id: params.id }, data })
    return NextResponse.json({ data: rule })
  }

  const allowedFields = ['name', 'startDate', 'endDate', 'nightlyRate', 'weekendRate', 'minNights', 'isActive']
  const data: Record<string, unknown> = {}
  for (const f of allowedFields) {
    if (f in body) {
      data[f] = f === 'startDate' || f === 'endDate' ? new Date(body[f] as string) : body[f]
    }
  }

  const rule = await prisma.rVPriceRule.update({ where: { id: params.id }, data })
  return NextResponse.json({ data: rule })
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerAuthSession()
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const type = searchParams.get('type') ?? 'rv'

  if (type === 'addon') {
    await prisma.addOnPriceRule.delete({ where: { id: params.id } })
  } else {
    await prisma.rVPriceRule.delete({ where: { id: params.id } })
  }

  return NextResponse.json({ data: { success: true } })
}
