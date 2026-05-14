import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import type Stripe from 'stripe'

export const config = { api: { bodyParser: false } }

export async function POST(request: Request) {
  const body = await request.text()
  const sig = request.headers.get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch (err) {
    console.error('Stripe webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const bookingId = session.metadata?.bookingId
        if (!bookingId) break

        const booking = await prisma.booking.findUnique({
          where: { id: bookingId },
          include: {
            user: { select: { name: true, email: true } },
            rv: { select: { name: true, emoji: true } },
            destination: { select: { name: true } },
          },
        })

        if (!booking) break

        await prisma.booking.update({
          where: { id: bookingId },
          data: {
            status: 'CONFIRMED',
            paidAt: new Date(),
            stripePaymentIntentId: session.payment_intent as string | null,
          },
        })

        await prisma.payment.create({
          data: {
            bookingId,
            stripePaymentIntentId: session.payment_intent as string | null,
            amount: (session.amount_total ?? 0) / 100,
            status: 'SUCCEEDED',
          },
        })

        const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'

        if (booking.user.email) {
          try {
            await sendEmail({
              to: booking.user.email,
              subject: '🎉 Your SunRioVistas booking is confirmed!',
              html: buildConfirmedEmail({
                bookingId: booking.id,
                customerName: booking.user.name ?? 'Valued Guest',
                rvName: booking.rv.name,
                rvEmoji: booking.rv.emoji,
                destinationName: booking.destination.name,
                checkIn: booking.checkIn,
                checkOut: booking.checkOut,
                nights: booking.nights,
                guests: booking.guests,
                total: Number(booking.total),
                appUrl,
              }),
            })
          } catch (err) {
            console.error('Failed to send booking confirmed email:', err)
          }
        }

        const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@sunriovistas.com'
        try {
          await sendEmail({
            to: adminEmail,
            subject: `✅ Payment received — Booking #${bookingId.slice(-8).toUpperCase()}`,
            html: `<div style="font-family:sans-serif;padding:20px"><h2 style="color:#d97706">Payment Confirmed</h2>
              <p>Booking <strong>#${bookingId.slice(-8).toUpperCase()}</strong> is now confirmed.</p>
              <p>Customer: ${booking.user.name} (${booking.user.email})</p>
              <p>RV: ${booking.rv.emoji} ${booking.rv.name} → ${booking.destination.name}</p>
              <p>Check-in: ${booking.checkIn.toDateString()}</p>
              <p>Total collected: $${Number(booking.total).toFixed(2)}</p>
              <p><a href="${appUrl}/admin/bookings/${bookingId}" style="background:#d97706;color:white;padding:10px 20px;text-decoration:none;border-radius:8px">View Booking</a></p>
            </div>`,
          })
        } catch (err) {
          console.error('Failed to send admin payment email:', err)
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const intent = event.data.object as Stripe.PaymentIntent
        const bookingId = intent.metadata?.bookingId
        if (!bookingId) break

        console.warn(`Payment failed for booking ${bookingId}:`, intent.last_payment_error?.message)

        await prisma.payment.create({
          data: {
            bookingId,
            stripePaymentIntentId: intent.id,
            amount: intent.amount / 100,
            status: 'FAILED',
          },
        })
        break
      }

      default:
        break
    }
  } catch (err) {
    console.error('Error processing Stripe webhook:', err)
    return NextResponse.json({ error: 'Webhook processing error' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}

function buildConfirmedEmail(params: {
  bookingId: string
  customerName: string
  rvName: string
  rvEmoji: string
  destinationName: string
  checkIn: Date
  checkOut: Date
  nights: number
  guests: number
  total: number
  appUrl: string
}): string {
  const { bookingId, customerName, rvName, rvEmoji, destinationName, checkIn, checkOut, nights, guests, total, appUrl } = params
  return `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#ffffff">
      <div style="background:#d97706;padding:30px;text-align:center">
        <h1 style="color:white;margin:0;font-size:28px">🎉 You're Confirmed!</h1>
        <p style="color:#fef3c7;margin:8px 0 0">Your SunRioVistas glamping experience is booked.</p>
      </div>
      <div style="padding:30px">
        <p style="font-size:18px">Hi ${customerName},</p>
        <p>Your payment was received and your booking is <strong>confirmed</strong>. We can't wait to host you!</p>
        <div style="background:#fef3c7;border-radius:12px;padding:20px;margin:20px 0">
          <h3 style="margin:0 0 12px;color:#92400e">Your Booking Details</h3>
          <table style="width:100%">
            <tr><td style="padding:6px 0;color:#666">Booking ID</td><td style="padding:6px 0;font-weight:bold">#${bookingId.slice(-8).toUpperCase()}</td></tr>
            <tr><td style="padding:6px 0;color:#666">RV Experience</td><td style="padding:6px 0;font-weight:bold">${rvEmoji} ${rvName}</td></tr>
            <tr><td style="padding:6px 0;color:#666">Destination</td><td style="padding:6px 0;font-weight:bold">${destinationName}</td></tr>
            <tr><td style="padding:6px 0;color:#666">Check-In</td><td style="padding:6px 0;font-weight:bold">${checkIn.toDateString()}</td></tr>
            <tr><td style="padding:6px 0;color:#666">Check-Out</td><td style="padding:6px 0;font-weight:bold">${checkOut.toDateString()}</td></tr>
            <tr><td style="padding:6px 0;color:#666">Nights</td><td style="padding:6px 0;font-weight:bold">${nights}</td></tr>
            <tr><td style="padding:6px 0;color:#666">Guests</td><td style="padding:6px 0;font-weight:bold">${guests}</td></tr>
            <tr><td style="padding:6px 0;color:#666">Total Paid</td><td style="padding:6px 0;font-weight:bold;color:#d97706">$${total.toFixed(2)}</td></tr>
          </table>
        </div>
        <div style="background:#f0fdf4;border-left:4px solid #16a34a;padding:16px;border-radius:4px;margin:20px 0">
          <p style="margin:0;font-weight:bold;color:#15803d">🚗 Remember: You drive YOUR car.</p>
          <p style="margin:8px 0 0;color:#166534">The RV will be fully setup and waiting for you at the destination. No RV driving required.</p>
        </div>
        <p>Have questions? Reply to this email or contact us at admin@sunriovistas.com</p>
        <div style="text-align:center;margin:24px 0">
          <a href="${appUrl}/dashboard/bookings/${bookingId}" style="background:#d97706;color:white;padding:14px 28px;text-decoration:none;border-radius:8px;font-weight:bold;font-size:16px">View My Booking</a>
        </div>
      </div>
      <div style="background:#1c1917;padding:20px;text-align:center;color:#a8a29e">
        <p style="margin:0">© 2025 SunRioVistas · Near Folsom Lake, Northern California</p>
        <p style="margin:4px 0;font-size:12px">Campground fees are paid directly to the campground and are not included in this total.</p>
      </div>
    </div>
  `
}
