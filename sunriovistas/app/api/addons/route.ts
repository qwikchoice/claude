import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const addOns = await prisma.addOn.findMany({
      where: { isActive: true },
      include: {
        priceRules: {
          where: { isActive: true },
          orderBy: { startDate: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({ data: addOns })
  } catch (err) {
    console.error('[GET /api/addons]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
