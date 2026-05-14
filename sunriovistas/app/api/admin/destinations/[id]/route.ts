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

  const destination = await prisma.destination.findUnique({
    where: { id: params.id },
    include: { _count: { select: { bookings: true } } },
  })

  if (!destination) {
    return NextResponse.json({ error: 'Destination not found' }, { status: 404 })
  }

  return NextResponse.json({ data: destination })
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

  const allowedFields = [
    'name', 'slug', 'description', 'longDescription', 'location',
    'campgroundFeeEstimate', 'campgroundFeeNote', 'campgroundFeeDisclaimer',
    'hookupAvailable', 'activities', 'highlights', 'images', 'emoji',
    'isActive', 'sortOrder',
  ]

  const data: Record<string, unknown> = {}
  for (const field of allowedFields) {
    if (field in body) data[field] = body[field]
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const destination = await prisma.destination.update({
    where: { id: params.id },
    data,
  })

  return NextResponse.json({ data: destination })
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerAuthSession()
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  await prisma.destination.update({
    where: { id: params.id },
    data: { isActive: false },
  })

  return NextResponse.json({ data: { success: true } })
}
