'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { cn, calculateNights } from '@/lib/utils'
import StepRV from '@/components/booking/StepRV'
import StepDestination from '@/components/booking/StepDestination'
import StepDates from '@/components/booking/StepDates'
import StepAddOns from '@/components/booking/StepAddOns'
import StepReview from '@/components/booking/StepReview'
import type { PriceBreakdownPublic } from '@/types'

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

interface WizardState {
  step: number
  rvId: string | null
  rvSlug: string | null
  rvName: string | null
  destinationId: string | null
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
  isSubmitting: boolean
  submitError: string | null
}

export interface BookingWizardProps {
  initialRvSlug?: string
  initialDestinationSlug?: string
  rvs: Array<{
    id: string
    name: string
    slug: string
    tagline: string
    emoji: string
    maxGuests: number
    isActive: boolean
  }>
  destinations: Array<{
    id: string
    name: string
    slug: string
    emoji: string
    campgroundFeeEstimate: string | null
    isActive: boolean
  }>
  addOns: Array<{
    id: string
    name: string
    slug: string
    description: string
    basePrice: number
    isActive: boolean
  }>
  termsUrl: string
  termsVersion: string
}

const STEP_LABELS = [
  'Choose RV',
  'Destination',
  'Dates & Guests',
  'Add-Ons',
  'Review',
]

const TOTAL_STEPS = 5

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function getInitialRv(
  rvs: BookingWizardProps['rvs'],
  slug?: string
): { id: string; name: string; slug: string } | null {
  if (!slug) return null
  return rvs.find((rv) => rv.slug === slug) ?? null
}

function getInitialDestination(
  destinations: BookingWizardProps['destinations'],
  slug?: string
): { id: string; name: string; slug: string } | null {
  if (!slug) return null
  return destinations.find((d) => d.slug === slug) ?? null
}

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────

