import type { PriceBreakdownPublic, PriceLineItem } from '@/types'

interface PriceRule {
  startDate: Date
  endDate: Date
  nightlyRate: number
  weekendRate: number | null
  minNights: number
  isActive: boolean
}

interface AddOnWithPrice {
  id: string
  name: string
  basePrice: number
  priceRules?: Array<{
    startDate: Date
    endDate: Date
    price: number
    isActive: boolean
  }>
}

interface CalculatePriceParams {
  checkIn: Date | string
  checkOut: Date | string
  priceRules: PriceRule[]
  addOns?: AddOnWithPrice[]
  cleaningFee: number
  depositEnabled: boolean
  depositPercent: number
  taxEnabled: boolean
  taxPercent: number
}

function isWeekend(date: Date): boolean {
  const day = date.getDay()
  return day === 5 || day === 6 // Friday or Saturday night
}

function parseDate(d: Date | string): Date {
  return typeof d === 'string' ? new Date(d) : d
}

function getApplicableRate(date: Date, rules: PriceRule[]): number | null {
  const activeRules = rules
    .filter((r) => r.isActive && r.startDate <= date && r.endDate >= date)
    .sort((a, b) => a.startDate.getTime() - b.startDate.getTime())

  const rule = activeRules[0]
  if (!rule) return null

  if (isWeekend(date) && rule.weekendRate != null) {
    return Number(rule.weekendRate)
  }
  return Number(rule.nightlyRate)
}

function getAddOnPrice(addOn: AddOnWithPrice, checkIn: Date): number {
  if (addOn.priceRules && addOn.priceRules.length > 0) {
    const activeRule = addOn.priceRules.find(
      (r) => r.isActive && r.startDate <= checkIn && r.endDate >= checkIn
    )
    if (activeRule) return Number(activeRule.price)
  }
  return Number(addOn.basePrice)
}

export function calculatePrice(params: CalculatePriceParams): PriceBreakdownPublic {
  const checkIn = parseDate(params.checkIn)
  const checkOut = parseDate(params.checkOut)

  const nights = Math.round(
    (checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)
  )

  const lineItems: PriceLineItem[] = []

  // Calculate nightly rates per day
  let subtotal = 0
  let nightlyRateForDisplay = 0
  let nightsCounted = 0

  const current = new Date(checkIn)
  while (current < checkOut) {
    const rate = getApplicableRate(current, params.priceRules)
    if (rate !== null) {
      subtotal += rate
      nightsCounted++
      if (nightlyRateForDisplay === 0) nightlyRateForDisplay = rate
    }
    current.setDate(current.getDate() + 1)
  }

  // If we have no price rules covering some nights, fall back to 0
  // Use an average nightly rate for display
  if (nightsCounted > 0) {
    nightlyRateForDisplay = subtotal / nightsCounted
  }

  lineItems.push({
    description: `${nights} night${nights !== 1 ? 's' : ''} × ${nightlyRateForDisplay % 1 === 0 ? `$${nightlyRateForDisplay}` : `$${nightlyRateForDisplay.toFixed(2)}`}/night`,
    quantity: nights,
    unitPrice: nightlyRateForDisplay,
    total: subtotal,
    type: 'nightly',
  })

  // Cleaning fee
  lineItems.push({
    description: 'Cleaning fee',
    quantity: 1,
    unitPrice: params.cleaningFee,
    total: params.cleaningFee,
    type: 'cleaning',
  })

  // Add-ons
  let addOnTotal = 0
  if (params.addOns && params.addOns.length > 0) {
    for (const addOn of params.addOns) {
      const price = getAddOnPrice(addOn, checkIn)
      addOnTotal += price
      lineItems.push({
        description: addOn.name,
        quantity: 1,
        unitPrice: price,
        total: price,
        type: 'addon',
      })
    }
  }

  const preDepositTotal = subtotal + params.cleaningFee + addOnTotal

  // Deposit
  let depositAmount = 0
  if (params.depositEnabled && params.depositPercent > 0) {
    depositAmount = Math.round((preDepositTotal * params.depositPercent) / 100 * 100) / 100
    lineItems.push({
      description: `Security deposit (${params.depositPercent}%)`,
      quantity: 1,
      unitPrice: depositAmount,
      total: depositAmount,
      type: 'deposit',
    })
  }

  const preTaxTotal = preDepositTotal + depositAmount

  // Tax
  let taxAmount = 0
  if (params.taxEnabled && params.taxPercent > 0) {
    taxAmount = Math.round((preTaxTotal * params.taxPercent) / 100 * 100) / 100
    lineItems.push({
      description: `Tax (${params.taxPercent}%)`,
      quantity: 1,
      unitPrice: taxAmount,
      total: taxAmount,
      type: 'tax',
    })
  }

  const total = preTaxTotal + taxAmount

  return {
    nights,
    nightlyRate: nightlyRateForDisplay,
    subtotal,
    cleaningFee: params.cleaningFee,
    addOnTotal,
    depositAmount,
    depositPercent: params.depositEnabled ? params.depositPercent : 0,
    taxAmount,
    taxPercent: params.taxEnabled ? params.taxPercent : 0,
    total,
    lineItems,
  }
}
