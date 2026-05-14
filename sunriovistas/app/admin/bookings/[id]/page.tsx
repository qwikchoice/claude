'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  User,
  Calendar,
  MapPin,
  Home,
  Package,
  DollarSign,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  Send,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
  FileText,
} from 'lucide-react'
import { formatCurrency, formatDate, getStatusLabel, getStatusColor } from '@/lib/utils'
import { CAMPGROUND_FEE_DISCLAIMER } from '@/lib/utils'

interface BookingDetail {
  id: string
  status: string
  checkIn: string
  checkOut: string
  nights: number
  guests: number
  petRequest: boolean
  petNotes: string | null
  specialRequests: string | null
  nightlyRateSnapshot: number
  subtotal: number
  cleaningFee: number
  addOnTotal: number
  depositAmount: number | null
  depositPercent: number | null
  taxAmount: number | null
  taxPercent: number | null
  total: number
  stripePaymentLinkId: string | null
  stripePaymentLinkUrl: string | null
  stripePaymentIntentId: string | null
  paidAt: string | null
  refundAmount: number | null
  refundStatus: string | null
  termsAccepted: boolean
  termsAcceptedAt: string | null
  termsVersion: string | null
  termsUrl: string | null
  termsIpAddress: string | null
  adminNotes: string | null
  rejectionReason: string | null
  createdAt: string
  updatedAt: string
  user: { id: string; name: string | null; email: string | null; image: string | null; accounts: { provider: string }[] }
  rv: { id: string; name: string; emoji: string; tagline: string }
  destination: { id: string; name: string; emoji: string; campgroundFeeEstimate: string | null }
  lineItems: { id: string; description: string; quantity: number; unitPrice: number; total: number; type: string }[]
  addOns: { id: string; price: number; quantity: number; addOn: { name: string; description: string } }[]
  payments: { id: string; amount: number; status: string; stripeChargeId: string | null; createdAt: string }[]
  termsAcceptance: { acceptedAt: string; ipAddress: string | null; termsDocument: { version: string; url: string } } | null
}

