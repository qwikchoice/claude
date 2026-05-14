'use client'

import Link from 'next/link'
import { formatCurrency, formatDate, getBookingStatusLabel, getBookingStatusColor } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { BookingStatus } from '@prisma/client'

interface BookingRow {
  id: string
  user: { name: string | null; email: string }
  rv: { name: string; emoji: string }
  destination: { name: string }
  checkIn: Date | string
  checkOut: Date | string
  nights: number
  guests: number
  status: BookingStatus
  total: number | string | { toString(): string }
  createdAt: Date | string
}

interface BookingTableProps {
  bookings: BookingRow[]
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  onSendPayment?: (id: string) => void
  compact?: boolean
}

export default function BookingTable({ bookings, onApprove, onReject, onSendPayment, compact }: BookingTableProps) {
  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 text-stone-400">
        <p className="text-lg">No bookings found</p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-stone-200">
        <thead className="bg-stone-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">ID</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Customer</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">RV</th>
            {!compact && <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Destination</th>}
            <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Dates</th>
            {!compact && <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Guests</th>}
            <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Total</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Status</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-stone-100">
          {bookings.map((booking) => (
            <tr key={booking.id} className="hover:bg-stone-50 transition-colors">
              <td className="px-4 py-3">
                <Link href={`/admin/bookings/${booking.id}`} className="text-amber-700 hover:text-amber-900 font-mono text-xs font-semibold">
                  #{booking.id.slice(-8).toUpperCase()}
                </Link>
              </td>
              <td className="px-4 py-3">
                <div>
                  <p className="text-sm font-medium text-stone-900">{booking.user.name ?? 'Guest'}</p>
                  <p className="text-xs text-stone-500">{booking.user.email}</p>
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="text-sm text-stone-700">
                  {booking.rv.emoji} {booking.rv.name}
                </span>
              </td>
              {!compact && (
                <td className="px-4 py-3 text-sm text-stone-700">{booking.destination.name}</td>
              )}
              <td className="px-4 py-3">
                <div>
                  <p className="text-xs text-stone-700">{formatDate(booking.checkIn)}</p>
                  <p className="text-xs text-stone-500">→ {formatDate(booking.checkOut)}</p>
                  <p className="text-xs text-stone-400">{booking.nights} nights</p>
                </div>
              </td>
              {!compact && (
                <td className="px-4 py-3 text-sm text-stone-700">{booking.guests}</td>
              )}
              <td className="px-4 py-3 text-sm font-semibold text-stone-900">
                {formatCurrency(Number(booking.total))}
              </td>
              <td className="px-4 py-3">
                <span className={cn('badge text-xs', getBookingStatusColor(booking.status))}>
                  {getBookingStatusLabel(booking.status)}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Link
                    href={`/admin/bookings/${booking.id}`}
                    className="text-xs px-2.5 py-1 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-medium transition-colors"
                  >
                    View
                  </Link>
                  {booking.status === 'PENDING' && (
                    <>
                      {onApprove && (
                        <button
                          onClick={() => onApprove(booking.id)}
                          className="text-xs px-2.5 py-1 rounded-md bg-green-100 hover:bg-green-200 text-green-700 font-medium transition-colors"
                        >
                          Approve
                        </button>
                      )}
                      {onReject && (
                        <button
                          onClick={() => onReject(booking.id)}
                          className="text-xs px-2.5 py-1 rounded-md bg-red-100 hover:bg-red-200 text-red-700 font-medium transition-colors"
                        >
                          Reject
                        </button>
                      )}
                    </>
                  )}
                  {booking.status === 'APPROVED' && onSendPayment && (
                    <button
                      onClick={() => onSendPayment(booking.id)}
                      className="text-xs px-2.5 py-1 rounded-md bg-amber-100 hover:bg-amber-200 text-amber-700 font-medium transition-colors"
                    >
                      Send Payment
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
