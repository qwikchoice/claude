import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const destinations = await prisma.destination.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({ data: destinations })
  } catch (err) {
    console.error('[GET /api/destinations]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