export default function AdminBookingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string

  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Action states
  const [rejectionReason, setRejectionReason] = useState('')
  const [adminNotes, setAdminNotes] = useState('')
  const [notesChanged, setNotesChanged] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [refundAmount, setRefundAmount] = useState('')
  const [refundReason, setRefundReason] = useState('')

  const fetchBooking = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`)
      if (!res.ok) {
        const data = await res.json()
        setError(data.error ?? 'Failed to load booking')
        return
      }
      const data = await res.json()
      setBooking(data.data)
      setAdminNotes(data.data.adminNotes ?? '')
    } catch {
      setError('Failed to load booking')
    } finally {
      setLoading(false)
    }
  }, [bookingId])

  useEffect(() => {
    fetchBooking()
  }, [fetchBooking])

  async function handleAction(body: Record<string, unknown>, successMsg: string) {
    setActionLoading(true)
    setActionError(null)
    setActionSuccess(null)
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        setActionError(data.error ?? 'Action failed')
        return
      }
      setActionSuccess(successMsg)
      await fetchBooking()
    } catch {
      setActionError('Network error')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleSendPaymentLink() {
    setActionLoading(true)
    setActionError(null)
    setActionSuccess(null)
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/send-payment-link`, {
        method: 'POST',
      })
      const data = await res.json()
      if (!res.ok) {
        setActionError(data.error ?? 'Failed to generate payment link')
        return
      }
      setActionSuccess('Payment link sent to customer!')
      await fetchBooking()
    } catch {
      setActionError('Network error')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleSaveNotes() {
    await handleAction({ adminNotes }, 'Notes saved.')
    setNotesChanged(false)
  }

  async function handleRefund() {
    const amount = parseFloat(refundAmount)
    if (isNaN(amount) || amount <= 0) {
      setActionError('Enter a valid refund amount')
      return
    }
    await handleAction({ refund: { amount, reason: refundReason } }, 'Refund issued.')
    setRefundAmount('')
    setRefundReason('')
  }

  async function copyLink(url: string) {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="text-center py-16">
        <AlertTriangle className="mx-auto text-red-400 mb-3" size={40} />
        <p className="text-red-600 font-medium">{error ?? 'Booking not found'}</p>
        <Link href="/admin/bookings" className="mt-4 inline-block text-amber-600 hover:underline">
          ← Back to bookings
        </Link>
      </div>
    )
  }

  const statusColor = getStatusColor(booking.status)
  const statusLabel = getStatusLabel(booking.status)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/bookings"
          className="p-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-stone-900">
              Booking #{booking.id.slice(-8).toUpperCase()}
            </h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
              {statusLabel}
            </span>
          </div>
          <p className="text-stone-500 text-sm mt-0.5">Created {formatDate(booking.createdAt)}</p>
        </div>
      </div>

      {/* Feedback banners */}
      {actionSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <CheckCircle size={16} />
          {actionSuccess}
        </div>
      )}
      {actionError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertTriangle size={16} />
          {actionError}
        </div>
      )}

      {/* Two-panel layout */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        {/* LEFT PANEL — Booking Details */}
        <div className="xl:col-span-3 space-y-6">
          {/* Customer Info */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-stone-900 flex items-center gap-2">
              <User size={16} className="text-stone-400" />
              Customer
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-stone-400 text-xs mb-1">Name</p>
                <p className="font-medium text-stone-800">{booking.user.name ?? 'N/A'}</p>
              </div>
              <div>
                <p className="text-stone-400 text-xs mb-1">Email</p>
                <a href={`mailto:${booking.user.email}`} className="font-medium text-amber-600 hover:underline">
                  {booking.user.email ?? 'N/A'}
                </a>
              </div>
              <div>
                <p className="text-stone-400 text-xs mb-1">Auth Provider</p>
                <p className="text-stone-700 capitalize">
                  {booking.user.accounts.map((a) => a.provider).join(', ') || 'Email'}
                </p>
              </div>
              <div>
                <p className="text-stone-400 text-xs mb-1">User ID</p>
                <p className="text-stone-500 font-mono text-xs">{booking.user.id.slice(-12)}</p>
              </div>
            </div>
          </div>

          {/* RV + Destination + Dates */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-stone-900 flex items-center gap-2">
              <Calendar size={16} className="text-stone-400" />
              Booking Details
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-stone-400 text-xs mb-1 flex items-center gap-1"><Home size={10} /> RV</p>
                <p className="font-medium text-stone-800">{booking.rv.emoji} {booking.rv.name}</p>
                <p className="text-xs text-stone-400">{booking.rv.tagline}</p>
              </div>
              <div>
                <p className="text-stone-400 text-xs mb-1 flex items-center gap-1"><MapPin size={10} /> Destination</p>
                <p className="font-medium text-stone-800">{booking.destination.emoji} {booking.destination.name}</p>
                {booking.destination.campgroundFeeEstimate && (
                  <p className="text-xs text-stone-400">Est. site fee: {booking.destination.campgroundFeeEstimate}</p>
                )}
              </div>
              <div>
                <p className="text-stone-400 text-xs mb-1">Check-In</p>
                <p className="font-medium text-stone-800">{formatDate(booking.checkIn)}</p>
              </div>
              <div>
                <p className="text-stone-400 text-xs mb-1">Check-Out</p>
                <p className="font-medium text-stone-800">{formatDate(booking.checkOut)}</p>
              </div>
              <div>
                <p className="text-stone-400 text-xs mb-1">Nights</p>
                <p className="font-medium text-stone-800">{booking.nights}</p>
              </div>
              <div>
                <p className="text-stone-400 text-xs mb-1">Guests</p>
                <p className="font-medium text-stone-800">{booking.guests}</p>
              </div>
            </div>

            {booking.petRequest && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm">
                <p className="font-medium text-amber-800">🐾 Pet Requested</p>
                {booking.petNotes && <p className="text-amber-700 mt-1 text-xs">{booking.petNotes}</p>}
              </div>
            )}
            {booking.specialRequests && (
              <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 text-sm">
                <p className="font-medium text-stone-700 mb-1">Special Requests</p>
                <p className="text-stone-600 text-xs whitespace-pre-wrap">{booking.specialRequests}</p>
              </div>
            )}
          </div>

          {/* Add-ons */}
          {booking.addOns.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-3">
              <h2 className="font-semibold text-stone-900 flex items-center gap-2">
                <Package size={16} className="text-stone-400" />
                Add-Ons
              </h2>
              <div className="space-y-2">
                {booking.addOns.map((a) => (
                  <div key={a.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-stone-800">{a.addOn.name}</p>
                      <p className="text-xs text-stone-400">{a.addOn.description}</p>
                    </div>
                    <p className="font-medium text-stone-700">
                      {a.quantity > 1 && <span className="text-stone-400 mr-1">x{a.quantity}</span>}
                      {formatCurrency(Number(a.price))}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Price Breakdown */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-3">
            <h2 className="font-semibold text-stone-900 flex items-center gap-2">
              <DollarSign size={16} className="text-stone-400" />
              Price Breakdown
            </h2>
            <table className="w-full text-sm">
              <tbody className="divide-y divide-stone-50">
                {booking.lineItems.map((item) => (
                  <tr key={item.id}>
                    <td className="py-2 text-stone-600">{item.description}</td>
                    <td className="py-2 text-right text-stone-500 text-xs">
                      {item.quantity > 1 && `${item.quantity} ×`}
                    </td>
                    <td className="py-2 text-right font-medium text-stone-800">
                      {formatCurrency(Number(item.total))}
                    </td>
                  </tr>
                ))}
                {booking.lineItems.length === 0 && (
                  <>
                    <tr>
                      <td className="py-2 text-stone-600">
                        {booking.nights} night{booking.nights !== 1 ? 's' : ''} × {formatCurrency(Number(booking.nightlyRateSnapshot))}
                      </td>
                      <td className="py-2" />
                      <td className="py-2 text-right font-medium text-stone-800">{formatCurrency(Number(booking.subtotal))}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-stone-600">Cleaning fee</td>
                      <td className="py-2" />
                      <td className="py-2 text-right font-medium text-stone-800">{formatCurrency(Number(booking.cleaningFee))}</td>
                    </tr>
                    {Number(booking.addOnTotal) > 0 && (
                      <tr>
                        <td className="py-2 text-stone-600">Add-ons</td>
                        <td className="py-2" />
                        <td className="py-2 text-right font-medium text-stone-800">{formatCurrency(Number(booking.addOnTotal))}</td>
                      </tr>
                    )}
                    {booking.depositAmount && Number(booking.depositAmount) > 0 && (
                      <tr>
                        <td className="py-2 text-stone-600">
                          Security deposit {booking.depositPercent ? `(${booking.depositPercent}%)` : ''}
                        </td>
                        <td className="py-2" />
                        <td className="py-2 text-right font-medium text-stone-800">{formatCurrency(Number(booking.depositAmount))}</td>
                      </tr>
                    )}
                    {booking.taxAmount && Number(booking.taxAmount) > 0 && (
                      <tr>
                        <td className="py-2 text-stone-600">
                          Tax {booking.taxPercent ? `(${booking.taxPercent}%)` : ''}
                        </td>
                        <td className="py-2" />
                        <td className="py-2 text-right font-medium text-stone-800">{formatCurrency(Number(booking.taxAmount))}</td>
                      </tr>
                    )}
                  </>
                )}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-stone-200">
                  <td colSpan={2} className="py-3 font-bold text-stone-900">Total</td>
                  <td className="py-3 text-right font-bold text-stone-900 text-base">
                    {formatCurrency(Number(booking.total))}
                  </td>
                </tr>
              </tfoot>
            </table>
            <p className="text-xs text-stone-400 italic mt-2">{CAMPGROUND_FEE_DISCLAIMER}</p>
          </div>

          {/* Terms & Acceptance */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-3">
            <h2 className="font-semibold text-stone-900 flex items-center gap-2">
              <Shield size={16} className="text-stone-400" />
              Terms Acceptance
            </h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-stone-400 text-xs mb-1">Accepted</p>
                <p className={`font-medium ${booking.termsAccepted ? 'text-green-700' : 'text-red-600'}`}>
                  {booking.termsAccepted ? 'Yes' : 'No'}
                </p>
              </div>
              {booking.termsAcceptedAt && (
                <div>
                  <p className="text-stone-400 text-xs mb-1">Accepted At</p>
                  <p className="text-stone-700">{formatDate(booking.termsAcceptedAt)}</p>
                </div>
              )}
              {booking.termsVersion && (
                <div>
                  <p className="text-stone-400 text-xs mb-1">Terms Version</p>
                  <p className="text-stone-700">{booking.termsVersion}</p>
                </div>
              )}
              {booking.termsIpAddress && (
                <div>
                  <p className="text-stone-400 text-xs mb-1">IP Address</p>
                  <p className="text-stone-500 font-mono text-xs">{booking.termsIpAddress}</p>
                </div>
              )}
              {booking.termsAcceptance && (
                <>
                  <div>
                    <p className="text-stone-400 text-xs mb-1">Document Version</p>
                    <p className="text-stone-700">{booking.termsAcceptance.termsDocument.version}</p>
                  </div>
                  <div>
                    <p className="text-stone-400 text-xs mb-1">Document URL</p>
                    <a href={booking.termsAcceptance.termsDocument.url} target="_blank" rel="noreferrer" className="text-amber-600 hover:underline text-xs truncate block">
                      View Document <FileText size={10} className="inline" />
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Payment History */}
          {booking.payments.length > 0 && (
            <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-3">
              <h2 className="font-semibold text-stone-900 flex items-center gap-2">
                <DollarSign size={16} className="text-stone-400" />
                Payment History
              </h2>
              <div className="space-y-2">
                {booking.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm bg-stone-50 rounded-lg p-3">
                    <div>
                      <p className="font-medium text-stone-800">{formatCurrency(Number(p.amount))}</p>
                      <p className="text-xs text-stone-400">{formatDate(p.createdAt)}</p>
                      {p.stripeChargeId && (
                        <p className="text-xs text-stone-400 font-mono">{p.stripeChargeId}</p>
                      )}
                    </div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      p.status === 'SUCCEEDED' ? 'bg-green-100 text-green-700' :
                      p.status === 'REFUNDED' ? 'bg-blue-100 text-blue-700' :
                      p.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {p.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT PANEL — Admin Actions */}
        <div className="xl:col-span-2 space-y-6">
          {/* Status-based actions */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-stone-900 flex items-center gap-2">
              <Clock size={16} className="text-stone-400" />
              Admin Actions
              <span className={`ml-auto inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                {statusLabel}
              </span>
            </h2>

            {/* PENDING */}
            {booking.status === 'PENDING' && (
              <div className="space-y-4">
                <button
                  onClick={() => handleAction({ action: 'approve' }, 'Booking approved! Customer notified.')}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
                >
                  <CheckCircle size={16} />
                  {actionLoading ? 'Processing...' : 'Approve Booking'}
                </button>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-stone-700">Rejection Reason (optional)</label>
                  <textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={3}
                    placeholder="Dates unavailable, capacity exceeded, etc."
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                  />
                  <button
                    onClick={() => handleAction({ action: 'reject', rejectionReason }, 'Booking rejected. Customer notified.')}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
                  >
                    <XCircle size={15} />
                    {actionLoading ? 'Processing...' : 'Reject Booking'}
                  </button>
                </div>
              </div>
            )}

            {/* APPROVED */}
            {booking.status === 'APPROVED' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
                  <p className="font-medium text-blue-800">Booking approved</p>
                  <p className="text-blue-600 text-xs mt-1">Generate and send a Stripe payment link to the customer.</p>
                </div>

                <div className="bg-stone-50 rounded-lg p-4 text-sm space-y-2">
                  <p className="text-stone-500 text-xs">Amount to charge</p>
                  <p className="text-2xl font-bold text-stone-900">{formatCurrency(Number(booking.total))}</p>
                  <p className="text-xs text-stone-400">
                    {booking.rv.name} · {booking.destination.name} · {booking.nights} nights
                  </p>
                </div>

                {booking.stripePaymentLinkUrl ? (
                  <div className="space-y-2">
                    <p className="text-sm text-stone-600 font-medium">Payment link generated:</p>
                    <div className="flex gap-2">
                      <input
                        readOnly
                        value={booking.stripePaymentLinkUrl}
                        className="flex-1 min-w-0 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono text-stone-600 truncate"
                      />
                      <button
                        onClick={() => copyLink(booking.stripePaymentLinkUrl!)}
                        className="shrink-0 flex items-center gap-1 px-3 py-2 border border-stone-200 rounded-lg text-sm hover:bg-stone-50 transition-colors"
                      >
                        {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <button
                      onClick={handleSendPaymentLink}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
                    >
                      <RefreshCw size={14} />
                      {actionLoading ? 'Resending...' : 'Resend Payment Link'}
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleSendPaymentLink}
                    disabled={actionLoading}
                    className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-medium py-3 rounded-lg transition-colors"
                  >
                    <Send size={16} />
                    {actionLoading ? 'Generating...' : 'Generate & Send Payment Link'}
                  </button>
                )}
              </div>
            )}

            {/* AWAITING_PAYMENT */}
            {booking.status === 'AWAITING_PAYMENT' && (
              <div className="space-y-4">
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-sm">
                  <p className="font-medium text-orange-800">Awaiting customer payment</p>
                  <p className="text-orange-600 text-xs mt-1">Payment link has been sent to the customer.</p>
                </div>
                {booking.stripePaymentLinkUrl && (
                  <div className="space-y-2">
                    <p className="text-sm text-stone-600 font-medium">Current payment link:</p>
                    <div className="flex gap-2">
                      <input
                        readOnly
                        value={booking.stripePaymentLinkUrl}
                        className="flex-1 min-w-0 px-3 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs font-mono text-stone-600 truncate"
                      />
                      <button
                        onClick={() => copyLink(booking.stripePaymentLinkUrl!)}
                        className="shrink-0 flex items-center gap-1 px-3 py-2 border border-stone-200 rounded-lg text-sm hover:bg-stone-50 transition-colors"
                      >
                        {copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                    <button
                      onClick={handleSendPaymentLink}
                      disabled={actionLoading}
                      className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
                    >
                      <RefreshCw size={14} />
                      {actionLoading ? 'Resending...' : 'Resend Payment Link Email'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* CONFIRMED */}
            {booking.status === 'CONFIRMED' && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm">
                  <p className="font-medium text-green-800">Payment received — confirmed!</p>
                  {booking.paidAt && (
                    <p className="text-green-600 text-xs mt-1">Paid on {formatDate(booking.paidAt)}</p>
                  )}
                  {booking.stripePaymentIntentId && (
                    <p className="text-green-600 text-xs mt-1 font-mono">{booking.stripePaymentIntentId}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-stone-700">Issue Refund</p>
                  <input
                    type="number"
                    value={refundAmount}
                    onChange={(e) => setRefundAmount(e.target.value)}
                    placeholder={`Max: ${formatCurrency(Number(booking.total))}`}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <input
                    type="text"
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    placeholder="Refund reason..."
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <button
                    onClick={handleRefund}
                    disabled={actionLoading || !refundAmount}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
                  >
                    {actionLoading ? 'Processing...' : 'Issue Refund'}
                  </button>
                </div>

                <button
                  onClick={() => handleAction({ action: 'complete' }, 'Booking marked as completed.')}
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 bg-stone-600 hover:bg-stone-700 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
                >
                  <CheckCircle size={14} />
                  {actionLoading ? 'Processing...' : 'Mark as Completed'}
                </button>
              </div>
            )}

            {(booking.status === 'REJECTED' || booking.status === 'CANCELED' || booking.status === 'COMPLETED') && (
              <div className="text-sm text-stone-500 py-2">
                {booking.status === 'REJECTED' && booking.rejectionReason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="font-medium text-red-800 mb-1">Rejection Reason</p>
                    <p className="text-red-700 text-xs">{booking.rejectionReason}</p>
                  </div>
                )}
                {booking.refundAmount && Number(booking.refundAmount) > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                    <p className="font-medium text-blue-800">Refund Issued</p>
                    <p className="text-blue-700 text-xs">{formatCurrency(Number(booking.refundAmount))}</p>
                  </div>
                )}
                {booking.status === 'COMPLETED' && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                    <p className="font-medium text-emerald-800">Booking Completed</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Admin Notes — always visible */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-3">
            <h2 className="font-semibold text-stone-900 flex items-center gap-2">
              <FileText size={16} className="text-stone-400" />
              Admin Notes
            </h2>
            <textarea
              value={adminNotes}
              onChange={(e) => { setAdminNotes(e.target.value); setNotesChanged(true) }}
              rows={5}
              placeholder="Internal notes, follow-ups, customer preferences..."
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
            />
            <button
              onClick={handleSaveNotes}
              disabled={actionLoading || !notesChanged}
              className="w-full flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-900 disabled:opacity-40 text-white font-medium py-2.5 rounded-lg transition-colors text-sm"
            >
              {actionLoading ? 'Saving...' : notesChanged ? 'Save Notes' : 'Notes Saved'}
            </button>
          </div>

          {/* Timeline */}
          <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-3">
            <h2 className="font-semibold text-stone-900 flex items-center gap-2">
              <Clock size={16} className="text-stone-400" />
              Timeline
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <div className="w-2 h-2 rounded-full bg-stone-400 mt-1.5 shrink-0" />
                <div>
                  <p className="text-stone-700 font-medium">Booking Created</p>
                  <p className="text-xs text-stone-400">{formatDate(booking.createdAt)}</p>
                </div>
              </div>
              {booking.status !== 'PENDING' && booking.status !== 'DRAFT' && (
                <div className="flex gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    booking.status === 'REJECTED' ? 'bg-red-400' : 'bg-blue-400'
                  }`} />
                  <div>
                    <p className="text-stone-700 font-medium">Status: {statusLabel}</p>
                    <p className="text-xs text-stone-400">{formatDate(booking.updatedAt)}</p>
                  </div>
                </div>
              )}
              {booking.paidAt && (
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-400 mt-1.5 shrink-0" />
                  <div>
                    <p className="text-stone-700 font-medium">Payment Received</p>
                    <p className="text-xs text-stone-400">{formatDate(booking.paidAt)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
