'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface RV {
  id: string
  name: string
  emoji: string
}

interface BlockoutFormProps {
  rvs: RV[]
  onSave: (data: BlockoutData) => Promise<void>
  onCancel: () => void
}

export interface BlockoutData {
  rvId: string
  startDate: string
  endDate: string
  reason: string
}

const REASON_OPTIONS = [
  { value: 'Maintenance', label: '🔧 Maintenance' },
  { value: 'Cleaning', label: '🧹 Deep Cleaning' },
  { value: 'Owner Use', label: '🏠 Owner Use' },
  { value: 'Personal', label: '📅 Personal' },
  { value: 'Other', label: '📝 Other' },
]

export default function BlockoutForm({ rvs, onSave, onCancel }: BlockoutFormProps) {
  const [rvId, setRvId] = useState(rvs[0]?.id ?? '')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [reason, setReason] = useState('Maintenance')
  const [otherReason, setOtherReason] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const today = new Date().toISOString().split('T')[0]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!rvId || !startDate || !endDate) {
      setError('RV, start date, and end date are required.')
      return
    }

    if (new Date(endDate) < new Date(startDate)) {
      setError('End date must be on or after start date.')
      return
    }

    const finalReason = reason === 'Other' ? (otherReason || 'Other') : reason

    setSaving(true)
    try {
      await onSave({ rvId, startDate, endDate, reason: finalReason })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save blockout.')
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
        <label className="label">RV Experience</label>
        <select value={rvId} onChange={(e) => setRvId(e.target.value)} className="input-field" required>
          {rvs.map((rv) => (
            <option key={rv.id} value={rv.id}>{rv.emoji} {rv.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="label">Start Date</label>
          <input
            type="date"
            value={startDate}
            min={today}
            onChange={(e) => { setStartDate(e.target.value); if (endDate && e.target.value > endDate) setEndDate(e.target.value) }}
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="label">End Date</label>
          <input
            type="date"
            value={endDate}
            min={startDate || today}
            onChange={(e) => setEndDate(e.target.value)}
            className="input-field"
            required
          />
        </div>
      </div>

      <div>
        <label className="label">Reason</label>
        <select value={reason} onChange={(e) => setReason(e.target.value)} className="input-field">
          {REASON_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {reason === 'Other' && (
        <div>
          <label className="label">Specify Reason</label>
          <input
            type="text"
            value={otherReason}
            onChange={(e) => setOtherReason(e.target.value)}
            placeholder="Describe the reason..."
            className="input-field"
          />
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving} className={cn('btn-primary flex-1', saving && 'opacity-60 cursor-not-allowed')}>
          {saving ? 'Saving...' : 'Block Dates'}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary flex-1">
          Cancel
        </button>
      </div>
    </form>
  )
}
