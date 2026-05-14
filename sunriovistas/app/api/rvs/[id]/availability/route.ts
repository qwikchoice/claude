import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { addDays, format, parseISO, isWithinInterval, differenceInDays } from 'date-fns'

interface RouteParams {
  params: { id: string }
}

const UNAVAILABLE_STATUSES = ['PENDING', 'APPROVED', 'AWAITING_PAYMENT', 'CONFIRMED'] as const

export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { searchParams } = new URL(req.url)
    const startStr = searchParams.get('start')
    const endStr = searchParams.get('end')

    if (!startStr || !endStr) {
      return NextResponse.json(
        { error: 'start and end query parameters are required (YYYY-MM-DD).' },
        { status: 400 }
      )
    }

    const start = parseISO(startStr)
    const end = parseISO(endStr)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD.' },
        { status: 400 }
      )
    }

    if (end <= start) {
      return NextResponse.json(
        { error: 'end date must be after start date.' },
        { status: 400 }
      )
    }

    // Verify RV exists
    const rv = await prisma.rV.findUnique({
      where: { id: params.id },
      select: { id: true, isActive: true },
    })

    if (!rv) {
      return NextResponse.json({ error: 'RV not found.' }, { status: 404 })
    }

    // Fetch blockouts and active bookings within date range
    const [blockouts, bookings] = await Promise.all([
      prisma.calendarBlockout.findMany({
        where: {
          rvId: params.id,
          startDate: { lte: end },
          endDate: { gte: start },
        },
        select: { startDate: true, endDate: true, reason: true },
      }),
      prisma.booking.findMany({
        where: {
          rvId: params.id,
          status: { in: UNAVAILABLE_STATUSES },
          checkIn: { lte: end },
          checkOut: { gte: start },
        },
        select: { checkIn: true, checkOut: true, status: true },
      }),
    ])

    // Build array of blocked dates
    const blockedDateSet = new Set<string>()

    // Add dates from blockouts
    for (const blockout of blockouts) {
      const days = differenceInDays(blockout.endDate, blockout.startDate) + 1
      for (let i = 0; i < days; i++) {
        const d = addDays(blockout.startDate, i)
        if (d >= start && d <= end) {
          blockedDateSet.add(format(d, 'yyyy-MM-dd'))
        }
      }
    }

    // Add dates from active bookings (checkIn to checkOut - 1 day)
    for (const booking of bookings) {
      const nights = differenceInDays(booking.checkOut, booking.checkIn)
      for (let i = 0; i < nights; i++) {
        const d = addDays(booking.checkIn, i)
        if (d >= start && d <= end) {
          blockedDateSet.add(format(d, 'yyyy-MM-dd'))
        }
      }
    }

    const blockedDates = Array.from(blockedDateSet).sort()

    return NextResponse.json({
      data: {
        rvId: params.id,
        blockedDates,
        bookings: bookings.map((b) => ({
          checkIn: format(b.checkIn, 'yyyy-MM-dd'),
          checkOut: format(b.checkOut, 'yyyy-MM-dd'),
        })),
      },
    })
  } catch (err) {
    console.error('[GET /api/rvs/[id]/availability]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
