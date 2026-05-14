import { BookingStatus, PaymentStatus, UserRole } from '@prisma/client'

// ─────────────────────────────────────────────
// Price / Pricing
// ─────────────────────────────────────────────

export interface PriceLineItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
  type: 'nightly' | 'cleaning' | 'addon' | 'deposit' | 'tax'
}

export interface PriceBreakdownPublic {
  nights: number
  nightlyRate: number
  subtotal: number
  cleaningFee: number
  addOnTotal: number
  depositAmount: number
  depositPercent: number
  taxAmount: number
  taxPercent: number
  total: number
  lineItems: PriceLineItem[]
}

export interface PriceCalculateBody {
  rvId: string
  checkIn: string
  checkOut: string
  addOnIds: string[]
  guests: number
}

// ─────────────────────────────────────────────
// RV
// ─────────────────────────────────────────────

export interface RVPublic {
  id: string
  name: string
  slug: string
  tagline: string
  theme: string
  description: string
  longDescription: string | null
  bestFor: string[]
  vibe: string[]
  maxGuests: number
  bedrooms: number
  bathrooms: number
  amenities: string[]
  images: string[]
  emoji: string
  colorScheme: string
  isActive: boolean
  sortOrder: number
}

export interface RVSummary {
  id: string
  name: string
  slug: string
  tagline: string
  emoji: string
  maxGuests: number
  isActive: boolean
}

// ─────────────────────────────────────────────
// Destination
// ─────────────────────────────────────────────

export interface DestinationPublic {
  id: string
  name: string
  slug: string
  description: string
  longDescription: string | null
  location: string | null
  campgroundFeeEstimate: string | null
  campgroundFeeNote: string | null
  campgroundFeeDisclaimer: string | null
  hookupAvailable: boolean
  activities: string[]
  highlights: string[]
  images: string[]
  emoji: string
  isActive: boolean
  sortOrder: number
}

export interface DestinationSummary {
  id: string
  name: string
  slug: string
  emoji: string
  campgroundFeeEstimate: string | null
  isActive: boolean
}

// ─────────────────────────────────────────────
// AddOn
// ─────────────────────────────────────────────

export interface AddOnPublic {
  id: string
  name: string
  slug: string
  description: string
  longDescription: string | null
  basePrice: number
  isActive: boolean
  sortOrder: number
}

export interface AddOnSummary {
  id: string
  name: string
  slug: string
  description: string
  basePrice: number
  isActive: boolean
}

// ─────────────────────────────────────────────
// Booking
// ─────────────────────────────────────────────

export interface BookingCreateBody {
  rvId: string
  destinationId: string
  checkIn: string
  checkOut: string
  guests: number
  addOnIds: string[]
  petRequest: boolean
  petNotes?: string
  specialRequests?: string
  termsAccepted: boolean
  termsVersion: string
  termsUrl: string
}

export interface BookingUpdateBody {
  specialRequests?: string
  petRequest?: boolean
  petNotes?: string
}

export interface BookingPublic {
  id: string
  userId: string
  rvId: string
  destinationId: string
  checkIn: string
  checkOut: string
  nights: number
  guests: number
  petRequest: boolean
  petNotes: string | null
  specialRequests: string | null
  status: BookingStatus
  nightlyRateSnapshot: number
  subtotal: number
  cleaningFee: number
  addOnTotal: number
  depositAmount: number | null
  depositPercent: number | null
  taxAmount: number | null
  taxPercent: number | null
  total: number
  stripePaymentLinkUrl: string | null
  paidAt: string | null
  termsAccepted: boolean
  termsAcceptedAt: string | null
  termsVersion: string | null
  termsUrl: string | null
  createdAt: string
  updatedAt: string
  rv?: RVSummary
  destination?: DestinationSummary
  addOns?: BookingAddOnPublic[]
  lineItems?: BookingLineItemPublic[]
  payments?: PaymentPublic[]
}

export interface BookingAddOnPublic {
  id: string
  addOnId: string
  price: number
  quantity: number
  addOn?: AddOnSummary
}

export interface BookingLineItemPublic {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
  type: string
}

// ─────────────────────────────────────────────
// Payment
// ─────────────────────────────────────────────

export interface PaymentPublic {
  id: string
  bookingId: string
  amount: number
  status: PaymentStatus
  refundAmount: number | null
  refundReason: string | null
  createdAt: string
}

// ─────────────────────────────────────────────
// Lead Inquiry
// ─────────────────────────────────────────────

export interface LeadInquiryBody {
  name: string
  email: string
  phone?: string
  preferredDates?: string
  destination?: string
  groupSize?: string
  experienceType?: string
  message?: string
  source?: string
}

// ─────────────────────────────────────────────
// Site Settings
// ─────────────────────────────────────────────

export interface SiteSettingMap {
  cleaning_fee: string
  deposit_enabled: string
  deposit_percent: string
  tax_enabled: string
  tax_percent: string
  admin_email: string
  contact_email: string
  stripe_payment_link_base: string
}

// ─────────────────────────────────────────────
// User
// ─────────────────────────────────────────────

export interface UserPublic {
  id: string
  name: string | null
  email: string | null
  image: string | null
  role: UserRole
  phone: string | null
  createdAt: string
}

// ─────────────────────────────────────────────
// API Responses
// ─────────────────────────────────────────────

export type ApiSuccess<T> = { data: T }
export type ApiError = { error: string }
export type ApiResponse<T> = ApiSuccess<T> | ApiError
