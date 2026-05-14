import type { Metadata } from 'next'
import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import { getServerAuthSession } from '@/lib/auth'
import { formatDate, formatCurrency, getBookingStatusLabel } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Booking Confirmation | SunRioVistas',
}

interface ConfirmationPageProps {
  searchParams: { bookingId?: string; status?: string }
}

export default async function ConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const { bookingId, status } = searchParams
  const session = await getServerAuthSession()

  // Optionally fetch booking details if user is logged in and bookingId provided
  let booking = null
  if (bookingId && session?.user?.id) {
    booking = await prisma.booking.findFirst({
      where: { id: bookingId, userId: session.user.id },
      include: {
        rv: { select: { name: true, emoji: true } },
        destination: { select: { name: true, emoji: true } },
        addOns: { include: { addOn: { select: { name: true } } } },
      },
    })
  }

  const isPending = status === 'pending' || (!status && booking?.status === 'PENDING')
  const isConfirmed = status === 'confirmed' || booking?.status === 'CONFIRMED'
  const bookingRef = bookingId ? bookingId.slice(-8).toUpperCase() : null

  return (
    <div className="min-h-screen bg-amber-50 flex items-start justify-center pt-16 px-4 pb-16">
      <div className="w-full max-w-lg">
        {/* Success Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
          {/* Status header */}
          <div
            className={`px-8 py-10 text-center ${
              isConfirmed
                ? 'bg-gradient-to-br from-green-500 to-emerald-600'
                : 'bg-gradient-to-br from-amber-500 to-amber-600'
            }`}
          >
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">{isConfirmed ? '🎉' : '✅'}</span>
            </div>
            <h1 className="font-serif text-2xl font-bold text-white mb-1">
              {isConfirmed ? "You're all set!" : 'Request Received!'}
            </h1>
            <p className="text-white/85 text-sm">
              {isConfirmed
                ? 'Your glamping experience is confirmed.'
                : 'Your booking request has been submitted.'}
            </p>
          </div>

          <div className="px-8 py-6">
            {/* Booking reference */}
            {bookingRef && (
              <div className="text-center mb-6">
                <p className="text-xs text-stone-400 uppercase tracking-widest mb-1">
                  Booking Reference
                </p>
                <p className="font-mono text-2xl font-bold text-amber-700">
                  #{bookingRef}
                </p>
              </div>
            )}

            {/* Booking details (if fetched) */}
            {booking && (
              <div className="bg-amber-50 rounded-xl border border-amber-100 p-4 mb-6 space-y-2.5">
                <DetailRow
                  label="RV"
                  value={`${booking.rv.emoji} ${booking.rv.name}`}
                />
                <DetailRow
                  label="Destination"
                  value={`${booking.destination.emoji} ${booking.destination.name}`}
                />
                <DetailRow
                  label="Check-in"
                  value={formatDate(booking.checkIn)}
                />
                <DetailRow
                  label="Check-out"
                  value={formatDate(booking.checkOut)}
                />
                <DetailRow
                  label="Nights"
                  value={`${booking.nights} nights`}
                />
                <DetailRow
                  label="Guests"
                  value={`${booking.guests} guests`}
                />
                <div className="border-t border-amber-200 pt-2.5">
                  <DetailRow
                    label="Total"
                    value={formatCurrency(Number(booking.total))}
                    highlight
                  />
                </div>
                <div className="pt-1">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      booking.status === 'CONFIRMED'
                        ? 'bg-green-100 text-green-700 border-green-200'
                        : 'bg-amber-100 text-amber-700 border-amber-200'
                    }`}
                  >
                    {getBookingStatusLabel(booking.status)}
                  </span>
                </div>
              </div>
            )}

            {/* What's next */}
            {isPending && (
              <div className="mb-6">
                <h2 className="font-semibold text-stone-800 text-sm mb-3">What Happens Next?</h2>
                <div className="space-y-3">
                  {[
                    {
                      icon: '📧',
                      title: 'Confirmation email sent',
                      desc: 'Check your inbox for a booking reference email.',
                    },
                    {
                      icon: '👀',
                      title: 'Admin review (1–2 business days)',
                      desc: 'Our team reviews all requests before approval.',
                    },
                    {
                      icon: '💳',
                      title: 'Payment link via email',
                      desc: 'Once approved, you\'ll receive a secure payment link.',
                    },
                    {
                      icon: '✅',
                      title: 'Confirmed after payment',
                      desc: 'Your booking is fully confirmed once payment is received.',
                    },
                  ].map((item) => (
                    <div key={item.title} className="flex gap-3">
                      <span className="text-xl flex-shrink-0">{item.icon}</span>
                      <div>
                        <p className="text-sm font-medium text-stone-800">{item.title}</p>
                        <p className="text-xs text-stone-500 mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Confirmed state: check-in instructions */}
            {isConfirmed && (
              <div className="mb-6 bg-green-50 border border-green-100 rounded-xl p-4">
                <h2 className="font-semibold text-green-800 text-sm mb-2">
                  Check-in Instructions
                </h2>
                <ul className="text-sm text-green-700 space-y-1.5 leading-relaxed">
                  <li>• Arrive between <strong>3:00 PM – 7:00 PM</strong> on your check-in date.</li>
                  <li>• Pay campground/site fees directly at the campground entrance.</li>
                  <li>• Contact us 24 hrs in advance if you need early/late arrival.</li>
                </ul>
                <p className="text-xs text-green-600 mt-3">
                  Questions?{' '}
                  <a
                    href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'hello@sunriovistas.com'}`}
                    className="underline"
                  >
                    Contact us
                  </a>
                </p>
              </div>
            )}

            {/* CTAs */}
            <div className="flex flex-col gap-3">
              <Link
                href="/dashboard"
                className="w-full bg-amber-600 text-white text-center py-3 rounded-xl font-semibold text-sm hover:bg-amber-700 transition-colors"
              >
                View My Bookings
              </Link>
              <Link
                href="/"
                className="w-full text-center py-3 rounded-xl font-medium text-sm text-stone-500 hover:text-stone-700 hover:bg-stone-50 transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Campground fee note */}
        <p className="text-center text-xs text-stone-400 mt-4 leading-relaxed max-w-sm mx-auto">
          Reminder: Campground/site fees are paid directly to the campground at check-in
          and are not included in your SunRioVistas booking total.
        </p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function DetailRow({
  label,
  value,
  highlight = false,
}: {
  label: string
  value: string
  highlight?: boolean
}) {
  return (
    <div className="flex justify-between items-center gap-2">
      <span className="text-sm text-stone-500">{label}</span>
      <span
        className={`text-sm text-right ${
          highlight ? 'font-bold text-amber-700' : 'font-medium text-stone-800'
        }`}
      >
        {value}
      </span>
    </div>
  )
}
