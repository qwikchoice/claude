'use client'

import { useEffect, useState } from 'react'
import { Save, Plus, Trash2, Edit, Check, AlertTriangle } from 'lucide-react'
import PricingRuleForm from '@/components/admin/PricingRuleForm'
import { formatCurrency, formatDate } from '@/lib/utils'

interface SiteSettings {
  cleaning_fee?: string
  deposit_enabled?: string
  deposit_percent?: string
  deposit_fixed?: string
  deposit_type?: string
  tax_enabled?: string
  tax_percent?: string
  min_nights?: string
  [key: string]: string | undefined
}

interface RVPriceRule {
  id: string
  rvId: string
  name: string
  startDate: string
  endDate: string
  nightlyRate: number
  weekendRate: number | null
  minNights: number
  isActive: boolean
}

interface RV {
  id: string
  name: string
  emoji: string
  priceRules: RVPriceRule[]
}

export default function AdminPricingPage() {
  const [settings, setSettings] = useState<SiteSettings>({})
  const [rvs, setRvs] = useState<RV[]>([])
  const [loading, setLoading] = useState(true)
  const [savingSettings, setSavingSettings] = useState(false)
  const [settingsSaved, setSettingsSaved] = useState(false)
  const [settingsError, setSettingsError] = useState<string | null>(null)
  const [showPricingForm, setShowPricingForm] = useState(false)
  const [editingRule, setEditingRule] = useState<RVPriceRule | null>(null)

  // Local form state for settings
  const [cleaningFee, setCleaningFee] = useState('60')
  const [depositEnabled, setDepositEnabled] = useState(false)
  const [depositType, setDepositType] = useState<'percent' | 'fixed'>('percent')
  const [depositValue, setDepositValue] = useState('20')
  const [taxEnabled, setTaxEnabled] = useState(false)
  const [taxPercent, setTaxPercent] = useState('0')
  const [minNights, setMinNights] = useState('2')

  async function fetchData() {
    const [settRes, rvRes] = await Promise.all([
      fetch('/api/admin/settings'),
      fetch('/api/admin/rvs'),
    ])
    const settData = await settRes.json()
    const rvData = await rvRes.json()
    const s: SiteSettings = settData.data ?? {}
    setSettings(s)
    setCleaningFee(s.cleaning_fee ?? '60')
    setDepositEnabled(s.deposit_enabled === 'true')
    setDepositType((s.deposit_type as 'percent' | 'fixed') ?? 'percent')
    setDepositValue(s.deposit_percent ?? s.deposit_fixed ?? '20')
    setTaxEnabled(s.tax_enabled === 'true')
    setTaxPercent(s.tax_percent ?? '0')
    setMinNights(s.min_nights ?? '2')
    setRvs(rvData.data ?? [])
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  async function handleSaveSettings() {
    setSavingSettings(true)
    setSettingsSaved(false)
    setSettingsError(null)
    try {
      const body: Record<string, string> = {
        cleaning_fee: cleaningFee,
        deposit_enabled: String(depositEnabled),
        deposit_type: depositType,
        deposit_percent: depositType === 'percent' ? depositValue : '',
        deposit_fixed: depositType === 'fixed' ? depositValue : '',
        tax_enabled: String(taxEnabled),
        tax_percent: taxPercent,
        min_nights: minNights,
      }
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const d = await res.json()
        setSettingsError(d.error ?? 'Failed to save')
        return
      }
      setSettingsSaved(true)
      setTimeout(() => setSettingsSaved(false), 3000)
    } catch {
      setSettingsError('Network error')
    } finally {
      setSavingSettings(false)
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
      body: JSON.stringify({ ...data, type: 'rv' }),
    })
    if (res.ok) {
      setShowPricingForm(false)
      setEditingRule(null)
      await fetchData()
    }
  }

  async function handleDeleteRule(ruleId: string) {
    if (!confirm('Delete this pricing rule?')) return
    await fetch(`/api/admin/pricing/rules/${ruleId}`, { method: 'DELETE' })
    await fetchData()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Global Pricing Rules</h1>
        <p className="text-stone-500 text-sm mt-1">Configure cleaning fees, deposits, taxes, and per-RV pricing</p>
      </div>

      {settingsSaved && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
          <Check size={16} /> Settings saved successfully.
        </div>
      )}
      {settingsError && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg flex items-center gap-2 text-sm">
          <AlertTriangle size={16} /> {settingsError}
        </div>
      )}

      {/* Site-wide settings */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-6">
        <h2 className="font-semibold text-stone-900 text-lg">Site-Wide Booking Settings</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Cleaning Fee */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Cleaning Fee ($)</label>
            <input
              type="number" min="0" step="5" value={cleaningFee}
              onChange={(e) => setCleaningFee(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-xs text-stone-400 mt-1">Default: $60. Applied to every booking.</p>
          </div>

          {/* Min Nights */}
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Minimum Nights</label>
            <input
              type="number" min="1" value={minNights}
              onChange={(e) => setMinNights(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            <p className="text-xs text-stone-400 mt-1">Default: 2 nights minimum stay.</p>
          </div>
        </div>

        {/* Deposit Settings */}
        <div className="border-t border-stone-100 pt-5 space-y-4">
          <div className="flex items-center gap-3">
            <button
              type="button" role="switch" aria-checked={depositEnabled}
              onClick={() => setDepositEnabled(!depositEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${depositEnabled ? 'bg-amber-500' : 'bg-stone-300'}`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${depositEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <div>
              <p className="text-sm font-medium text-stone-700">Security Deposit</p>
              <p className="text-xs text-stone-400">Require a security deposit on all bookings</p>
            </div>
          </div>

          {depositEnabled && (
            <div className="grid grid-cols-2 gap-4 pl-14">
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Deposit Type</label>
                <select
                  value={depositType}
                  onChange={(e) => setDepositType(e.target.value as 'percent' | 'fixed')}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="percent">Percentage of Total</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">
                  {depositType === 'percent' ? 'Deposit %' : 'Deposit Amount ($)'}
                </label>
                <input
                  type="number" min="0" step={depositType === 'percent' ? '1' : '5'} value={depositValue}
                  onChange={(e) => setDepositValue(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Tax Settings */}
        <div className="border-t border-stone-100 pt-5 space-y-4">
          <div className="flex items-center gap-3">
            <button
              type="button" role="switch" aria-checked={taxEnabled}
              onClick={() => setTaxEnabled(!taxEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${taxEnabled ? 'bg-amber-500' : 'bg-stone-300'}`}
            >
              <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${taxEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
            <div>
              <p className="text-sm font-medium text-stone-700">Tax Collection</p>
              <p className="text-xs text-stone-400">Collect sales/occupancy tax on bookings</p>
            </div>
          </div>

          {taxEnabled && (
            <div className="pl-14 max-w-xs">
              <label className="block text-sm font-medium text-stone-700 mb-1">Tax Rate (%)</label>
              <input
                type="number" min="0" step="0.5" value={taxPercent}
                onChange={(e) => setTaxPercent(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          )}
        </div>

        <div className="pt-2">
          <button
            onClick={handleSaveSettings}
            disabled={savingSettings}
            className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-medium px-6 py-2.5 rounded-lg transition-colors"
          >
            <Save size={16} />
            {savingSettings ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </div>

      {/* Per-RV Pricing Rules */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-stone-900 text-lg">Per-RV Pricing Rules</h2>
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
              rvs={rvs.map((r) => ({ id: r.id, name: r.name, emoji: r.emoji }))}
              rule={editingRule ?? undefined}
              onSave={handleSavePricingRule}
              onCancel={() => { setShowPricingForm(false); setEditingRule(null) }}
            />
          </div>
        )}

        {rvs.map((rv) => (
          <div key={rv.id} className="bg-white border border-stone-200 rounded-xl overflow-hidden">
            <div className="px-5 py-3 bg-stone-50 border-b border-stone-200">
              <h3 className="font-semibold text-stone-800">
                {rv.emoji} {rv.name}
                <span className="ml-2 text-sm font-normal text-stone-400">
                  ({rv.priceRules.length} rule{rv.priceRules.length !== 1 ? 's' : ''})
                </span>
              </h3>
            </div>
            {rv.priceRules.length === 0 ? (
              <div className="px-5 py-4 text-sm text-stone-400">No pricing rules for this RV.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-stone-100">
                    <th className="text-left px-4 py-2.5 font-medium text-stone-500">Name</th>
                    <th className="text-left px-4 py-2.5 font-medium text-stone-500">Date Range</th>
                    <th className="text-right px-4 py-2.5 font-medium text-stone-500">Nightly</th>
                    <th className="text-right px-4 py-2.5 font-medium text-stone-500">Weekend</th>
                    <th className="text-center px-4 py-2.5 font-medium text-stone-500">Min</th>
                    <th className="text-center px-4 py-2.5 font-medium text-stone-500">Active</th>
                    <th className="px-4 py-2.5" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {rv.priceRules.map((rule) => (
                    <tr key={rule.id} className="hover:bg-stone-50">
                      <td className="px-4 py-2.5 font-medium text-stone-800">{rule.name}</td>
                      <td className="px-4 py-2.5 text-stone-600 text-xs">
                        {formatDate(rule.startDate)} → {formatDate(rule.endDate)}
                      </td>
                      <td className="px-4 py-2.5 text-right text-amber-600 font-medium">
                        {formatCurrency(Number(rule.nightlyRate))}
                      </td>
                      <td className="px-4 py-2.5 text-right text-stone-500">
                        {rule.weekendRate ? formatCurrency(Number(rule.weekendRate)) : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-center text-stone-600">{rule.minNights}n</td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`inline-flex px-1.5 py-0.5 rounded text-xs font-medium ${rule.isActive ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-400'}`}>
                          {rule.isActive ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button onClick={() => { setEditingRule(rule); setShowPricingForm(true) }}
                            className="p-1.5 text-stone-400 hover:text-stone-700 rounded transition-colors">
                            <Edit size={13} />
                          </button>
                          <button onClick={() => handleDeleteRule(rule.id)}
                            className="p-1.5 text-stone-400 hover:text-red-600 rounded transition-colors">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
