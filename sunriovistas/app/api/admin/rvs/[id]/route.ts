import { NextResponse } from 'next/server'
import { getServerAuthSession, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

// GET /api/admin/rvs/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerAuthSession()
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rv = await prisma.rV.findUnique({
    where: { id: params.id },
    include: {
      priceRules: { orderBy: { startDate: 'asc' } },
      blockouts: { orderBy: { startDate: 'asc' } },
      _count: { select: { bookings: true } },
    },
  })

  if (!rv) {
    return NextResponse.json({ error: 'RV not found' }, { status: 404 })
  }

  return NextResponse.json({ data: rv })
}

// PATCH /api/admin/rvs/[id]
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

  const allowedFields = [
    'name', 'tagline', 'theme', 'description', 'longDescription',
    'maxGuests', 'bedrooms', 'bathrooms', 'amenities', 'images',
    'emoji', 'colorScheme', 'isActive', 'sortOrder', 'bestFor', 'vibe',
  ]

  const updateData: Record<string, unknown> = {}
  for (const key of allowedFields) {
    if (key in body) {
      updateData[key] = body[key]
    }
  }

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const rv = await prisma.rV.update({
    where: { id: params.id },
    data: updateData,
  })

  return NextResponse.json({ data: rv })
}

// DELETE /api/admin/rvs/[id] — soft delete (deactivate)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerAuthSession()
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rv = await prisma.rV.update({
    where: { id: params.id },
    data: { isActive: false },
  })

  return NextResponse.json({ data: rv })
}
