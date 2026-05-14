'use client'

import { useState, useEffect, useCallback } from 'react'
import { addDays as dateFnsAddDays, format } from 'date-fns'
import { cn, todayString, calculateNights, formatDateInput } from '@/lib/utils'
import PriceSummary from '@/components/booking/PriceSummary'
import type { PriceBreakdownPublic } from '@/types'

interface StepDatesProps {
  checkIn: string | null
  checkOut: string | null
  guests: number
  nights: number
  rvId: string | null
  selectedAddOnIds: string[]
  onDatesChange: (checkIn: string, checkOut: string, nights: number) => void
  onGuestsChange: (guests: number) => void
  priceBreakdown: PriceBreakdownPublic | null
  onPriceCalculated: (breakdown: PriceBreakdownPublic | null) => void
}

export default function StepDates({
  checkIn,
  checkOut,
  guests,
  nights,
  rvId,
  selectedAddOnIds,
  onDatesChange,
  onGuestsChange,
  priceBreakdown,
  onPriceCalculated,
}: StepDatesProps) {
  const [localCheckIn, setLocalCheckIn] = useState(checkIn ?? '')
  const [localCheckOut, setLocalCheckOut] = useState(checkOut ?? '')
  const [localGuests, setLocalGuests] = useState(guests)
  const [isCalculating, setIsCalculating] = useState(false)
  const [calcError, setCalcError] = useState<string | null>(null)
  const [dateError, setDateError] = useState<string | null>(null)

  const today = todayString()

  // Minimum checkout = checkin + 2 days
  const minCheckOut = localCheckIn
    ? formatDateInput(dateFnsAddDays(new Date(localCheckIn), 2))
    : formatDateInput(dateFnsAddDays(new Date(today), 2))

  const fetchPrice = useCallback(async (ci: string, co: string, g: number, addOnIds: string[]) => {
    if (!rvId || !ci || !co) return
    setIsCalculating(true)
    setCalcError(null)
    try {
      const res = await fetch('/api/pricing/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rvId, checkIn: ci, checkOut: co, addOnIds, guests: g }),
      })
      const json = await res.json()
      if (json.error) {
        setCalcError(json.error)
        onPriceCalculated(null)
      } else {
        onPriceCalculated(json.data)
      }
    } catch {
      setCalcError('Could not calculate price. Please try again.')
      onPriceCalculated(null)
    } finally {
      setIsCalculating(false)
    }
  }, [rvId, onPriceCalculated])

  // Auto-fetch price when dates or guests change
  useEffect(() => {
    if (localCheckIn && localCheckOut && rvId) {
      const n = calculateNights(localCheckIn, localCheckOut)
      if (n >= 2) {
        fetchPrice(localCheckIn, localCheckOut, localGuests, selectedAddOnIds)
      }
    }
  }, [localCheckIn, localCheckOut, localGuests, rvId, selectedAddOnIds, fetchPrice])

  function handleCheckInChange(value: string) {
    setLocalCheckIn(value)
    setDateError(null)

    // If checkout is no longer valid, reset it
    if (localCheckOut) {
      const n = calculateNights(value, localCheckOut)
      if (n < 2) {
        setLocalCheckOut('')
        onPriceCalculated(null)
        return
      }
      onDatesChange(value, localCheckOut, n)
    }
  }

  function handleCheckOutChange(value: string) {
    setLocalCheckOut(value)
    setDateError(null)

    if (localCheckIn) {
      const n = calculateNights(localCheckIn, value)
      if (n < 2) {
        setDateError('Minimum 2-night stay required.')
        onPriceCalculated(null)
        return
      }
      onDatesChange(localCheckIn, value, n)
    }
  }

  function handleGuestsChange(value: number) {
    setLocalGuests(value)
    onGuestsChange(value)
  }

  const currentNights =
    localCheckIn && localCheckOut
      ? calculateNights(localCheckIn, localCheckOut)
      : 0

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-2xl font-bold text-stone-900">
          Select Dates &amp; Guests
        </h2>
        <p className="text-stone-500 mt-1 text-sm">
          Minimum 2-night stay required.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Check-in */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Check-in Date
          </label>
          <input
            type="date"
            value={localCheckIn}
            min={today}
            onChange={(e) => handleCheckInChange(e.target.value)}
            className="w-full border border-stone-200 rounded-xl px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
          />
        </div>

        {/* Check-out */}
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1.5">
            Check-out Date
          </label>
          <input
            type="date"
            value={localCheckOut}
            min={minCheckOut}
            disabled={!localCheckIn}
            onChange={(e) => handleCheckOutChange(e.target.value)}
            className={cn(
              'w-full border rounded-xl px-4 py-3 text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition',
              !localCheckIn
                ? 'border-stone-100 bg-stone-50 text-stone-400 cursor-not-allowed'
                : 'border-stone-200'
            )}
          />
        </div>
      </div>

      {/* Guests */}
      <div className="mt-6 max-w-xs">
        <label className="block text-sm font-medium text-stone-700 mb-1.5">
          Number of Guests
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => handleGuestsChange(Math.max(1, localGuests - 1))}
            className="w-10 h-10 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-700 hover:bg-amber-50 hover:border-amber-300 transition"
          >
            −
          </button>
          <span className="w-12 text-center text-lg font-semibold text-stone-900">
            {localGuests}
          </span>
          <button
            type="button"
            onClick={() => handleGuestsChange(Math.min(6, localGuests + 1))}
            className="w-10 h-10 rounded-full border border-stone-200 bg-white flex items-center justify-center text-stone-700 hover:bg-amber-50 hover:border-amber-300 transition"
          >
            +
          </button>
          <span className="text-sm text-stone-500 ml-1">guest{localGuests !== 1 ? 's' : ''} (max 6)</span>
        </div>
      </div>

      {/* Date error */}
      {dateError && (
        <div className="mt-4 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
          {dateError}
        </div>
      )}

      {/* Nights summary */}
      {currentNights >= 2 && !dateError && (
        <div className="mt-4 inline-flex items-center gap-2 bg-amber-100 text-amber-800 text-sm font-medium px-4 py-2 rounded-full">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          {currentNights} night{currentNights !== 1 ? 's' : ''}
        </div>
      )}

      {/* Minimum stay warning */}
      {currentNights > 0 && currentNights < 2 && (
        <div className="mt-4 bg-amber-50 border border-amber-300 text-amber-800 rounded-xl px-4 py-3 text-sm font-medium">
          Minimum 2-night stay required. Please select a later checkout date.
        </div>
      )}

      {/* Price calculation */}
      {currentNights >= 2 && (
        <div className="mt-6">
          {isCalculating && (
            <div className="flex items-center gap-2 text-stone-500 text-sm py-4">
              <span className="w-4 h-4 border-2 border-amber-300 border-t-amber-600 rounded-full animate-spin" />
              Calculating price...
            </div>
          )}
          {calcError && !isCalculating && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
              {calcError}
            </div>
          )}
          {priceBreakdown && !isCalculating && !calcError && (
            <PriceSummary breakdown={priceBreakdown} showDisclaimer />
          )}
        </div>
      )}

      {!rvId && (
        <div className="mt-4 text-sm text-amber-700 bg-amber-50 rounded-xl px-4 py-3 border border-amber-200">
          Please go back and select an RV before choosing dates.
        </div>
      )}
    </div>
  )
}
