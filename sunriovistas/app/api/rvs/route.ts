import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const rvs = await prisma.rV.findMany({
      where: { isActive: true },
      include: {
        priceRules: {
          where: { isActive: true },
          orderBy: { startDate: 'asc' },
        },
      },
      orderBy: { sortOrder: 'asc' },
    })

    return NextResponse.json({ data: rvs })
  } catch (err) {
    console.error('[GET /api/rvs]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
