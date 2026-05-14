import { addDays, differenceInDays, getDay, isWithinInterval } from 'date-fns'
import type { RV, RVPriceRule, AddOn, AddOnPriceRule } from '@prisma/client'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface NightRate {
  date: Date
  rate: number
  isWeekend: boolean
  ruleName: string
}

export interface LineItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
  type: 'NIGHTLY' | 'CLEANING' | 'ADDON' | 'DEPOSIT' | 'TAX'
}

export interface PriceBreakdown {
  nights: number
  nightlyRates: NightRate[]
  subtotal: number
  cleaningFee: number
  addOnTotal: number
  depositAmount: number
  taxAmount: number
  total: number
  lineItems: LineItem[]
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function toNumber(value: { toString(): string } | number | string): number {
  if (typeof value === 'number') return value
  return parseFloat(value.toString())
}

/**
 * Returns true if a date is a "weekend night" — Friday or Saturday.
 * (The night OF Friday and Saturday are considered weekend nights.)
 */
function isWeekendNight(date: Date): boolean {
  const day = getDay(date)
  return day === 5 || day === 6 // 5=Friday, 6=Saturday
}

// ─────────────────────────────────────────────
// Price Rule Selection
// ─────────────────────────────────────────────

/**
 * Finds the most specific (narrowest date range) active price rule
 * that contains the given date.
 *
 * @param rules - Array of RV price rules
 * @param date - The date to find a rule for
 * @returns The most specific matching rule, or null if none found
 */
export function findActivePriceRule(
  rules: RVPriceRule[],
  date: Date
): RVPriceRule | null {
  const active = rules.filter((rule) => {
    if (!rule.isActive) return false
    return isWithinInterval(date, {
      start: rule.startDate,
      end: rule.endDate,
    })
  })

  if (active.length === 0) return null

  // Return the narrowest (shortest) date range to get the most specific rule
  return active.sort((a, b) => {
    const rangeA = differenceInDays(a.endDate, a.startDate)
    const rangeB = differenceInDays(b.endDate, b.startDate)
    return rangeA - rangeB
  })[0]
}

// ─────────────────────────────────────────────
// Nightly Rate Calculation
// ─────────────────────────────────────────────

/**
 * Gets the nightly rate for a specific date.
 * Uses weekend rate if applicable and available.
 *
 * @param rv - The RV with its price rules
 * @param date - The night to price
 * @param defaultRate - Fallback rate if no rule is found
 * @returns The rate and the rule name that was applied
 */
export function getNightlyRate(
  rv: RV & { priceRules: RVPriceRule[] },
  date: Date,
  defaultRate: number
): { rate: number; ruleName: string } {
  const rule = findActivePriceRule(rv.priceRules, date)

  if (!rule) {
    return { rate: defaultRate, ruleName: 'Base Rate' }
  }

  const weekend = isWeekendNight(date)

  if (weekend && rule.weekendRate !== null && rule.weekendRate !== undefined) {
    return {
      rate: toNumber(rule.weekendRate),
      ruleName: `${rule.name} (Weekend)`,
    }
  }

  return {
    rate: toNumber(rule.nightlyRate),
    ruleName: rule.name,
  }
}

// ─────────────────────────────────────────────
// Add-On Price Lookup
// ─────────────────────────────────────────────

/**
 * Returns the effective price for an add-on on a given booking start date.
 * Checks price rules first; falls back to basePrice.
 *
 * @param addOn - The add-on with its price rules
 * @param checkIn - The booking check-in date
 * @returns The effective price
 */
export function findAddOnPrice(
  addOn: AddOn & { priceRules: AddOnPriceRule[] },
  checkIn: Date
): number {
  const activeRules = addOn.priceRules.filter((rule) => {
    if (!rule.isActive) return false
    return isWithinInterval(checkIn, {
      start: rule.startDate,
      end: rule.endDate,
    })
  })

  if (activeRules.length === 0) {
    return toNumber(addOn.basePrice)
  }

  // Use the narrowest rule
  const narrowest = activeRules.sort((a, b) => {
    const rangeA = differenceInDays(a.endDate, a.startDate)
    const rangeB = differenceInDays(b.endDate, b.startDate)
    return rangeA - rangeB
  })[0]

  return toNumber(narrowest.price)
}

// ─────────────────────────────────────────────
// Full Price Calculation
// ─────────────────────────────────────────────

export interface CalculatePriceParams {
  rv: RV & { priceRules: RVPriceRule[] }
  checkIn: Date
  checkOut: Date
  selectedAddOns: (AddOn & { priceRules: AddOnPriceRule[] })[]
  settings: Record<string, string>
  defaultNightlyRate?: number
}

/**
 * Calculates a complete price breakdown for a booking.
 *
 * @param params - Pricing parameters
 * @returns Complete price breakdown with line items
 */
export function calculatePrice(params: CalculatePriceParams): PriceBreakdown {
  const { rv, checkIn, checkOut, selectedAddOns, settings, defaultNightlyRate = 0 } = params

  const nights = differenceInDays(checkOut, checkIn)
  const lineItems: LineItem[] = []
  const nightlyRates: NightRate[] = []

  // ── Nightly rates ──────────────────────────
  let subtotal = 0
  for (let i = 0; i < nights; i++) {
    const night = addDays(checkIn, i)
    const weekend = isWeekendNight(night)
    const { rate, ruleName } = getNightlyRate(rv, night, defaultNightlyRate)

    nightlyRates.push({ date: night, rate, isWeekend: weekend, ruleName })
    subtotal += rate
  }

  // Group consecutive nights at the same rate into line items
  const rateGroups: { rate: number; ruleName: string; count: number }[] = []
  for (const nr of nightlyRates) {
    const last = rateGroups[rateGroups.length - 1]
    if (last && last.rate === nr.rate && last.ruleName === nr.ruleName) {
      last.count++
    } else {
      rateGroups.push({ rate: nr.rate, ruleName: nr.ruleName, count: 1 })
    }
  }

  for (const group of rateGroups) {
    lineItems.push({
      description:
        rateGroups.length === 1
          ? `${nights} night${nights !== 1 ? 's' : ''} × $${group.rate.toFixed(2)}/night`
          : `${group.count} night${group.count !== 1 ? 's' : ''} × $${group.rate.toFixed(2)}/night (${group.ruleName})`,
      quantity: group.count,
      unitPrice: group.rate,
      total: group.rate * group.count,
      type: 'NIGHTLY',
    })
  }

  // ── Cleaning fee ───────────────────────────
  const cleaningFee = parseFloat(settings['cleaning_fee'] ?? '0')
  if (cleaningFee > 0) {
    lineItems.push({
      description: 'Cleaning fee',
      quantity: 1,
      unitPrice: cleaningFee,
      total: cleaningFee,
      type: 'CLEANING',
    })
  }

  // ── Add-ons ────────────────────────────────
  let addOnTotal = 0
  for (const addOn of selectedAddOns) {
    const price = findAddOnPrice(addOn, checkIn)
    addOnTotal += price
    lineItems.push({
      description: addOn.name,
      quantity: 1,
      unitPrice: price,
      total: price,
      type: 'ADDON',
    })
  }

  // ── Pre-tax subtotal ───────────────────────
  const preTaxTotal = subtotal + cleaningFee + addOnTotal

  // ── Tax ────────────────────────────────────
  let taxAmount = 0
  const taxEnabled = settings['tax_enabled'] === 'true'
  const taxPercent = parseFloat(settings['tax_percent'] ?? '0')
  if (taxEnabled && taxPercent > 0) {
    taxAmount = Math.round(preTaxTotal * (taxPercent / 100) * 100) / 100
    lineItems.push({
      description: `Tax (${taxPercent}%)`,
      quantity: 1,
      unitPrice: taxAmount,
      total: taxAmount,
      type: 'TAX',
    })
  }

  // ── Deposit ────────────────────────────────
  const total = preTaxTotal + taxAmount
  let depositAmount = 0
  const depositEnabled = settings['deposit_enabled'] === 'true'
  if (depositEnabled) {
    const depositPercent = parseFloat(settings['deposit_percent'] ?? '0')
    const fixedDeposit = parseFloat(settings['deposit_amount'] ?? '0')

    if (depositPercent > 0) {
      depositAmount = Math.round(total * (depositPercent / 100) * 100) / 100
    } else if (fixedDeposit > 0) {
      depositAmount = fixedDeposit
    }

    if (depositAmount > 0) {
      lineItems.push({
        description: `Deposit (${depositPercent > 0 ? `${depositPercent}%` : 'fixed'}) — due now`,
        quantity: 1,
        unitPrice: depositAmount,
        total: depositAmount,
        type: 'DEPOSIT',
      })
    }
  }

  return {
    nights,
    nightlyRates,
    subtotal,
    cleaningFee,
    addOnTotal,
    depositAmount,
    taxAmount,
    total,
    lineItems,
  }
}

// ─────────────────────────────────────────────
// Validation
// ─────────────────────────────────────────────

/**
 * Validates a booking's check-in/check-out dates.
 *
 * @param checkIn - The check-in date
 * @param checkOut - The check-out date
 * @param minNights - Minimum number of nights required
 * @returns Validation result with optional error message
 */
export function validateBooking(
  checkIn: Date,
  checkOut: Date,
  minNights: number
): { valid: boolean; error?: string } {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  if (checkIn < today) {
    return { valid: false, error: 'Check-in date cannot be in the past.' }
  }

  if (checkOut <= checkIn) {
    return { valid: false, error: 'Check-out must be after check-in.' }
  }

  const nights = differenceInDays(checkOut, checkIn)
  if (nights < minNights) {
    return {
      valid: false,
      error: `Minimum stay is ${minNights} night${minNights !== 1 ? 's' : ''}.`,
    }
  }

  return { valid: true }
}

// ─────────────────────────────────────────────
// Availability
// ─────────────────────────────────────────────

/**
 * Returns true if the given date falls within any blockout period.
 *
 * @param date - The date to check
 * @param blockouts - Array of blockout periods
 */
export function isDateBlocked(
  date: Date,
  blockouts: { startDate: Date; endDate: Date }[]
): boolean {
  return blockouts.some((blockout) =>
    isWithinInterval(date, {
      start: blockout.startDate,
      end: blockout.endDate,
    })
  )
}

const UNAVAILABLE_STATUSES = new Set([
  'PENDING',
  'APPROVED',
  'AWAITING_PAYMENT',
  'CONFIRMED',
])

/**
 * Returns an array of available dates within the given range.
 * A date is available if it is not blocked AND not booked by an active booking.
 *
 * @param blockouts - Manual blockout periods
 * @param bookings - Existing bookings with status
 * @param startDate - Start of the range to check
 * @param endDate - End of the range to check
 * @returns Array of available Date objects
 */
export function getAvailableDates(
  blockouts: { startDate: Date; endDate: Date }[],
  bookings: { checkIn: Date; checkOut: Date; status: string }[],
  startDate: Date,
  endDate: Date
): Date[] {
  const availableDates: Date[] = []
  const totalDays = differenceInDays(endDate, startDate)

  for (let i = 0; i < totalDays; i++) {
    const date = addDays(startDate, i)

    // Check blockouts
    if (isDateBlocked(date, blockouts)) continue

    // Check active bookings — a date is booked if it falls within [checkIn, checkOut)
    const isBooked = bookings.some((booking) => {
      if (!UNAVAILABLE_STATUSES.has(booking.status)) return false
      return date >= booking.checkIn && date < booking.checkOut
    })

    if (!isBooked) {
      availableDates.push(date)
    }
  }

  return availableDates
}

/**
 * Returns true if a date range overlaps with any blockout or active booking.
 *
 * @param checkIn - Proposed check-in date
 * @param checkOut - Proposed check-out date
 * @param blockouts - Manual blockout periods
 * @param bookings - Existing bookings with status
 * @returns true if the range is fully available
 */
export function isRangeAvailable(
  checkIn: Date,
  checkOut: Date,
  blockouts: { startDate: Date; endDate: Date }[],
  bookings: { checkIn: Date; checkOut: Date; status: string }[]
): boolean {
  const nights = differenceInDays(checkOut, checkIn)

  for (let i = 0; i < nights; i++) {
    const date = addDays(checkIn, i)

    if (isDateBlocked(date, blockouts)) return false

    const isBooked = bookings.some((booking) => {
      if (!UNAVAILABLE_STATUSES.has(booking.status)) return false
      return date >= booking.checkIn && date < booking.checkOut
    })

    if (isBooked) return false
  }

  return true
}
