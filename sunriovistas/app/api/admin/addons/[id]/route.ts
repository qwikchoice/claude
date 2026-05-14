import { NextResponse } from 'next/server'
import { getServerAuthSession, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerAuthSession()
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const addOn = await prisma.addOn.findUnique({
    where: { id: params.id },
    include: {
      priceRules: { orderBy: { startDate: 'asc' } },
      _count: { select: { bookingAddOns: true } },
    },
  })

  if (!addOn) {
    return NextResponse.json({ error: 'Add-on not found' }, { status: 404 })
  }

  return NextResponse.json({ data: addOn })
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerAuthSession()
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const allowedFields = ['name', 'slug', 'description', 'longDescription', 'basePrice', 'isActive', 'sortOrder']
  const data: Record<string, unknown> = {}
  for (const field of allowedFields) {
    if (field in body) data[field] = body[field]
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const addOn = await prisma.addOn.update({ where: { id: params.id }, data })
  return NextResponse.json({ data: addOn })
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerAuthSession()
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.addOn.update({ where: { id: params.id }, data: { isActive: false } })
  return NextResponse.json({ data: { success: true } })
}
