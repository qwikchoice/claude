import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerAuthSession, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate, getStatusLabel, getStatusColor } from '@/lib/utils'
import { BookingStatus } from '@prisma/client'
import { Search, Filter, ArrowRight } from 'lucide-react'

const STATUS_TABS: { label: string; value: string }[] = [
  { label: 'All', value: 'ALL' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'Approved', value: 'APPROVED' },
  { label: 'Awaiting Payment', value: 'AWAITING_PAYMENT' },
  { label: 'Confirmed', value: 'CONFIRMED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Canceled', value: 'CANCELED' },
  { label: 'Completed', value: 'COMPLETED' },
]

const PAGE_SIZE = 10

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: { status?: string; page?: string; search?: string; from?: string; to?: string }
}) {
  const session = await getServerAuthSession()
  if (!session || !isAdmin(session)) {
    redirect('/login')
  }

  const activeStatus = searchParams.status ?? 'ALL'
  const page = Math.max(1, parseInt(searchParams.page ?? '1', 10))
  const search = searchParams.search ?? ''
  const fromDate = searchParams.from ? new Date(searchParams.from) : undefined
  const toDate = searchParams.to ? new Date(searchParams.to) : undefined

  const whereBase = {
    ...(activeStatus !== 'ALL' ? { status: activeStatus as BookingStatus } : {}),
    ...(search
      ? {
          OR: [
            { user: { name: { contains: search, mode: 'insensitive' as const } } },
            { user: { email: { contains: search, mode: 'insensitive' as const } } },
            { id: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
    ...(fromDate ? { checkIn: { gte: fromDate } } : {}),
    ...(toDate ? { checkOut: { lte: toDate } } : {}),
  }

  const [bookings, totalCount, statusCounts] = await Promise.all([
    prisma.booking.findMany({
      where: whereBase,
      include: {
        user: { select: { name: true, email: true } },
        rv: { select: { name: true, emoji: true } },
        destination: { select: { name: true, emoji: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.booking.count({ where: whereBase }),
    Promise.all(
      STATUS_TABS.map(async (tab) => ({
        value: tab.value,
        count:
          tab.value === 'ALL'
            ? await prisma.booking.count()
            : await prisma.booking.count({ where: { status: tab.value as BookingStatus } }),
      }))
    ),
  ])

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)
  const countMap = Object.fromEntries(statusCounts.map((s) => [s.value, s.count]))

  function buildUrl(params: Record<string, string>) {
    const base = new URLSearchParams({
      status: activeStatus,
      page: '1',
      ...(search ? { search } : {}),
      ...(searchParams.from ? { from: searchParams.from } : {}),
      ...(searchParams.to ? { to: searchParams.to } : {}),
    })
    Object.entries(params).forEach(([k, v]) => {
      if (v) base.set(k, v)
      else base.delete(k)
    })
    return `/admin/bookings?${base.toString()}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">All Bookings</h1>
          <p className="text-stone-500 text-sm mt-1">{totalCount} total booking{totalCount !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-0">
        {STATUS_TABS.map((tab) => {
          const isActive = activeStatus === tab.value
          return (
            <Link
              key={tab.value}
              href={buildUrl({ status: tab.value, page: '1' })}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg border-b-2 transition-colors whitespace-nowrap ${
                isActive
                  ? 'border-amber-500 text-amber-700 bg-amber-50'
                  : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
              }`}
            >
              {tab.label}
              <span
                className={`ml-2 text-xs px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-amber-200 text-amber-800' : 'bg-stone-100 text-stone-500'
                }`}
              >
                {countMap[tab.value] ?? 0}
              </span>
            </Link>
          )
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <form method="GET" action="/admin/bookings" className="flex gap-2 flex-1 min-w-0">
          <input type="hidden" name="status" value={activeStatus} />
          <input type="hidden" name="page" value="1" />
          {searchParams.from && <input type="hidden" name="from" value={searchParams.from} />}
          {searchParams.to && <input type="hidden" name="to" value={searchParams.to} />}
          <div className="relative flex-1 min-w-0 max-w-sm">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              name="search"
              defaultValue={search}
              placeholder="Search by customer or booking ID..."
              className="w-full pl-9 pr-4 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <input
            type="date"
            name="from"
            defaultValue={searchParams.from}
            className="px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <input
            type="date"
            name="to"
            defaultValue={searchParams.to}
            className="px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            type="submit"
            className="flex items-center gap-2 px-4 py-2 bg-stone-800 text-white rounded-lg text-sm font-medium hover:bg-stone-700 transition-colors"
          >
            <Filter size={14} />
            Filter
          </button>
          {(search || searchParams.from || searchParams.to) && (
            <Link
              href={buildUrl({ search: '', from: '', to: '' })}
              className="px-3 py-2 border border-stone-200 text-stone-600 rounded-lg text-sm hover:bg-stone-50 transition-colors"
            >
              Clear
            </Link>
          )}
        </form>
      </div>

      {/* Table */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200">
                <th className="text-left px-4 py-3 font-medium text-stone-500 whitespace-nowrap">Booking ID</th>
                <th className="text-left px-4 py-3 font-medium text-stone-500 whitespace-nowrap">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-stone-500 whitespace-nowrap">RV</th>
                <th className="text-left px-4 py-3 font-medium text-stone-500 whitespace-nowrap">Destination</th>
                <th className="text-left px-4 py-3 font-medium text-stone-500 whitespace-nowrap">Dates</th>
                <th className="text-center px-4 py-3 font-medium text-stone-500">Nights</th>
                <th className="text-center px-4 py-3 font-medium text-stone-500">Guests</th>
                <th className="text-right px-4 py-3 font-medium text-stone-500">Total</th>
                <th className="text-left px-4 py-3 font-medium text-stone-500">Status</th>
                <th className="text-left px-4 py-3 font-medium text-stone-500 whitespace-nowrap">Created</th>
                <th className="text-right px-4 py-3 font-medium text-stone-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {bookings.map((booking) => {
                const color = getStatusColor(booking.status)
                const label = getStatusLabel(booking.status)
                return (
                  <tr key={booking.id} className="hover:bg-stone-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-stone-400">
                      #{booking.id.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-stone-800 whitespace-nowrap">{booking.user.name || 'Unknown'}</p>
                      <p className="text-xs text-stone-400 truncate max-w-[160px]">{booking.user.email}</p>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-stone-700">
                      {booking.rv.emoji} {booking.rv.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-stone-700">
                      {booking.destination.emoji} {booking.destination.name}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-stone-600 text-xs">
                      <span>{formatDate(booking.checkIn)}</span>
                      <span className="block text-stone-400">→ {formatDate(booking.checkOut)}</span>
                    </td>
                    <td className="px-4 py-3 text-center text-stone-700">{booking.nights}</td>
                    <td className="px-4 py-3 text-center text-stone-700">{booking.guests}</td>
                    <td className="px-4 py-3 text-right font-medium text-stone-800 whitespace-nowrap">
                      {formatCurrency(Number(booking.total))}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
                        {label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-stone-400 whitespace-nowrap">
                      {formatDate(booking.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/bookings/${booking.id}`}
                        className="inline-flex items-center gap-1 text-amber-600 hover:text-amber-700 font-medium text-xs whitespace-nowrap"
                      >
                        Manage <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
                )
              })}
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-stone-400">
                    No bookings found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-stone-500">
            Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, totalCount)} of {totalCount}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={buildUrl({ page: String(page - 1) })}
                className="px-4 py-2 border border-stone-200 rounded-lg text-sm hover:bg-stone-50 text-stone-700 transition-colors"
              >
                Previous
              </Link>
            )}
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(page - 2, totalPages - 4)) + i
              return (
                <Link
                  key={p}
                  href={buildUrl({ page: String(p) })}
                  className={`px-4 py-2 border rounded-lg text-sm transition-colors ${
                    p === page
                      ? 'border-amber-500 bg-amber-500 text-white'
                      : 'border-stone-200 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  {p}
                </Link>
              )
            })}
            {page < totalPages && (
              <Link
                href={buildUrl({ page: String(page + 1) })}
                className="px-4 py-2 border border-stone-200 rounded-lg text-sm hover:bg-stone-50 text-stone-700 transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
