import { NextResponse } from 'next/server'
import { getServerAuthSession, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, bookingApprovedTemplate, bookingRejectedTemplate } from '@/lib/email'
import { createRefund } from '@/lib/stripe'

// GET /api/admin/bookings/[id]
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerAuthSession()
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: { id: true, name: true, email: true, image: true, accounts: { select: { provider: true } } },
      },
      rv: { select: { id: true, name: true, emoji: true, tagline: true } },
      destination: {
        select: { id: true, name: true, emoji: true, campgroundFeeEstimate: true },
      },
      lineItems: true,
      addOns: { include: { addOn: { select: { name: true, description: true } } } },
      payments: {
        select: { id: true, amount: true, status: true, stripeChargeId: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      },
      termsAcceptance: {
        include: { termsDocument: { select: { version: true, url: true } } },
      },
    },
  })

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  return NextResponse.json({ data: booking })
}

// PATCH /api/admin/bookings/[id]
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerAuthSession()
  if (!session || !isAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    action?: string
    rejectionReason?: string
    adminNotes?: string
    status?: string
    refund?: { amount: number; reason?: string }
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const booking = await prisma.booking.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { name: true, email: true } },
      rv: { select: { name: true, emoji: true } },
      destination: { select: { name: true } },
    },
  })

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  // Handle action-based updates
  if (body.action === 'approve') {
    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: { status: 'APPROVED' },
    })

    // Send approval email (without payment link — that comes after generating link)
    if (booking.user.email) {
      try {
        await sendEmail({
          to: booking.user.email,
          subject: 'Your SunRioVistas booking has been approved!',
          html: bookingApprovedTemplate({
            bookingId: booking.id,
            customerName: booking.user.name ?? 'Valued Guest',
            customerEmail: booking.user.email,
            rvName: booking.rv.name,
            rvEmoji: booking.rv.emoji,
            destinationName: booking.destination.name,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            nights: booking.nights,
            guests: booking.guests,
            total: Number(booking.total),
          }),
        })
      } catch (err) {
        console.error('Failed to send approval email:', err)
      }
    }

    return NextResponse.json({ data: updated })
  }

  if (body.action === 'reject') {
    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: {
        status: 'REJECTED',
        rejectionReason: body.rejectionReason ?? null,
      },
    })

    // Send rejection email
    if (booking.user.email) {
      try {
        await sendEmail({
          to: booking.user.email,
          subject: 'Update on your SunRioVistas booking request',
          html: bookingRejectedTemplate({
            bookingId: booking.id,
            customerName: booking.user.name ?? 'Valued Guest',
            customerEmail: booking.user.email,
            rvName: booking.rv.name,
            rvEmoji: booking.rv.emoji,
            destinationName: booking.destination.name,
            checkIn: booking.checkIn,
            checkOut: booking.checkOut,
            nights: booking.nights,
            guests: booking.guests,
            total: Number(booking.total),
            rejectionReason: body.rejectionReason,
          }),
        })
      } catch (err) {
        console.error('Failed to send rejection email:', err)
      }
    }

    return NextResponse.json({ data: updated })
  }

  if (body.action === 'complete') {
    const updated = await prisma.booking.update({
      where: { id: params.id },
      data: { status: 'COMPLETED' },
    })
    return NextResponse.json({ data: updated })
  }

  // Handle refund
  if (body.refund) {
    const { amount, reason } = body.refund
    if (!booking.stripePaymentIntentId) {
      return NextResponse.json({ error: 'No payment intent on file to refund' }, { status: 400 })
    }

    try {
      await createRefund(
        booking.stripePaymentIntentId,
        Math.round(amount * 100),
        'requested_by_customer'
      )

      const updated = await prisma.booking.update({
        where: { id: params.id },
        data: {
          refundAmount: amount,
          refundStatus: 'refunded',
        },
      })

      await prisma.payment.create({
        data: {
          bookingId: booking.id,
          amount: -amount,
          status: 'REFUNDED',
          refundAmount: amount,
          refundReason: reason,
        },
      })

      return NextResponse.json({ data: updated })
    } catch (err) {
      console.error('Refund failed:', err)
      return NextResponse.json({ error: 'Refund failed' }, { status: 500 })
    }
  }

  // Generic update: adminNotes or status
  const updateData: Record<string, unknown> = {}
  if (body.adminNotes !== undefined) updateData.adminNotes = body.adminNotes
  if (body.status) updateData.status = body.status
  if (body.rejectionReason !== undefined) updateData.rejectionReason = body.rejectionReason

  if (Object.keys(updateData).length === 0) {
    return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 })
  }

  const updated = await prisma.booking.update({
    where: { id: params.id },
    data: updateData,
  })

  return NextResponse.json({ data: updated })
}
