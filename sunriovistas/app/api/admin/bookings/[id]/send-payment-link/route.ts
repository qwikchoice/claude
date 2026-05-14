import { NextResponse } from 'next/server'
import { getServerAuthSession, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createPaymentLink } from '@/lib/stripe'
import { sendEmail, bookingApprovedTemplate } from '@/lib/email'
import { format } from 'date-fns'

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

export async function POST(
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
      user: { select: { name: true, email: true } },
      rv: { select: { name: true, emoji: true } },
      destination: { select: { name: true } },
      addOns: { include: { addOn: { select: { name: true } } } },
    },
  })

  if (!booking) {
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  }

  if (booking.status !== 'APPROVED' && booking.status !== 'AWAITING_PAYMENT') {
    return NextResponse.json(
      { error: `Cannot send payment link for booking with status: ${booking.status}` },
      { status: 400 }
    )
  }

  if (!booking.user.email) {
    return NextResponse.json({ error: 'Customer has no email address' }, { status: 400 })
  }

  const checkInStr = format(new Date(booking.checkIn), 'MMM d')
  const checkOutStr = format(new Date(booking.checkOut), 'MMM d, yyyy')
  const description = `SunRioVistas — ${booking.rv.name} at ${booking.destination.name} · ${checkInStr}–${checkOutStr} · ${booking.nights} night${booking.nights !== 1 ? 's' : ''}, ${booking.guests} guest${booking.guests !== 1 ? 's' : ''}`

  const amountInCents = Math.round(Number(booking.total) * 100)

  let paymentLinkUrl: string
  let paymentLinkId: string

  try {
    const result = await createPaymentLink({
      bookingId: booking.id,
      amount: amountInCents,
      description,
      customerEmail: booking.user.email,
      metadata: {
        bookingId: booking.id,
        rvName: booking.rv.name,
        destinationName: booking.destination.name,
        checkIn: booking.checkIn.toISOString(),
        checkOut: booking.checkOut.toISOString(),
      },
      successUrl: `${APP_URL}/book/confirmation?bookingId=${booking.id}&status=confirmed`,
      cancelUrl: `${APP_URL}/dashboard`,
    })
    paymentLinkUrl = result.url
    paymentLinkId = result.id
  } catch (err) {
    console.error('Failed to create Stripe payment link:', err)
    return NextResponse.json({ error: 'Failed to create payment link' }, { status: 500 })
  }

  // Update booking with payment link
  await prisma.booking.update({
    where: { id: booking.id },
    data: {
      stripePaymentLinkId: paymentLinkId,
      stripePaymentLinkUrl: paymentLinkUrl,
      status: 'AWAITING_PAYMENT',
    },
  })

  // Send email to customer with payment link
  try {
    await sendEmail({
      to: booking.user.email,
      subject: 'Complete your SunRioVistas booking — payment link inside',
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
        paymentLinkUrl,
        addOns: booking.addOns.map((a) => ({
          name: a.addOn.name,
          price: Number(a.price),
        })),
      }),
    })
  } catch (err) {
    console.error('Failed to send payment link email:', err)
    // Don't fail the request — link was generated, email is best-effort
  }

  return NextResponse.json({ data: { paymentLinkUrl, paymentLinkId } })
}
