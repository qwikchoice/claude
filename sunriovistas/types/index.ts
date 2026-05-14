import type {
  User,
  RV,
  RVPriceRule,
  Destination,
  AddOn,
  AddOnPriceRule,
  Booking,
  BookingLineItem,
  BookingAddOn,
  Payment,
  TermsDocument,
  CalendarBlockout,
  SiteSetting,
  LeadInquiry,
  BookingStatus,
  PaymentStatus,
  UserRole,
} from '@prisma/client'

// ─────────────────────────────────────────────
// Re-export Prisma enums
// ─────────────────────────────────────────────

export type { BookingStatus, PaymentStatus, UserRole }

// ─────────────────────────────────────────────
// Re-export Prisma model types for convenience
// ─────────────────────────────────────────────

export type {
  User,
  RV,
  RVPriceRule,
  Destination,
  AddOn,
  AddOnPriceRule,
  Booking,
  BookingLineItem,
  BookingAddOn,
  Payment,
  TermsDocument,
  CalendarBlockout,
  SiteSetting,
  LeadInquiry,
}

// ─────────────────────────────────────────────
// Extended types with relations
// ─────────────────────────────────────────────

export type RVWithPriceRules = RV & {
  priceRules: RVPriceRule[]
}

export type RVWithAll = RV & {
  priceRules: RVPriceRule[]
  bookings: Booking[]
  blockouts: CalendarBlockout[]
}

export type AddOnWithPriceRules = AddOn & {
  priceRules: AddOnPriceRule[]
}

export type BookingWithRelations = Booking & {
  user: User
  rv: RV
  destination: Destination
  lineItems: BookingLineItem[]
  addOns: (BookingAddOn & { addOn: AddOn })[]
  payments: Payment[]
}

// ─────────────────────────────────────────────
// Booking wizard state
// ─────────────────────────────────────────────

export interface BookingWizardState {
  step: number
  rvId: string | null
  rvSlug: string | null
  destinationId: string | null
  checkIn: string | null
  checkOut: string | null
  nights: number
  guests: number
  selectedAddOnIds: string[]
  petRequest: boolean
  petNotes: string
  specialRequests: string
  termsAccepted: boolean
  priceBreakdown: PriceBreakdownPublic | null
}

// ─────────────────────────────────────────────
// Price / Pricing
// ─────────────────────────────────────────────

export interface PriceLineItem {
  description: string
  quantity: number
  unitPrice: number
  total: number
  type: string
}

export interface PriceBreakdownPublic {
  nights: number
  subtotal: number
  cleaningFee: number
  addOnTotal: number
  depositAmount: number
  taxAmount: number
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
// API response types
// ─────────────────────────────────────────────

export interface ApiSuccess<T = unknown> {
  data: T
  message?: string
}

export interface ApiError {
  error: string
  details?: unknown
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError

// ─────────────────────────────────────────────
// Form types
// ─────────────────────────────────────────────

export interface BookingRequestBody {
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

// Alias for backward compatibility
export type BookingCreateBody = BookingRequestBody

export interface BookingUpdateBody {
  specialRequests?: string
  petRequest?: boolean
  petNotes?: string
}

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
// Navigation
// ─────────────────────────────────────────────

export interface NavItem {
  label: string
  href: string
  children?: NavItem[]
}

// ─────────────────────────────────────────────
// Admin dashboard stats
// ─────────────────────────────────────────────

export interface DashboardStats {
  totalBookings: number
  pendingApproval: number
  confirmedThisMonth: number
  totalRevenue: number
  revenueThisMonth: number
  averageNights: number
}

// ─────────────────────────────────────────────
// Public-facing summary types (serialized from DB)
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

export interface PaymentPublic {
  id: string
  bookingId: string
  amount: number
  status: PaymentStatus
  refundAmount: number | null
  refundReason: string | null
  createdAt: string
}

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
// Site Settings
// ─────────────────────────────────────────────

export interface SiteSettingMap {
  cleaning_fee: string
  deposit_enabled: string
  deposit_percent: string
  deposit_amount: string
  tax_enabled: string
  tax_percent: string
  terms_version: string
  terms_url: string
  cancellation_policy: string
  pet_policy: string
  min_nights: string
  admin_email: string
}
