import { redirect } from 'next/navigation'
import { getServerAuthSession, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatDate } from '@/lib/utils'
import { CalendarX, Calendar, Clock } from 'lucide-react'
import BlockoutForm from '@/components/admin/BlockoutForm'
import BlockoutDeleteButton from '@/components/admin/BlockoutDeleteButton'

export default async function AdminCalendarPage() {
  const session = await getServerAuthSession()
  if (!session || !isAdmin(session)) {
    redirect('/login')
  }

  const now = new Date()
  const thirtyDaysOut = new Date(now)
  thirtyDaysOut.setDate(now.getDate() + 90)

  const [rvs, blockouts, upcomingBookings] = await Promise.all([
    prisma.rV.findMany({
      where: { isActive: true },
      select: { id: true, name: true, emoji: true },
      orderBy: { sortOrder: 'asc' },
    }),
    prisma.calendarBlockout.findMany({
      include: { rv: { select: { name: true, emoji: true } } },
      orderBy: { startDate: 'asc' },
    }),
    prisma.booking.findMany({
      where: {
        status: { in: ['CONFIRMED', 'APPROVED', 'AWAITING_PAYMENT'] },
        checkIn: { gte: now, lte: thirtyDaysOut },
      },
      include: {
        user: { select: { name: true, email: true } },
        rv: { select: { name: true, emoji: true } },
        destination: { select: { name: true, emoji: true } },
      },
      orderBy: { checkIn: 'asc' },
      take: 20,
    }),
  ])

  const allRvsForForm = await prisma.rV.findMany({
    select: { id: true, name: true, emoji: true },
    orderBy: { sortOrder: 'asc' },
  })

  const pastBlockouts = blockouts.filter((b) => new Date(b.endDate) < now)
  const activeBlockouts = blockouts.filter((b) => new Date(b.endDate) >= now)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Calendar & Blockouts</h1>
        <p className="text-stone-500 text-sm mt-1">
          Manage date blockouts and view upcoming reservations
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8">
        {/* LEFT: Blockout Form + Table */}
        <div className="xl:col-span-3 space-y-6">
          {/* Add Blockout Form */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-stone-900 flex items-center gap-2">
              <CalendarX size={16} className="text-stone-400" />
              Block Dates
            </h2>
            <BlockoutForm rvs={allRvsForForm} />
          </div>

          {/* Active Blockouts */}
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
              <h2 className="font-semibold text-stone-900 flex items-center gap-2">
                <CalendarX size={16} className="text-stone-400" />
                Active Blockouts
              </h2>
              <span className="text-xs text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                {activeBlockouts.length} active
              </span>
            </div>
            {activeBlockouts.length === 0 ? (
              <div className="px-5 py-8 text-center text-stone-400 text-sm">
                No active blockouts.
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-100">
                    <th className="text-left px-4 py-3 font-medium text-stone-500">RV</th>
                    <th className="text-left px-4 py-3 font-medium text-stone-500">Start</th>
                    <th className="text-left px-4 py-3 font-medium text-stone-500">End</th>
                    <th className="text-left px-4 py-3 font-medium text-stone-500">Reason</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {activeBlockouts.map((b) => (
                    <tr key={b.id} className="hover:bg-stone-50">
                      <td className="px-4 py-3 font-medium text-stone-800">
                        {b.rv.emoji} {b.rv.name}
                      </td>
                      <td className="px-4 py-3 text-stone-600">{formatDate(b.startDate)}</td>
                      <td className="px-4 py-3 text-stone-600">{formatDate(b.endDate)}</td>
                      <td className="px-4 py-3 text-stone-500">{b.reason ?? '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <BlockoutDeleteButton blockoutId={b.id} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Past Blockouts */}
          {pastBlockouts.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-xl overflow-hidden opacity-70">
              <div className="px-5 py-4 border-b border-stone-100">
                <h2 className="font-semibold text-stone-600 flex items-center gap-2 text-sm">
                  <Clock size={14} className="text-stone-400" />
                  Past Blockouts ({pastBlockouts.length})
                </h2>
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-100">
                    <th className="text-left px-4 py-2 font-medium text-stone-400 text-xs">RV</th>
                    <th className="text-left px-4 py-2 font-medium text-stone-400 text-xs">Start</th>
                    <th className="text-left px-4 py-2 font-medium text-stone-400 text-xs">End</th>
                    <th className="text-left px-4 py-2 font-medium text-stone-400 text-xs">Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {pastBlockouts.map((b) => (
                    <tr key={b.id}>
                      <td className="px-4 py-2 text-stone-500">{b.rv.emoji} {b.rv.name}</td>
                      <td className="px-4 py-2 text-stone-400 text-xs">{formatDate(b.startDate)}</td>
                      <td className="px-4 py-2 text-stone-400 text-xs">{formatDate(b.endDate)}</td>
                      <td className="px-4 py-2 text-stone-400 text-xs">{b.reason ?? '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* RIGHT: Upcoming Bookings */}
        <div className="xl:col-span-2">
          <div className="bg-white border border-stone-200 rounded-xl overflow-hidden sticky top-6">
            <div className="px-5 py-4 border-b border-stone-100">
              <h2 className="font-semibold text-stone-900 flex items-center gap-2">
                <Calendar size={16} className="text-stone-400" />
                Upcoming Bookings
              </h2>
              <p className="text-xs text-stone-400 mt-0.5">Next 90 days (Confirmed/Approved)</p>
            </div>

            {upcomingBookings.length === 0 ? (
              <div className="px-5 py-8 text-center text-stone-400 text-sm">
                No upcoming confirmed bookings.
              </div>
            ) : (
              <div className="divide-y divide-stone-100 max-h-[600px] overflow-y-auto">
                {upcomingBookings.map((booking) => {
                  const statusColors: Record<string, string> = {
                    CONFIRMED: 'bg-green-100 text-green-700',
                    APPROVED: 'bg-blue-100 text-blue-700',
                    AWAITING_PAYMENT: 'bg-orange-100 text-orange-700',
                  }
                  return (
                    <a
                      key={booking.id}
                      href={`/admin/bookings/${booking.id}`}
                      className="block px-4 py-3 hover:bg-stone-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="font-medium text-stone-800 text-sm truncate">
                            {booking.user.name ?? booking.user.email}
                          </p>
                          <p className="text-xs text-stone-500 mt-0.5">
                            {booking.rv.emoji} {booking.rv.name} · {booking.destination.emoji} {booking.destination.name}
                          </p>
                          <p className="text-xs text-stone-400 mt-0.5">
                            {formatDate(booking.checkIn)} → {formatDate(booking.checkOut)}
                          </p>
                        </div>
                        <span className={`shrink-0 inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${statusColors[booking.status] ?? 'bg-gray-100 text-gray-600'}`}>
                          {booking.status}
                        </span>
                      </div>
                    </a>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