export default function BookingWizard({
  initialRvSlug,
  initialDestinationSlug,
  rvs,
  destinations,
  addOns,
  termsUrl,
  termsVersion,
}: BookingWizardProps) {
  const { data: session } = useSession()
  const router = useRouter()

  const initialRv = getInitialRv(rvs, initialRvSlug)
  const initialDest = getInitialDestination(destinations, initialDestinationSlug)

  const [wizard, setWizard] = useState<WizardState>({
    step: initialRv ? (initialDest ? 3 : 2) : 1,
    rvId: initialRv?.id ?? null,
    rvSlug: initialRv?.slug ?? null,
    rvName: initialRv?.name ?? null,
    destinationId: initialDest?.id ?? null,
    destinationName: initialDest?.name ?? null,
    checkIn: null,
    checkOut: null,
    nights: 0,
    guests: 2,
    selectedAddOnIds: [],
    petRequest: false,
    petNotes: '',
    specialRequests: '',
    termsAccepted: false,
    priceBreakdown: null,
    isSubmitting: false,
    submitError: null,
  })

  function update(partial: Partial<WizardState>) {
    setWizard((prev) => ({ ...prev, ...partial }))
  }

  // ── Step validation ──────────────────────────────

  function validateStep(step: number): { valid: boolean; error?: string } {
    switch (step) {
      case 1:
        if (!wizard.rvId) return { valid: false, error: 'Please select an RV.' }
        return { valid: true }
      case 2:
        if (!wizard.destinationId) return { valid: false, error: 'Please select a destination.' }
        return { valid: true }
      case 3:
        if (!wizard.checkIn || !wizard.checkOut)
          return { valid: false, error: 'Please select check-in and check-out dates.' }
        if (wizard.nights < 2)
          return { valid: false, error: 'Minimum 2-night stay required.' }
        return { valid: true }
      case 4:
        // Add-ons are optional
        return { valid: true }
      case 5:
        if (!wizard.termsAccepted)
          return { valid: false, error: 'Please accept the Terms & Conditions.' }
        return { valid: true }
      default:
        return { valid: true }
    }
  }

  // ── Navigation ───────────────────────────────────

  function goBack() {
    if (wizard.step > 1) {
      update({ step: wizard.step - 1, submitError: null })
    }
  }

  function goNext() {
    const { valid, error } = validateStep(wizard.step)
    if (!valid) {
      update({ submitError: error ?? null })
      return
    }
    update({ step: wizard.step + 1, submitError: null })
  }

  // ── Submit ───────────────────────────────────────

  async function handleSubmit() {
    // Require login
    if (!session) {
      router.push(`/login?callbackUrl=/book`)
      return
    }

    const { valid, error } = validateStep(5)
    if (!valid) {
      update({ submitError: error ?? null })
      return
    }

    update({ isSubmitting: true, submitError: null })

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rvId: wizard.rvId,
          destinationId: wizard.destinationId,
          checkIn: wizard.checkIn,
          checkOut: wizard.checkOut,
          guests: wizard.guests,
          addOnIds: wizard.selectedAddOnIds,
          petRequest: wizard.petRequest,
          petNotes: wizard.petNotes || undefined,
          specialRequests: wizard.specialRequests || undefined,
          termsAccepted: wizard.termsAccepted,
          termsVersion,
          termsUrl,
        }),
      })

      const json = await res.json()

      if (!res.ok || json.error) {
        update({
          isSubmitting: false,
          submitError: json.error ?? 'Booking submission failed. Please try again.',
        })
        return
      }

      // Success — advance to step 6
      update({ isSubmitting: false, step: 6 })

      // Redirect to confirmation page
      router.push(`/book/confirmation?bookingId=${json.data.id}&status=pending`)
    } catch {
      update({
        isSubmitting: false,
        submitError: 'A network error occurred. Please try again.',
      })
    }
  }

  // ── Render step content ──────────────────────────

  function renderStep() {
    switch (wizard.step) {
      case 1:
        return (
          <StepRV
            rvs={rvs}
            selectedRvId={wizard.rvId}
            onSelect={(rv) => {
              update({ rvId: rv.id, rvSlug: rv.slug, rvName: rv.name, step: 2, submitError: null })
            }}
          />
        )
      case 2:
        return (
          <StepDestination
            destinations={destinations}
            selectedDestinationId={wizard.destinationId}
            onSelect={(dest) => {
              update({ destinationId: dest.id, destinationName: dest.name, step: 3, submitError: null })
            }}
          />
        )
      case 3:
        return (
          <StepDates
            checkIn={wizard.checkIn}
            checkOut={wizard.checkOut}
            guests={wizard.guests}
            nights={wizard.nights}
            rvId={wizard.rvId}
            selectedAddOnIds={wizard.selectedAddOnIds}
            onDatesChange={(checkIn, checkOut, nights) =>
              update({ checkIn, checkOut, nights })
            }
            onGuestsChange={(guests) => update({ guests })}
            priceBreakdown={wizard.priceBreakdown}
            onPriceCalculated={(breakdown) => update({ priceBreakdown: breakdown })}
          />
        )
      case 4:
        return (
          <StepAddOns
            addOns={addOns}
            selectedAddOnIds={wizard.selectedAddOnIds}
            checkIn={wizard.checkIn}
            onToggle={(addOnId) => {
              const current = wizard.selectedAddOnIds
              const next = current.includes(addOnId)
                ? current.filter((id) => id !== addOnId)
                : [...current, addOnId]
              update({ selectedAddOnIds: next })
            }}
          />
        )
      case 5:
        return (
          <StepReview
            state={{
              rvName: wizard.rvName,
              destinationName: wizard.destinationName,
              checkIn: wizard.checkIn,
              checkOut: wizard.checkOut,
              nights: wizard.nights,
              guests: wizard.guests,
              selectedAddOnIds: wizard.selectedAddOnIds,
              petRequest: wizard.petRequest,
              petNotes: wizard.petNotes,
              specialRequests: wizard.specialRequests,
              termsAccepted: wizard.termsAccepted,
              priceBreakdown: wizard.priceBreakdown,
            }}
            addOns={addOns}
            onSpecialRequestsChange={(v) => update({ specialRequests: v })}
            onPetRequestChange={(v) => update({ petRequest: v })}
            onPetNotesChange={(v) => update({ petNotes: v })}
            onTermsChange={(v) => update({ termsAccepted: v })}
            termsUrl={termsUrl}
            termsVersion={termsVersion}
          />
        )
      case 6:
        return (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-10 h-10 text-amber-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="font-serif text-2xl font-bold text-stone-900 mb-2">
              Request Submitted!
            </h2>
            <p className="text-stone-600 text-sm max-w-sm mx-auto leading-relaxed">
              Your glamping request is under review. We&apos;ll get back to you within{' '}
              <strong>1–2 business days</strong> with an approval decision.
            </p>
            <p className="text-stone-400 text-xs mt-4">
              Redirecting to confirmation page…
            </p>
          </div>
        )
      default:
        return null
    }
  }

  const isLastStep = wizard.step === TOTAL_STEPS
  const isFirstStep = wizard.step === 1
  const isSubmittedStep = wizard.step === 6

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-stone-100 overflow-hidden">
      {/* Progress bar */}
      {!isSubmittedStep && (
        <div className="px-6 pt-6 pb-4 border-b border-stone-100">
          {/* Step labels */}
          <div className="flex items-center justify-between mb-3">
            {STEP_LABELS.map((label, i) => {
              const stepNum = i + 1
              const isActive = wizard.step === stepNum
              const isCompleted = wizard.step > stepNum
              return (
                <div
                  key={label}
                  className={cn(
                    'flex flex-col items-center gap-1 flex-1',
                    i < STEP_LABELS.length - 1 ? 'relative' : ''
                  )}
                >
                  <div
                    className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                      isActive
                        ? 'bg-amber-500 text-white'
                        : isCompleted
                        ? 'bg-amber-200 text-amber-800'
                        : 'bg-stone-100 text-stone-400'
                    )}
                  >
                    {isCompleted ? (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    ) : (
                      stepNum
                    )}
                  </div>
                  <span
                    className={cn(
                      'text-[10px] leading-tight text-center hidden sm:block',
                      isActive ? 'text-amber-700 font-semibold' : 'text-stone-400'
                    )}
                  >
                    {label}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Progress bar */}
          <div className="h-1.5 bg-stone-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 rounded-full transition-all duration-500"
              style={{ width: `${((wizard.step - 1) / (TOTAL_STEPS - 1)) * 100}%` }}
            />
          </div>

          <p className="text-xs text-stone-400 mt-2">
            Step {wizard.step} of {TOTAL_STEPS}
          </p>
        </div>
      )}

      {/* Step content */}
      <div className="p-6 sm:p-8">{renderStep()}</div>

      {/* Error message */}
      {wizard.submitError && (
        <div className="mx-6 mb-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {wizard.submitError}
        </div>
      )}

      {/* Navigation buttons */}
      {!isSubmittedStep && (
        <div className="px-6 pb-6 flex items-center justify-between gap-4 border-t border-stone-100 pt-6">
          <button
            type="button"
            onClick={goBack}
            disabled={isFirstStep || wizard.isSubmitting}
            className={cn(
              'px-6 py-2.5 rounded-xl border font-medium text-sm transition-all',
              isFirstStep
                ? 'border-stone-100 text-stone-300 cursor-not-allowed'
                : 'border-stone-200 text-stone-600 hover:bg-stone-50 hover:border-stone-300'
            )}
          >
            ← Back
          </button>

          {isLastStep ? (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={wizard.isSubmitting || !wizard.termsAccepted}
              className={cn(
                'flex items-center gap-2 px-8 py-2.5 rounded-xl font-semibold text-sm transition-all',
                wizard.isSubmitting || !wizard.termsAccepted
                  ? 'bg-amber-200 text-amber-400 cursor-not-allowed'
                  : 'bg-amber-600 text-white hover:bg-amber-700 shadow-sm hover:shadow-md'
              )}
            >
              {wizard.isSubmitting && (
                <span className="w-4 h-4 border-2 border-amber-300 border-t-white rounded-full animate-spin" />
              )}
              {wizard.isSubmitting ? 'Submitting…' : 'Submit Request'}
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              disabled={wizard.isSubmitting}
              className="px-8 py-2.5 bg-amber-600 text-white rounded-xl font-semibold text-sm hover:bg-amber-700 transition-all shadow-sm hover:shadow-md disabled:opacity-60"
            >
              Continue →
            </button>
          )}
        </div>
      )}
    </div>
  )
}
