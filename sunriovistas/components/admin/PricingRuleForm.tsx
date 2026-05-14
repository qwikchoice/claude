'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface PricingRuleFormProps {
  rvId?: string
  addOnId?: string
  onSave: (data: PricingRuleData) => Promise<void>
  onCancel: () => void
  initialData?: Partial<PricingRuleData>
}

export interface PricingRuleData {
  name: string
  startDate: string
  endDate: string
  nightlyRate?: number
  weekendRate?: number
  price?: number
  minNights: number
  isActive: boolean
}

export default function PricingRuleForm({ rvId, addOnId, onSave, onCancel, initialData }: PricingRuleFormProps) {
  const isAddon = Boolean(addOnId)

  const [name, setName] = useState(initialData?.name ?? '')
  const [startDate, setStartDate] = useState(initialData?.startDate ?? '')
  const [endDate, setEndDate] = useState(initialData?.endDate ?? '')
  const [nightlyRate, setNightlyRate] = useState(String(initialData?.nightlyRate ?? ''))
  const [weekendRate, setWeekendRate] = useState(String(initialData?.weekendRate ?? ''))
  const [price, setPrice] = useState(String(initialData?.price ?? ''))
  const [minNights, setMinNights] = useState(String(initialData?.minNights ?? '2'))
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name || !startDate || !endDate) {
      setError('Name, start date, and end date are required.')
      return
    }

    if (new Date(endDate) <= new Date(startDate)) {
      setError('End date must be after start date.')
      return
    }

    if (isAddon) {
      if (!price || isNaN(Number(price)) || Number(price) <= 0) {
        setError('Price must be a positive number.')
        return
      }
    } else {
      if (!nightlyRate || isNaN(Number(nightlyRate)) || Number(nightlyRate) <= 0) {
        setError('Nightly rate must be a positive number.')
        return
      }
    }

    setSaving(true)
    try {
      await onSave({
        name,
        startDate,
        endDate,
        nightlyRate: isAddon ? undefined : Number(nightlyRate),
        weekendRate: weekendRate ? Number(weekendRate) : undefined,
        price: isAddon ? Number(price) : undefined,
        minNights: Number(minNights) || 2,
        isActive,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save rule.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
      )}

      <div>
        <label className="label">Rule Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Summer 2025, Holiday Weekend"
          className="input-field"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Start Date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="input-field" required />
        </div>
        <div>
          <label className="label">End Date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} min={startDate} className="input-field" required />
        </div>
      </div>

      {isAddon ? (
        <div>
          <label className="label">Price ($)</label>
          <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} min="0" step="0.01" placeholder="0.00" className="input-field" required />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Nightly Rate ($)</label>
              <input type="number" value={nightlyRate} onChange={(e) => setNightlyRate(e.target.value)} min="0" step="0.01" placeholder="0.00" className="input-field" required />
            </div>
            <div>
              <label className="label">Weekend Rate ($ optional)</label>
              <input type="number" value={weekendRate} onChange={(e) => setWeekendRate(e.target.value)} min="0" step="0.01" placeholder="Same as nightly" className="input-field" />
            </div>
          </div>
          <div>
            <label className="label">Minimum Nights</label>
            <input type="number" value={minNights} onChange={(e) => setMinNights(e.target.value)} min="1" max="30" className="input-field" />
          </div>
        </>
      )}

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isActive"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          className="h-4 w-4 accent-amber-600"
        />
        <label htmlFor="isActive" className="text-sm text-stone-700">Active (applies to bookings)</label>
      </div>

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className={cn('btn-primary flex-1', saving && 'opacity-60 cursor-not-allowed')}>
          {saving ? 'Saving...' : 'Save Rule'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">
          Cancel
        </button>
      </div>
    </form>
  )
}
