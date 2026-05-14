'use client'

import { useEffect, useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  Edit,
  Check,
  AlertTriangle,
  CalendarX,
} from 'lucide-react'
import PricingRuleForm from '@/components/admin/PricingRuleForm'
import BlockoutForm from '@/components/admin/BlockoutForm'
import { formatDate, formatCurrency } from '@/lib/utils'

interface PriceRule {
  id: string
  name: string
  startDate: string
  endDate: string
  nightlyRate: number
  weekendRate: number | null
  minNights: number
  isActive: boolean
}

interface Blockout {
  id: string
  startDate: string
  endDate: string
  reason: string | null
}

interface RVData {
  id: string
  name: string
  slug: string
  tagline: string
  description: string
  longDescription: string | null
  maxGuests: number
  bedrooms: number
  bathrooms: number
  amenities: string[]
  images: string[]
  emoji: string
  isActive: boolean
  sortOrder: number
  priceRules: PriceRule[]
  blockouts: Blockout[]
}

type Tab = 'details' | 'pricing' | 'blockouts'

export default function AdminRVDetailPage() {
  const params = useParams()
  const rvId = params.id as string

  const [rv, setRv] = useState<RVData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<Tab>('details')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Details form state
  const [form, setForm] = useState({
    name: '',
    tagline: '',
    description: '',
    longDescription: '',
    maxGuests: 2,
    bedrooms: 1,
    bathrooms: 1,
    isActive: true,
    sortOrder: 0,
    amenitiesText: '',
  })

  // Pricing rule form
  const [showPricingForm, setShowPricingForm] = useState(false)
  const [editingRule, setEditingRule] = useState<PriceRule | null>(null)

  // Blockout form
  const [showBlockoutForm, setShowBlockoutForm] = useState(false)

  const fetchRV = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/rvs/${rvId}`)
      if (!res.ok) return
      const data = await res.json()
      const d: RVData = data.data
      setRv(d)
      setForm({
        name: d.name,
        tagline: d.tagline,
        description: d.description,
        longDescription: d.longDescription ?? '',
        maxGuests: d.maxGuests,
        bedrooms: d.bedrooms,
        bathrooms: d.bathrooms,
        isActive: d.isActive,
        sortOrder: d.sortOrder,
        amenitiesText: d.amenities.join('\n'),
      })
    } finally {
      setLoading(false)
    }
  }, [rvId])

  useEffect(() => {
    fetchRV()
  }, [fetchRV])

  async function handleSaveDetails(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaveMsg(null)
    setSaveError(null)
    try {
      const res = await fetch(`/api/admin/rvs/${rvId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          amenities: form.amenitiesText.split('\n').map((a) => a.trim()).filter(Boolean),
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        setSaveError(d.error ?? 'Save failed')
        return
      }
      setSaveMsg('Changes saved!')
      await fetchRV()
    } catch {
      setSaveError('Network error')
    } finally {
      setSaving(false)
    }
  }

  async function handleSavePricingRule(data: Record<string, unknown>) {
    const url = editingRule
      ? `/api/admin/pricing/rules/${editingRule.id}`
      : '/api/admin/pricing/rules'
    const method = editingRule ? 'PATCH' : 'POST'
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, rvId, type: 'rv' }),
    })
    if (res.ok) {
      setShowPricingForm(false)
      setEditingRule(null)
      await fetchRV()
    }
  }

  async function handleDeletePricingRule(ruleId: string) {
    if (!confirm('Delete this pricing rule?')) return
    await fetch(`/api/admin/pricing/rules/${ruleId}`, { method: 'DELETE' })
    await fetchRV()
  }

  async function handleSaveBlockout(data: Record<string, unknown>) {
    const res = await fetch('/api/admin/blockouts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, rvId }),
    })
    if (res.ok) {
      setShowBlockoutForm(false)
      await fetchRV()
    }
  }

  async function handleDeleteBlockout(blockoutId: string) {
    if (!confirm('Remove this blockout?')) return
    await fetch(`/api/admin/blockouts/${blockoutId}`, { method: 'DELETE' })
    await fetchRV()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!rv) {
    return (
      <div className="text-center py-16 text-red-600">
        <AlertTriangle className="mx-auto mb-3" size={40} />
        RV not found.
        <Link href="/admin/rvs" className="block mt-4 text-amber-600 hover:underline">← Back</Link>
      </div>
    )
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: 'details', label: 'Details' },
    { key: 'pricing', label: `Pricing Rules (${rv.priceRules.length})` },
    { key: 'blockouts', label: `Blockouts (${rv.blockouts.length})` },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href="/admin/rvs"
          className="p-2 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-50 transition-colors"
        >
          <ArrowLeft size={18} />
        </Link>
        <div>
          <h1 className="text-xl font-bold text-stone-900">
            {rv.emoji} {rv.name}
          </h1>
          <p className="text-stone-500 text-sm">{rv.tagline}</p>
        </div>
        <span className={`ml-auto px-2.5 py-0.5 rounded-full text-xs font-medium ${rv.isActive ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
          {rv.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-stone-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === t.key
                ? 'border-amber-500 text-amber-700'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* TAB: Details */}
      {activeTab === 'details' && (
        <form onSubmit={handleSaveDetails} className="space-y-6">
          {saveMsg && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
              <Check size={16} /> {saveMsg}
            </div>
          )}
          {saveError && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
              <AlertTriangle size={16} /> {saveError}
            </div>
          )}

          <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-5">
            <h2 className="font-semibold text-stone-900">Basic Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Tagline</label>
                <input
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Max Guests</label>
                <input
                  type="number"
                  min={1}
                  value={form.maxGuests}
                  onChange={(e) => setForm({ ...form, maxGuests: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Sort Order</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Bedrooms</label>
                <input
                  type="number"
                  min={0}
                  value={form.bedrooms}
                  onChange={(e) => setForm({ ...form, bedrooms: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Bathrooms</label>
                <input
                  type="number"
                  min={0}
                  step={0.5}
                  value={form.bathrooms}
                  onChange={(e) => setForm({ ...form, bathrooms: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Long Description (optional)</label>
              <textarea
                rows={5}
                value={form.longDescription}
                onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                Amenities (one per line)
              </label>
              <textarea
                rows={6}
                value={form.amenitiesText}
                onChange={(e) => setForm({ ...form, amenitiesText: e.target.value })}
                placeholder="King bed&#10;Private bathroom&#10;Air conditioning&#10;Full kitchen&#10;..."
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={form.isActive}
                onClick={() => setForm({ ...form, isActive: !form.isActive })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isActive ? 'bg-green-500' : 'bg-stone-300'}`}
              >
                <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
              <label className="text-sm text-stone-700">Active (visible to customers)</label>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
            <strong>Images:</strong> Upload images via Google Drive and paste the public URLs in the database directly, or integrate a Drive upload workflow.
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      )}

      {/* TAB: Pricing Rules */}
      {activeTab === 'pricing' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-stone-500">Manage date-range pricing for {rv.name}</p>
            <button
              onClick={() => { setEditingRule(null); setShowPricingForm(true) }}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={14} />
              Add Rule
            </button>
          </div>

          {showPricingForm && (
            <div className="bg-white border-2 border-amber-200 rounded-xl p-6">
              <h3 className="font-semibold text-stone-900 mb-4">
                {editingRule ? 'Edit Pricing Rule' : 'New Pricing Rule'}
              </h3>
              <PricingRuleForm
                rvId={rvId}
                rule={editingRule ?? undefined}
                onSave={handleSavePricingRule}
                onCancel={() => { setShowPricingForm(false); setEditingRule(null) }}
              />
            </div>
          )}

          {rv.priceRules.length === 0 ? (
            <div className="text-center py-12 bg-white border border-stone-200 rounded-xl text-stone-400">
              No pricing rules yet. Add one to accept bookings for this RV.
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200">
                    <th className="text-left px-4 py-3 font-medium text-stone-500">Name</th>
                    <th className="text-left px-4 py-3 font-medium text-stone-500">Date Range</th>
                    <th className="text-right px-4 py-3 font-medium text-stone-500">Nightly</th>
                    <th className="text-right px-4 py-3 font-medium text-stone-500">Weekend</th>
                    <th className="text-center px-4 py-3 font-medium text-stone-500">Min Nights</th>
                    <th className="text-center px-4 py-3 font-medium text-stone-500">Active</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {rv.priceRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-stone-50">
                      <td className="px-4 py-3 font-medium text-stone-800">{rule.name}</td>
                      <td className="px-4 py-3 text-stone-600 text-xs">
                        {formatDate(rule.startDate)} → {formatDate(rule.endDate)}
                      </td>
                      <td className="px-4 py-3 text-right text-amber-600 font-medium">
                        {formatCurrency(Number(rule.nightlyRate))}
                      </td>
                      <td className="px-4 py-3 text-right text-stone-500">
                        {rule.weekendRate ? formatCurrency(Number(rule.weekendRate)) : '—'}
                      </td>
                      <td className="px-4 py-3 text-center text-stone-600">{rule.minNights}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${rule.isActive ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-400'}`}>
                          {rule.isActive ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => { setEditingRule(rule); setShowPricingForm(true) }}
                            className="p-1.5 text-stone-400 hover:text-stone-700 rounded transition-colors"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeletePricingRule(rule.id)}
                            className="p-1.5 text-stone-400 hover:text-red-600 rounded transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB: Blockouts */}
      {activeTab === 'blockouts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-stone-500">Block dates when the RV is unavailable</p>
            <button
              onClick={() => setShowBlockoutForm(true)}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
            >
              <CalendarX size={14} />
              Block Dates
            </button>
          </div>

          {showBlockoutForm && (
            <div className="bg-white border-2 border-amber-200 rounded-xl p-6">
              <h3 className="font-semibold text-stone-900 mb-4">Block Dates for {rv.name}</h3>
              <BlockoutForm
                rvs={[{ id: rv.id, name: rv.name, emoji: rv.emoji }]}
                defaultRvId={rvId}
                onSave={handleSaveBlockout}
                onCancel={() => setShowBlockoutForm(false)}
              />
            </div>
          )}

          {rv.blockouts.length === 0 ? (
            <div className="text-center py-12 bg-white border border-stone-200 rounded-xl text-stone-400">
              No blockouts set for this RV.
            </div>
          ) : (
            <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-stone-50 border-b border-stone-200">
                    <th className="text-left px-4 py-3 font-medium text-stone-500">Start Date</th>
                    <th className="text-left px-4 py-3 font-medium text-stone-500">End Date</th>
                    <th className="text-left px-4 py-3 font-medium text-stone-500">Reason</th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {rv.blockouts.map((b) => (
                    <tr key={b.id} className="hover:bg-stone-50">
                      <td className="px-4 py-3 text-stone-700">{formatDate(b.startDate)}</td>
                      <td className="px-4 py-3 text-stone-700">{formatDate(b.endDate)}</td>
                      <td className="px-4 py-3 text-stone-500">{b.reason ?? '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleDeleteBlockout(b.id)}
                          className="p-1.5 text-stone-400 hover:text-red-600 rounded transition-colors"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
