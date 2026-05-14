import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, parseISO } from 'date-fns'
import type { BookingStatus } from '@prisma/client'

// ─────────────────────────────────────────────
// Class name utility
// ─────────────────────────────────────────────

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

// ─────────────────────────────────────────────
// Currency formatting
// ─────────────────────────────────────────────

export function formatCurrency(amount: number | string): string {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num)
}

// ─────────────────────────────────────────────
// Date formatting
// ─────────────────────────────────────────────

function parseDate(date: Date | string): Date {
  if (typeof date === 'string') {
    // Handle ISO strings and yyyy-MM-dd strings
    return date.includes('T') ? new Date(date) : parseISO(date)
  }
  return date
}

/** "May 24, 2025" */
export function formatDate(date: Date | string): string {
  return format(parseDate(date), 'MMMM d, yyyy')
}

/** "May 24" */
export function formatDateShort(date: Date | string): string {
  return format(parseDate(date), 'MMM d')
}

/** "May 24–26, 2025" or "May 24 – Jun 2, 2025" */
export function formatDateRange(checkIn: Date | string, checkOut: Date | string): string {
  const inDate = parseDate(checkIn)
  const outDate = parseDate(checkOut)

  const sameMonth = inDate.getMonth() === outDate.getMonth()
  const sameYear = inDate.getFullYear() === outDate.getFullYear()

  if (sameMonth && sameYear) {
    return `${format(inDate, 'MMMM d')}–${format(outDate, 'd, yyyy')}`
  } else if (sameYear) {
    return `${format(inDate, 'MMM d')} – ${format(outDate, 'MMM d, yyyy')}`
  } else {
    return `${format(inDate, 'MMM d, yyyy')} – ${format(outDate, 'MMM d, yyyy')}`
  }
}

/** "3 days ago", "in 2 weeks", etc. */
export function formatRelativeTime(date: Date | string): string {
  return formatDistanceToNow(parseDate(date), { addSuffix: true })
}

/** "yyyy-MM-dd" — for use in date inputs */
export function formatDateInput(date: Date | string): string {
  return format(parseDate(date), 'yyyy-MM-dd')
}

// ─────────────────────────────────────────────
// Noun formatting
// ─────────────────────────────────────────────

/** "2 nights" | "1 night" */
export function formatNights(nights: number): string {
  return `${nights} night${nights !== 1 ? 's' : ''}`
}

/** "4 guests" | "1 guest" */
export function formatGuests(guests: number): string {
  return `${guests} guest${guests !== 1 ? 's' : ''}`
}

// ─────────────────────────────────────────────
// Booking status helpers
// ─────────────────────────────────────────────

export function getBookingStatusLabel(status: BookingStatus): string {
  const labels: Record<BookingStatus, string> = {
    DRAFT: 'Draft',
    PENDING: 'Pending Review',
    APPROVED: 'Approved',
    AWAITING_PAYMENT: 'Awaiting Payment',
    CONFIRMED: 'Confirmed',
    REJECTED: 'Rejected',
    CANCELED: 'Canceled',
    COMPLETED: 'Completed',
  }
  return labels[status] ?? status
}

/** Returns Tailwind badge classes for a booking status */
export function getBookingStatusColor(status: BookingStatus): string {
  const colors: Record<BookingStatus, string> = {
    DRAFT: 'bg-stone-100 text-stone-600 border-stone-200',
    PENDING: 'bg-amber-100 text-amber-700 border-amber-200',
    APPROVED: 'bg-blue-100 text-blue-700 border-blue-200',
    AWAITING_PAYMENT: 'bg-orange-100 text-orange-700 border-orange-200',
    CONFIRMED: 'bg-green-100 text-green-700 border-green-200',
    REJECTED: 'bg-red-100 text-red-700 border-red-200',
    CANCELED: 'bg-stone-100 text-stone-500 border-stone-200',
    COMPLETED: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  }
  return colors[status] ?? 'bg-stone-100 text-stone-600 border-stone-200'
}

// ─────────────────────────────────────────────
// String utilities
// ─────────────────────────────────────────────

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text
  return text.slice(0, length).trimEnd() + '…'
}

// ─────────────────────────────────────────────
// Date helpers
// ─────────────────────────────────────────────

export function calculateNights(checkIn: string | Date, checkOut: string | Date): number {
  const start = parseDate(checkIn)
  const end = parseDate(checkOut)
  const diff = end.getTime() - start.getTime()
  return Math.round(diff / (1000 * 60 * 60 * 24))
}

export function todayString(): string {
  return formatDateInput(new Date())
}

// ─────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────

export const CAMPGROUND_FEE_DISCLAIMER =
  'Campground fees are paid directly to the campground/host and are not included in your booking total.'

// Legacy aliases for compatibility
export const getStatusLabel = getBookingStatusLabel
export const getStatusColor = getBookingStatusColor
