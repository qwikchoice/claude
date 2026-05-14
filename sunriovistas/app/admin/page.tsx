import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerAuthSession, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate, getBookingStatusLabel, getBookingStatusColor } from '@/lib/utils'
import StatCard from '@/components/admin/StatCard'
import {
  Calendar,
  Clock,
  CheckCircle,
  DollarSign,
  ArrowRight,
  Home,
  MapPin,
} from 'lucide-react'

export default async function AdminDashboard() {
  const session = await getServerAuthSession()
  if (!session || !isAdmin(session)) {
    redirect('/login')
  }

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [
    totalBookings,
    pendingBookings,
    confirmedThisMonth,
    allRevenueBookings,
    recentBookings,
    activeRVs,
    activeDestinations,
  ] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { status: 'PENDING' } }),
    prisma.booking.count({
      where: { status: 'CONFIRMED', createdAt: { gte: startOfMonth } },
    }),
    prisma.booking.findMany({
      where: { status: { in: ['CONFIRMED', 'COMPLETED'] } },
      select: { total: true },
    }),
    prisma.booking.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        rv: { select: { name: true, emoji: true } },
        destination: { select: { name: true, emoji: true } },
      },
    }),
    prisma.rV.count({ where: { isActive: true } }),
    prisma.destination.count({ where: { isActive: true } }),
  ])

  const totalRevenue = allRevenueBookings.reduce(
    (sum, b) => sum + Number(b.total),
    0
  )

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">
          SunRioVistas Admin
        </h1>
        <p className="text-stone-500 mt-1">
          Welcome back,{' '}
          <span className="font-medium text-stone-700">
            {(session.user as { name?: string | null })?.name || 'Admin'}
          </span>
          . Here&apos;s what&apos;s happening.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Bookings"
          value={totalBookings}
          icon={Calendar}
          color="amber"
        />
        <StatCard
          title="Pending Approval"
          value={pendingBookings}
          subtitle="Need your review"
          icon={Clock}
          color="red"
        />
        <StatCard
          title="Confirmed This Month"
          value={confirmedThisMonth}
          icon={CheckCircle}
          color="green"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          subtitle="Confirmed + Completed"
          icon={DollarSign}
          color="blue"
        />
      </div>

      {/* Quick Actions */}
      {pendingBookings > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
              <Clock size={20} className="text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-amber-900">
                {pendingBookings} booking{pendingBookings !== 1 ? 's' : ''} awaiting approval
              </p>
              <p className="text-sm text-amber-700">Review and approve or reject pending requests</p>
            </div>
          </div>
          <Link
            href="/admin/bookings?status=PENDING"
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shrink-0"
          >
            Review Now
            <ArrowRight size={16} />
          </Link>
        </div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center">
            <Home size={22} className="text-stone-600" />
          </div>
          <div>
            <p className="text-sm text-stone-500">Active RV Experiences</p>
            <p className="text-2xl font-bold text-stone-900">{activeRVs}</p>
            <Link href="/admin/rvs" className="text-xs text-amber-600 hover:underline">
              Manage RVs →
            </Link>
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-stone-100 flex items-center justify-center">
            <MapPin size={22} className="text-stone-600" />
          </div>
          <div>
            <p className="text-sm text-stone-500">Active Destinations</p>
            <p className="text-2xl font-bold text-stone-900">{activeDestinations}</p>
            <Link href="/admin/destinations" className="text-xs text-amber-600 hover:underline">
              Manage Destinations →
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between">
          <h2 className="font-semibold text-stone-900">Recent Bookings</h2>
          <Link
            href="/admin/bookings"
            className="text-sm text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
          >
            View All <ArrowRight size={14} />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-100">
                <th className="text-left px-4 py-3 font-medium text-stone-500 whitespace-nowrap">Booking ID</th>
                <th className="text-left px-4 py-3 font-medium text-stone-500 whitespace-nowrap">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-stone-500 whitespace-nowrap">RV</th>
                <th className="text-left px-4 py-3 font-medium text-stone-500 whitespace-nowrap">Destination</th>
                <th className="text-left px-4 py-3 font-medium text-stone-500 whitespace-nowrap">Dates</th>
                <th className="text-left px-4 py-3 font-medium text-stone-500 whitespace-nowrap">Status</th>
                <th className="text-right px-4 py-3 font-medium text-stone-500 whitespace-nowrap">Total</th>
                <th className="text-right px-4 py-3 font-medium text-stone-500 whitespace-nowrap">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {recentBookings.map((booking) => {
                const statusColor = getBookingStatusColor(booking.status)
                const statusLabel = getBookingStatusLabel(booking.status)
                return (
                  <tr key={booking.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-stone-500">
                      {booking.id.slice(0, 8)}...
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-stone-800">{booking.user.name || 'Unknown'}</p>
                      <p className="text-xs text-stone-400">{booking.user.email}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {booking.rv.emoji} {booking.rv.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      {booking.destination.emoji} {booking.destination.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-stone-600">
                      {formatDate(booking.checkIn)} – {formatDate(booking.checkOut)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}
                      >
                        {statusLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-stone-800">
                      {formatCurrency(Number(booking.total))}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/bookings/${booking.id}`}
                        className="text-amber-600 hover:text-amber-700 font-medium text-xs"
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {recentBookings.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-8 text-center text-stone-400">
                    No bookings yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
