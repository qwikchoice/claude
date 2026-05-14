import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getServerAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import {
  formatDate,
  formatCurrency,
  formatRelativeTime,
  getBookingStatusLabel,
  getBookingStatusColor,
} from '@/lib/utils'
import type { BookingStatus } from '@prisma/client'

export const metadata: Metadata = {
  title: 'Booking Details | SunRioVistas',
}

interface Props {
  params: { id: string }
}

const TIMELINE_STEPS: { status: BookingStatus; label: string; icon: string }[] = [
  { status: 'PENDING', label: 'Submitted', icon: '📋' },
  { status: 'APPROVED', label: 'Approved', icon: '✅' },
  { status: 'AWAITING_PAYMENT', label: 'Payment Sent', icon: '💳' },
  { status: 'CONFIRMED', label: 'Confirmed', icon: '🎉' },
]

const STATUS_RANK: Record<string, number> = {
  DRAFT: 0,
  PENDING: 1,
  APPROVED: 2,
  AWAITING_PAYMENT: 3,
  CONFIRMED: 4,
  COMPLETED: 5,
  CANCELED: -1,
  REJECTED: -1,
}

export default async function BookingDetailPage({ params }: Props) {
  const session = await getServerAuthSession()

  if (!session) {
    redirect('/login?callbackUrl=/dashboard')
  }

  const booking = await prisma.booking.findFirst({
    where: { id: params.id, userId: session.user.id },
    include: {
      rv: { select: { name: true, emoji: true, slug: true, tagline: true } },
      destination: {
        select: {
          name: true,
          emoji: true,
          campgroundFeeEstimate: true,
          campgroundFeeNote: true,
        },
      },
      addOns: {
        include: { addOn: { select: { name: true, description: true } } },
      },
      lineItems: { orderBy: { createdAt: 'asc' } },
      payments: { orderBy: { createdAt: 'desc' } },
    },
  })

  if (!booking) {
    notFound()
  }

  const bookingRef = booking.id.slice(-8).toUpperCase()
  const currentRank = STATUS_RANK[booking.status] ?? -1
  const isCanceled = booking.status === 'CANCELED' || booking.status === 'REJECTED'

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <div className="bg-white border-b border-amber-100">
        <div className="max-w-3xl mx-auto px-4 py-5">
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard"
              className="text-stone-400 hover:text-stone-600 transition-colors"
            >
              ← My Bookings
            </Link>
            <span className="text-stone-200">/</span>
            <span className="text-stone-600 text-sm font-mono">#{bookingRef}</span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Status banner */}
        <div
          className={`rounded-2xl border p-6 ${
            booking.status === 'CONFIRMED' || booking.status === 'COMPLETED'
              ? 'bg-green-50 border-green-100'
              : booking.status === 'AWAITING_PAYMENT'
              ? 'bg-orange-50 border-orange-100'
              : isCanceled
              ? 'bg-stone-50 border-stone-200'
              : 'bg-amber-50 border-amber-100'
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getBookingStatusColor(booking.status)}`}
              >
                {getBookingStatusLabel(booking.status)}
              </span>
              <p className="mt-2 text-sm text-stone-700 leading-relaxed">
                {booking.status === 'PENDING' && (
                  'Your request is under review. We\'ll respond within 1–2 business days.'
                )}
                {booking.status === 'APPROVED' && (
                  'Your booking has been approved! A payment link has been sent to your email.'
                )}
                {booking.status === 'AWAITING_PAYMENT' && (
                  'Please complete payment using the link below to confirm your booking.'
                )}
                {booking.status === 'CONFIRMED' && (
                  'Your booking is confirmed. We can\'t wait to host you!'
                )}
                {booking.status === 'COMPLETED' && (
                  'Thank you for staying with us! We hope you had an amazing experience.'
                )}
                {booking.status === 'REJECTED' && (
                  'Unfortunately, your booking request was not approved. Please contact us for more information.'
                )}
                {booking.status === 'CANCELED' && (
                  'This booking has been canceled.'
                )}
              </p>
            </div>
          </div>

          {/* Payment link button */}
          {booking.status === 'AWAITING_PAYMENT' && booking.stripePaymentLinkUrl && (
            <a
              href={booking.stripePaymentLinkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-amber-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-amber-700 transition-colors shadow"
            >
              💳 Complete Payment Now →
            </a>
          )}
        </div>

        {/* Booking timeline */}
        {!isCanceled && (
          <div className="bg-white rounded-2xl border border-stone-100 p-6">
            <h2 className="font-semibold text-stone-800 text-sm mb-5 uppercase tracking-wide">
              Booking Timeline
            </h2>
            <div className="flex items-center gap-0">
              {TIMELINE_STEPS.map((step, i) => {
                const stepRank = STATUS_RANK[step.status] ?? 0
                const isReached = currentRank >= stepRank
                const isCurrent = booking.status === step.status
                return (
                  <div key={step.status} className="flex items-center flex-1">
                    <div className="flex flex-col items-center gap-1.5 flex-1">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-lg border-2 transition-all ${
                          isReached
                            ? 'bg-amber-100 border-amber-400'
                            : 'bg-stone-50 border-stone-200'
                        }`}
                      >
                        {step.icon}
                      </div>
                      <span
                        className={`text-xs font-medium text-center leading-tight ${
                          isCurrent ? 'text-amber-700' : isReached ? 'text-stone-600' : 'text-stone-300'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {i < TIMELINE_STEPS.length - 1 && (
                      <div
                        className={`h-0.5 flex-1 mx-1 -mt-5 transition-all ${
                          currentRank > stepRank ? 'bg-amber-300' : 'bg-stone-100'
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Details */}
        <div className="bg-white rounded-2xl border border-stone-100 p-6">
          <h2 className="font-semibold text-stone-800 text-sm mb-4 uppercase tracking-wide">
            Booking Details
          </h2>
          <div className="space-y-3">
            <DetailRow label="Booking Ref" value={`#${bookingRef}`} mono />
            <DetailRow label="RV" value={`${booking.rv.emoji} ${booking.rv.name}`} />
            <DetailRow label="Destination" value={`${booking.destination.emoji} ${booking.destination.name}`} />
            <DetailRow label="Check-in" value={formatDate(booking.checkIn)} />
            <DetailRow label="Check-out" value={formatDate(booking.checkOut)} />
            <DetailRow label="Nights" value={`${booking.nights} nights`} />
            <DetailRow label="Guests" value={`${booking.guests} guests`} />
            {booking.petRequest && (
              <DetailRow label="Pet Request" value="Yes" />
            )}
            {booking.petNotes && (
              <DetailRow label="Pet Notes" value={booking.petNotes} />
            )}
            {booking.specialRequests && (
              <DetailRow label="Special Requests" value={booking.specialRequests} />
            )}
            <DetailRow label="Submitted" value={formatRelativeTime(booking.createdAt)} />
          </div>
        </div>

        {/* Add-ons */}
        {booking.addOns.length > 0 && (
          <div className="bg-white rounded-2xl border border-stone-100 p-6">
            <h2 className="font-semibold text-stone-800 text-sm mb-4 uppercase tracking-wide">
              Add-Ons
            </h2>
            <ul className="space-y-2">
              {booking.addOns.map((ba) => (
                <li key={ba.id} className="flex justify-between items-center text-sm">
                  <span className="text-stone-700">{ba.addOn.name}</span>
                  <span className="font-medium text-stone-900">
                    {formatCurrency(Number(ba.price))}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Price breakdown */}
        <div className="bg-white rounded-2xl border border-stone-100 p-6">
          <h2 className="font-semibold text-stone-800 text-sm mb-4 uppercase tracking-wide">
            Price Breakdown
          </h2>
          <div className="space-y-2.5">
            {booking.lineItems.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <span className="text-stone-600">{item.description}</span>
                <span className="font-medium text-stone-900">
                  {formatCurrency(Number(item.total))}
                </span>
              </div>
            ))}
            {booking.lineItems.length === 0 && (
              <>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-stone-600">
                    {booking.nights} nights × {formatCurrency(Number(booking.nightlyRateSnapshot))}
                  </span>
                  <span className="font-medium text-stone-900">
                    {formatCurrency(Number(booking.subtotal))}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-stone-600">Cleaning fee</span>
                  <span className="font-medium text-stone-900">
                    {formatCurrency(Number(booking.cleaningFee))}
                  </span>
                </div>
                {Number(booking.addOnTotal) > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-stone-600">Add-ons</span>
                    <span className="font-medium text-stone-900">
                      {formatCurrency(Number(booking.addOnTotal))}
                    </span>
                  </div>
                )}
                {booking.depositAmount && Number(booking.depositAmount) > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-stone-600">
                      Security deposit ({booking.depositPercent}%)
                    </span>
                    <span className="font-medium text-stone-900">
                      {formatCurrency(Number(booking.depositAmount))}
                    </span>
                  </div>
                )}
                {booking.taxAmount && Number(booking.taxAmount) > 0 && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-stone-600">Tax ({booking.taxPercent}%)</span>
                    <span className="font-medium text-stone-900">
                      {formatCurrency(Number(booking.taxAmount))}
                    </span>
                  </div>
                )}
              </>
            )}
            <div className="border-t border-stone-100 pt-3 flex justify-between items-center">
              <span className="font-bold text-stone-900">Total</span>
              <span className="font-bold text-amber-700 text-lg">
                {formatCurrency(Number(booking.total))}
              </span>
            </div>
          </div>

          {/* Campground fee note */}
          {booking.destination.campgroundFeeEstimate && (
            <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl p-3 text-xs text-amber-800 leading-relaxed">
              <span className="font-semibold">Campground fees: </span>
              Approximately {booking.destination.campgroundFeeEstimate} per night, paid
              directly to the campground at check-in. Not included in your total above.
            </div>
          )}
        </div>

        {/* Cancellation policy */}
        <div className="bg-stone-50 border border-stone-100 rounded-2xl p-6">
          <h2 className="font-semibold text-stone-800 text-sm mb-3 uppercase tracking-wide">
            Cancellation Policy
          </h2>
          <ul className="space-y-2 text-sm text-stone-600 leading-relaxed">
            <li className="flex gap-2">
              <span className="text-green-500 flex-shrink-0">●</span>
              <span>
                <strong>Full refund</strong> if canceled 7+ days before check-in
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-amber-500 flex-shrink-0">●</span>
              <span>
                <strong>50% refund</strong> if canceled within 2–7 days of check-in
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-red-400 flex-shrink-0">●</span>
              <span>
                <strong>No refund</strong> if canceled less than 48 hours before check-in
              </span>
            </li>
          </ul>

          {/* Cancel button (only for PENDING or CONFIRMED) */}
          {(booking.status === 'PENDING' || booking.status === 'CONFIRMED') && (
            <form action={`/api/bookings/${booking.id}/cancel`} method="POST" className="mt-5">
              <button
                type="submit"
                className="text-sm text-red-600 hover:text-red-700 underline underline-offset-2"
                onClick={(e) => {
                  if (!confirm('Are you sure you want to cancel this booking?')) {
                    e.preventDefault()
                  }
                }}
              >
                Cancel this booking
              </button>
            </form>
          )}
        </div>

        {/* Support */}
        <div className="text-center py-4">
          <p className="text-sm text-stone-400">
            Need help?{' '}
            <a
              href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? 'hello@sunriovistas.com'}`}
              className="text-amber-600 hover:text-amber-700 underline"
            >
              Contact support
            </a>
          </p>
        </div>
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
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-sm text-stone-400 flex-shrink-0">{label}</span>
      <span
        className={`text-sm font-medium text-stone-800 text-right ${mono ? 'font-mono text-amber-700' : ''}`}
      >
        {value}
      </span>
    </div>
  )
}
