import { cn, formatDate, formatCurrency, CAMPGROUND_FEE_DISCLAIMER } from '@/lib/utils'
import PriceSummary from '@/components/booking/PriceSummary'
import type { PriceBreakdownPublic } from '@/types'

interface AddOnOption {
  id: string
  name: string
  slug: string
  description: string
  basePrice: number
  isActive: boolean
}

interface ReviewState {
  rvName: string | null
  rvEmoji?: string
  destinationName: string | null
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

interface StepReviewProps {
  state: ReviewState
  addOns: AddOnOption[]
  onSpecialRequestsChange: (value: string) => void
  onPetRequestChange: (value: boolean) => void
  onPetNotesChange: (value: string) => void
  onTermsChange: (accepted: boolean) => void
  termsUrl: string
  termsVersion: string
}

export default function StepReview({
  state,
  addOns,
  onSpecialRequestsChange,
  onPetRequestChange,
  onPetNotesChange,
  onTermsChange,
  termsUrl,
  termsVersion,
}: StepReviewProps) {
  const selectedAddOns = addOns.filter((a) => state.selectedAddOnIds.includes(a.id))

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-2xl font-bold text-stone-900">
          Review Your Booking
        </h2>
        <p className="text-stone-500 mt-1 text-sm">
          Please review all details carefully before submitting your request.
        </p>
      </div>

      {/* Booking Summary Card */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-6">
        <h3 className="font-serif font-bold text-stone-900 text-base mb-4">
          Booking Summary
        </h3>

        <div className="space-y-3">
          {/* RV */}
          <div className="flex justify-between items-start">
            <span className="text-sm text-stone-500">RV</span>
            <span className="text-sm font-semibold text-stone-900 text-right max-w-[60%]">
              {state.rvName ?? '—'}
            </span>
          </div>

          {/* Destination */}
          <div className="flex justify-between items-start">
            <span className="text-sm text-stone-500">Destination</span>
            <span className="text-sm font-semibold text-stone-900 text-right max-w-[60%]">
              {state.destinationName ?? '—'}
            </span>
          </div>

          {/* Dates */}
          <div className="flex justify-between items-start">
            <span className="text-sm text-stone-500">Check-in</span>
            <span className="text-sm font-semibold text-stone-900">
              {state.checkIn ? formatDate(state.checkIn) : '—'}
            </span>
          </div>
          <div className="flex justify-between items-start">
            <span className="text-sm text-stone-500">Check-out</span>
            <span className="text-sm font-semibold text-stone-900">
              {state.checkOut ? formatDate(state.checkOut) : '—'}
            </span>
          </div>

          {/* Nights */}
          <div className="flex justify-between items-start">
            <span className="text-sm text-stone-500">Nights</span>
            <span className="text-sm font-semibold text-stone-900">
              {state.nights} night{state.nights !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Guests */}
          <div className="flex justify-between items-start">
            <span className="text-sm text-stone-500">Guests</span>
            <span className="text-sm font-semibold text-stone-900">
              {state.guests} guest{state.guests !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Add-ons */}
          {selectedAddOns.length > 0 && (
            <>
              <div className="border-t border-stone-100 pt-3">
                <span className="text-sm text-stone-500 block mb-2">Add-ons</span>
                <ul className="space-y-1">
                  {selectedAddOns.map((a) => (
                    <li key={a.id} className="flex justify-between text-sm">
                      <span className="text-stone-700">{a.name}</span>
                      <span className="font-medium text-stone-900">
                        {formatCurrency(a.basePrice)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Price Breakdown */}
      {state.priceBreakdown ? (
        <div className="mb-6">
          <PriceSummary breakdown={state.priceBreakdown} showDisclaimer={false} />
        </div>
      ) : (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
          Price will be calculated based on your selected dates and RV.
        </div>
      )}

      {/* Campground fee disclaimer */}
      <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-semibold">Campground fees: </span>
            {CAMPGROUND_FEE_DISCLAIMER}
          </p>
        </div>
      </div>

      {/* Special Requests */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          Special Requests{' '}
          <span className="text-stone-400 font-normal">(optional)</span>
        </label>
        <textarea
          value={state.specialRequests}
          onChange={(e) => onSpecialRequestsChange(e.target.value)}
          rows={3}
          placeholder="Dietary needs, accessibility requirements, celebrations, or anything else we should know..."
          className="w-full border border-stone-200 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition resize-none"
        />
      </div>

      {/* Pet Request */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-stone-700">
              Are you bringing a pet?
            </p>
            <p className="text-xs text-stone-400 mt-0.5">
              Pets are considered on a case-by-case basis.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={state.petRequest}
            onClick={() => onPetRequestChange(!state.petRequest)}
            className={cn(
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2',
              state.petRequest ? 'bg-amber-500' : 'bg-stone-200'
            )}
          >
            <span
              className={cn(
                'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                state.petRequest ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          </button>
        </div>

        {state.petRequest && (
          <div className="mt-3">
            <textarea
              value={state.petNotes}
              onChange={(e) => onPetNotesChange(e.target.value)}
              rows={2}
              placeholder="Tell us about your pet (type, breed, size) and any special needs..."
              className="w-full border border-amber-200 rounded-xl px-4 py-3 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition resize-none bg-amber-50"
            />
          </div>
        )}
      </div>

      {/* Terms & Conditions */}
      <div className="bg-stone-50 border border-stone-200 rounded-2xl p-5">
        <h3 className="font-semibold text-stone-900 text-sm mb-3">
          Terms &amp; Conditions
        </h3>
        <label className="flex items-start gap-3 cursor-pointer group">
          <div className="flex-shrink-0 mt-0.5">
            <input
              type="checkbox"
              checked={state.termsAccepted}
              onChange={(e) => onTermsChange(e.target.checked)}
              className="w-5 h-5 rounded border-stone-300 text-amber-600 focus:ring-amber-400 cursor-pointer"
            />
          </div>
          <span className="text-sm text-stone-700 leading-relaxed">
            I have read and agree to the{' '}
            <a
              href={termsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-700 underline hover:text-amber-800 font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              RV Glamping Terms and Conditions
            </a>{' '}
            (version {termsVersion}). I understand that my booking is subject to admin approval and that
            campground fees are paid separately.
          </span>
        </label>

        {!state.termsAccepted && (
          <p className="text-xs text-stone-400 mt-2 ml-8">
            You must accept the terms to submit your booking request.
          </p>
        )}
      </div>
    </div>
  )
}
