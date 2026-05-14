import { redirect } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getServerAuthSession } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDate, formatCurrency, getBookingStatusLabel, getBookingStatusColor } from '@/lib/utils'
import type { BookingStatus } from '@prisma/client'

export const metadata: Metadata = {
  title: 'My Bookings | SunRioVistas',
}

const STATUS_ORDER: BookingStatus[] = [
  'AWAITING_PAYMENT',
  'APPROVED',
  'CONFIRMED',
  'PENDING',
  'COMPLETED',
  'CANCELED',
  'REJECTED',
  'DRAFT',
]

export default async function DashboardPage() {
  const session = await getServerAuthSession()

  if (!session) {
    redirect('/login?callbackUrl=/dashboard')
  }

  const bookings = await prisma.booking.findMany({
    where: { userId: session.user.id },
    include: {
      rv: { select: { name: true, emoji: true, slug: true } },
      destination: { select: { name: true, emoji: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Stats
  const activeStatuses: BookingStatus[] = ['PENDING', 'APPROVED', 'AWAITING_PAYMENT', 'CONFIRMED']
  const activeBookings = bookings.filter((b) => activeStatuses.includes(b.status))
  const completedBookings = bookings.filter((b) => b.status === 'COMPLETED')

  // Group bookings by status order
  const grouped = STATUS_ORDER.flatMap((status) => {
    const group = bookings.filter((b) => b.status === status)
    return group.length > 0 ? [{ status, bookings: group }] : []
  })

  const userName = session.user.name?.split(' ')[0] ?? 'there'

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <div className="bg-white border-b border-amber-100">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-serif text-2xl font-bold text-stone-900">
                Welcome back, {userName}!
              </h1>
              <p className="text-stone-500 text-sm mt-0.5">
                Manage your glamping reservations
              </p>
            </div>
            <Link
              href="/book"
              className="bg-amber-600 text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-amber-700 transition-colors shadow-sm"
            >
              + New Booking
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            value={activeBookings.length}
            label="Active Bookings"
            color="amber"
          />
          <StatCard
            value={completedBookings.length}
            label="Completed Trips"
            color="green"
          />
          <StatCard
            value={bookings.length}
            label="Total Bookings"
            color="stone"
          />
        </div>

        {/* Empty state */}
        {bookings.length === 0 && (
          <div className="bg-white rounded-2xl border border-stone-100 p-12 text-center shadow-sm">
            <div className="text-5xl mb-4">🏕️</div>
            <h2 className="font-serif text-xl font-bold text-stone-900 mb-2">
              No bookings yet
            </h2>
            <p className="text-stone-500 text-sm mb-6 max-w-sm mx-auto">
              Ready for your first glamping escape? Browse our luxury RVs and stunning destinations.
            </p>
            <Link
              href="/book"
              className="inline-flex items-center gap-2 bg-amber-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-amber-700 transition-colors"
            >
              Book Your First Stay →
            </Link>
          </div>
        )}

        {/* Grouped bookings */}
        {grouped.map(({ status, bookings: groupBookings }) => (
          <div key={status} className="mb-8">
            {/* Group header */}
            <div className="flex items-center gap-2 mb-3">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getBookingStatusColor(status)}`}
              >
                {getBookingStatusLabel(status)}
              </span>
              <span className="text-xs text-stone-400">
                {groupBookings.length} booking{groupBookings.length !== 1 ? 's' : ''}
              </span>
            </div>

            {/* Booking cards */}
            <div className="space-y-3">
              {groupBookings.map((booking) => (
                <BookingCard key={booking.id} booking={booking} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────

function StatCard({
  value,
  label,
  color,
}: {
  value: number
  label: string
  color: 'amber' | 'green' | 'stone'
}) {
  const bg =
    color === 'amber'
      ? 'bg-amber-50 border-amber-100'
      : color === 'green'
      ? 'bg-green-50 border-green-100'
      : 'bg-stone-50 border-stone-100'
  const text =
    color === 'amber'
      ? 'text-amber-700'
      : color === 'green'
      ? 'text-green-700'
      : 'text-stone-700'

  return (
    <div className={`rounded-2xl border p-5 ${bg}`}>
      <p className={`text-3xl font-bold ${text}`}>{value}</p>
      <p className="text-stone-500 text-sm mt-1">{label}</p>
    </div>
  )
}

function BookingCard({
  booking,
}: {
  booking: {
    id: string
    status: BookingStatus
    checkIn: Date
    checkOut: Date
    nights: number
    guests: number
    total: unknown
    rv: { name: string; emoji: string; slug: string }
    destination: { name: string; emoji: string }
  }
}) {
  return (
    <Link
      href={`/dashboard/bookings/${booking.id}`}
      className="block bg-white rounded-xl border border-stone-100 p-5 hover:border-amber-200 hover:shadow-sm transition-all group"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-stone-900 text-sm">
              {booking.rv.emoji} {booking.rv.name}
            </span>
            <span className="text-stone-300">·</span>
            <span className="text-stone-600 text-sm">
              {booking.destination.emoji} {booking.destination.name}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-3 text-xs text-stone-400 flex-wrap">
            <span>
              {formatDate(booking.checkIn)} – {formatDate(booking.checkOut)}
            </span>
            <span>·</span>
            <span>
              {booking.nights} nights · {booking.guests} guests
            </span>
          </div>
        </div>

        {/* Right: status + price + link */}
        <div className="flex-shrink-0 flex flex-col items-end gap-2">
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getBookingStatusColor(booking.status)}`}
          >
            {getBookingStatusLabel(booking.status)}
          </span>
          <span className="font-bold text-stone-800 text-sm">
            {formatCurrency(Number(booking.total))}
          </span>
          <span className="text-xs text-amber-600 group-hover:text-amber-700 font-medium">
            View Details →
          </span>
        </div>
      </div>
    </Link>
  )
}
