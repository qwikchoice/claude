import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerAuthSession, isAdmin } from '@/lib/auth'
import { sendEmail, bookingCanceledTemplate } from '@/lib/email'

interface RouteParams {
  params: { id: string }
}

export async function POST(_req: NextRequest, { params }: RouteParams) {
  try {
    const session = await getServerAuthSession()
    if (!session) {
      return NextResponse.json({ error: 'Authentication required.' }, { status: 401 })
    }

    const booking = await prisma.booking.findUnique({
      where: { id: params.id },
      include: {
        rv: { select: { name: true, emoji: true } },
        destination: { select: { name: true, emoji: true } },
        user: { select: { name: true, email: true } },
        payments: {
          where: { status: 'SUCCEEDED' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found.' }, { status: 404 })
    }

    // Security: must be owner or admin
    if (booking.userId !== session.user.id && !isAdmin(session)) {
      return NextResponse.json({ error: 'Access denied.' }, { status: 403 })
    }

    // Only allow cancellation for PENDING or CONFIRMED
    if (booking.status !== 'PENDING' && booking.status !== 'CONFIRMED') {
      return NextResponse.json(
        {
          error: `Cannot cancel a booking with status ${booking.status}. Only PENDING or CONFIRMED bookings can be canceled.`,
        },
        { status: 409 }
      )
    }

    // Determine refund eligibility
    const now = new Date()
    const checkIn = booking.checkIn
    const daysUntilCheckIn = Math.floor(
      (checkIn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    )

    let refundInfo = 'No refund applicable (unpaid booking).'
    let refundAmount = 0

    if (booking.status === 'CONFIRMED' && booking.payments.length > 0) {
      const paid = Number(booking.payments[0].amount)

      if (daysUntilCheckIn >= 7) {
        refundAmount = paid
        refundInfo = `Full refund of ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(paid)} will be issued within 5–10 business days.`
      } else if (daysUntilCheckIn >= 2) {
        refundAmount = Math.round(paid * 0.5 * 100) / 100
        refundInfo = `50% refund of ${new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(refundAmount)} will be issued within 5–10 business days.`
      } else {
        refundInfo = 'No refund — cancellation is within 48 hours of check-in.'
      }
    } else if (booking.status === 'PENDING') {
      refundInfo = 'No charge was made — your booking request has been canceled at no cost.'
    }

    // Update booking status
    const canceled = await prisma.booking.update({
      where: { id: booking.id },
      data: {
        status: 'CANCELED',
        refundAmount: refundAmount > 0 ? refundAmount : null,
        refundStatus: refundAmount > 0 ? 'pending' : null,
      },
    })

    // Send cancellation emails
    const emailData = {
      bookingId: booking.id,
      customerName: booking.user.name ?? 'Guest',
      customerEmail: booking.user.email ?? '',
      rvName: booking.rv.name,
      rvEmoji: booking.rv.emoji,
      destinationName: booking.destination.name,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      nights: booking.nights,
      guests: booking.guests,
      total: Number(booking.total),
      refundAmount,
    }

    const customerEmailHtml = bookingCanceledTemplate(emailData)

    const adminSettings = await prisma.siteSetting.findFirst({
      where: { key: 'admin_email' },
    })
    const adminEmail = adminSettings?.value ?? process.env.ADMIN_EMAIL ?? ''

    const bookingRef = booking.id.slice(-8).toUpperCase()

    await Promise.all([
      booking.user.email
        ? sendEmail({
            to: booking.user.email,
            subject: `Booking Canceled — #${bookingRef} | SunRioVistas`,
            html: customerEmailHtml,
          })
        : Promise.resolve(),
      adminEmail
        ? sendEmail({
            to: adminEmail,
            subject: `[SunRioVistas] Booking Canceled #${bookingRef} — ${booking.user.name ?? 'Guest'}`,
            html: `<p>Booking #${bookingRef} has been canceled by the customer. ${refundInfo}</p><p><a href="${process.env.NEXTAUTH_URL}/admin/bookings/${booking.id}">View in Admin</a></p>`,
          })
        : Promise.resolve(),
    ]).catch((err) => {
      console.error('[cancel] Email error:', err)
    })

    return NextResponse.json({
      data: {
        id: canceled.id,
        status: canceled.status,
        refundInfo,
        refundAmount,
      },
    })
  } catch (err) {
    console.error('[POST /api/bookings/[id]/cancel]', err)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}
