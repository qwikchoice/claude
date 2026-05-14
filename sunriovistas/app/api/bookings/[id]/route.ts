import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { getServerAuthSession, isAdmin } from '@/lib/auth'

interface RouteParams {
  params: { id: string }
}

// ─────────────────────────────────────────────
// GET /api/bookings/[id]
// ─────────────────────────────────────────────

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerAuthSession()
    if (!session) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        rv: { select: { id: true, name: true, slug: true, emoji: true, tagline: true } },
        destination: {
          select: {
            id: true,
            name: true,
            slug: true,
            emoji: true,
            campgroundFeeEstimate: true,
            campgroundFeeNote: true,
          },
        },
        addOns: {
          include: {
            addOn: { select: { id: true, name: true, slug: true, description: true } },
          },
        },
        lineItems: { orderBy: { createdAt: 'asc' } },
        payments: { orderBy: { createdAt: 'desc' } },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 })
    }

    // Security check: must be the owner or an admin
    if (booking.userId !== session.user.id && !isAdmin(session)) {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 })
    }

    return NextResponse.json({ data: booking })
  } catch (err) {
    console.error('[GET /api/bookings/[id]]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}

// ─────────────────────────────────────────────
// PATCH /api/bookings/[id] — update guest fields
// ─────────────────────────────────────────────

const updateBookingSchema = z.object({
  specialRequests: z.string().optional(),
  petRequest: z.boolean().optional(),
  petNotes: z.string().optional(),
})

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerAuthSession()
    if (!session) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      select: { id: true, userId: true, status: true },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 })
    }

    // Must be the owner
    if (booking.userId !== session.user.id && !isAdmin(session)) {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 })
    }

    // Only allow updates for PENDING or DRAFT status
    if (booking.status !== 'PENDING' && booking.status !== 'DRAFT') {
      return NextResponse.json(
        {
          error: `Cannot update a booking with status ${booking.status}. Only PENDING or DRAFT bookings can be modified.`,
        },
        { status: 409 }
      )
    }

    const body = await req.json()
    const parsed = updateBookingSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0]?.message }, { status: 400 })
    }

    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: {
        ...(parsed.data.specialRequests !== undefined && {
          specialRequests: parsed.data.specialRequests,
        }),
        ...(parsed.data.petRequest !== undefined && {
          petRequest: parsed.data.petRequest,
        }),
        ...(parsed.data.petNotes !== undefined && {
          petNotes: parsed.data.petNotes,
        }),
      },
    })

    return NextResponse.json({ data: updated })
  } catch (err) {
    console.error('[PATCH /api/bookings/[id]]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
