import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculatePrice } from '@/lib/pricing'

export async function POST(request: Request) {
  let body: {
    rvId: string
    checkIn: string
    checkOut: string
    addOnIds?: string[]
    guests?: number
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (!body.rvId || !body.checkIn || !body.checkOut) {
    return NextResponse.json({ error: 'rvId, checkIn, and checkOut are required' }, { status: 400 })
  }

  const checkIn = new Date(body.checkIn)
  const checkOut = new Date(body.checkOut)

  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) {
    return NextResponse.json({ error: 'Invalid date format' }, { status: 400 })
  }

  if (checkOut <= checkIn) {
    return NextResponse.json({ error: 'Check-out must be after check-in' }, { status: 400 })
  }

  const [rv, addOns, settingsRows] = await Promise.all([
    prisma.rV.findUnique({
      where: { id: body.rvId },
      include: { priceRules: { where: { isActive: true } } },
    }),
    body.addOnIds?.length
      ? prisma.addOn.findMany({
          where: { id: { in: body.addOnIds }, isActive: true },
          include: { priceRules: { where: { isActive: true } } },
        })
      : Promise.resolve([]),
    prisma.siteSetting.findMany(),
  ])

  if (!rv) {
    return NextResponse.json({ error: 'RV not found' }, { status: 404 })
  }

  if (!rv.isActive) {
    return NextResponse.json({ error: 'RV is not available' }, { status: 400 })
  }

  const settings = Object.fromEntries(settingsRows.map((r) => [r.key, r.value]))

  const breakdown = calculatePrice({ rv, checkIn, checkOut, selectedAddOns: addOns, settings })

  return NextResponse.json({ data: breakdown })
}
