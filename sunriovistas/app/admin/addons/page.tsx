'use client'

import { useEffect, useState } from 'react'
import { Plus, Edit, Trash2, Check, AlertTriangle, Save, X } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import PricingRuleForm from '@/components/admin/PricingRuleForm'

interface AddOnPriceRule {
  id: string
  addOnId: string
  startDate: string
  endDate: string
  price: number
  isActive: boolean
}

interface AddOn {
  id: string
  name: string
  slug: string
  description: string
  longDescription: string | null
  basePrice: number
  isActive: boolean
  sortOrder: number
  priceRules: AddOnPriceRule[]
}

interface AddOnForm {
  name: string
  slug: string
  description: string
  longDescription: string
  basePrice: string
  isActive: boolean
  sortOrder: string
}

const EMPTY_FORM: AddOnForm = {
  name: '',
  slug: '',
  description: '',
  longDescription: '',
  basePrice: '',
  isActive: true,
  sortOrder: '0',
}

export default function AdminAddOnsPage() {
  const [addOns, setAddOns] = useState<AddOn[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAddon, setEditingAddon] = useState<AddOn | null>(null)
  const [form, setForm] = useState<AddOnForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [showPriceRuleFor, setShowPriceRuleFor] = useState<string | null>(null)

  async function fetchAddOns() {
    try {
      const res = await fetch('/api/admin/addons')
      const data = await res.json()
      setAddOns(data.data ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAddOns() }, [])

  function openAdd() {
    setEditingAddon(null)
    setForm(EMPTY_FORM)
    setSaveMsg(null)
    setSaveError(null)
    setShowModal(true)
  }

  function openEdit(addon: AddOn) {
    setEditingAddon(addon)
    setForm({
      name: addon.name,
      slug: addon.slug,
      description: addon.description,
      longDescription: addon.longDescription ?? '',
      basePrice: String(addon.basePrice),
      isActive: addon.isActive,
      sortOrder: String(addon.sortOrder),
    })
    setSaveMsg(null)
    setSaveError(null)
    setShowModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaveMsg(null)
    setSaveError(null)
    try {
      const url = editingAddon ? `/api/admin/addons/${editingAddon.id}` : '/api/admin/addons'
      const method = editingAddon ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          basePrice: parseFloat(form.basePrice),
          sortOrder: parseInt(form.sortOrder),
        }),
      })
      if (!res.ok) {
        const d = await res.json()
        setSaveError(d.error ?? 'Save failed')
        return
      }
      setSaveMsg(editingAddon ? 'Add-on updated!' : 'Add-on created!')
      await fetchAddOns()
      setTimeout(() => { setShowModal(false); setSaveMsg(null) }, 1000)
    } catch {
      setSaveError('Network error')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this add-on?')) return
    await fetch(`/api/admin/addons/${id}`, { method: 'DELETE' })
    await fetchAddOns()
  }

  async function handleDeletePriceRule(id: string) {
    if (!confirm('Delete this price rule?')) return
    await fetch(`/api/admin/pricing/rules/${id}`, { method: 'DELETE' })
    await fetchAddOns()
  }

  async function handleSaveAddOnRule(addOnId: string, data: Record<string, unknown>) {
    const res = await fetch('/api/admin/pricing/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, addOnId, type: 'addon' }),
    })
    if (res.ok) {
      setShowPriceRuleFor(null)
      await fetchAddOns()
    }
  }

  async function toggleActive(addon: AddOn) {
    await fetch(`/api/admin/addons/${addon.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !addon.isActive }),
    })
    await fetchAddOns()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Add-Ons</h1>
          <p className="text-stone-500 text-sm mt-1">Manage optional extras customers can add to their bookings</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
        >
          <Plus size={16} />
          Add New Add-On
        </button>
      </div>

      {/* Add-ons Table */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-stone-50 border-b border-stone-200">
              <th className="text-left px-4 py-3 font-medium text-stone-500">Name</th>
              <th className="text-left px-4 py-3 font-medium text-stone-500">Description</th>
              <th className="text-right px-4 py-3 font-medium text-stone-500">Base Price</th>
              <th className="text-center px-4 py-3 font-medium text-stone-500">Sort Order</th>
              <th className="text-center px-4 py-3 font-medium text-stone-500">Status</th>
              <th className="text-center px-4 py-3 font-medium text-stone-500">Price Rules</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {addOns.map((addon) => (
              <>
                <tr key={addon.id} className="hover:bg-stone-50">
                  <td className="px-4 py-3 font-medium text-stone-800">{addon.name}</td>
                  <td className="px-4 py-3 text-stone-600 max-w-xs truncate">{addon.description}</td>
                  <td className="px-4 py-3 text-right font-medium text-amber-600">
                    {formatCurrency(Number(addon.basePrice))}
                  </td>
                  <td className="px-4 py-3 text-center text-stone-500">{addon.sortOrder}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleActive(addon)}>
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer ${addon.isActive ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-400'}`}>
                        {addon.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setShowPriceRuleFor(showPriceRuleFor === addon.id ? null : addon.id)}
                      className="text-amber-600 hover:text-amber-700 text-xs font-medium"
                    >
                      {addon.priceRules.length} rule{addon.priceRules.length !== 1 ? 's' : ''} →
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button onClick={() => openEdit(addon)}
                        className="p-1.5 text-stone-400 hover:text-stone-700 rounded transition-colors">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDelete(addon.id)}
                        className="p-1.5 text-stone-400 hover:text-red-600 rounded transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>

                {/* Inline price rules for this addon */}
                {showPriceRuleFor === addon.id && (
                  <tr key={`${addon.id}-rules`}>
                    <td colSpan={7} className="px-4 py-4 bg-amber-50 border-b border-amber-200">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-semibold text-stone-800">Date-Range Price Rules for {addon.name}</p>
                          <button
                            onClick={() => setShowPriceRuleFor(null)}
                            className="text-stone-400 hover:text-stone-600"
                          >
                            <X size={16} />
                          </button>
                        </div>

                        {addon.priceRules.length > 0 ? (
                          <table className="w-full text-xs bg-white rounded-lg overflow-hidden border border-amber-200">
                            <thead>
                              <tr className="bg-amber-100 text-amber-900">
                                <th className="text-left px-3 py-2 font-medium">Date Range</th>
                                <th className="text-right px-3 py-2 font-medium">Price</th>
                                <th className="text-center px-3 py-2 font-medium">Active</th>
                                <th className="px-3 py-2" />
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-amber-100">
                              {addon.priceRules.map((rule) => (
                                <tr key={rule.id}>
                                  <td className="px-3 py-2 text-stone-700">
                                    {formatDate(rule.startDate)} → {formatDate(rule.endDate)}
                                  </td>
                                  <td className="px-3 py-2 text-right font-medium text-amber-700">
                                    {formatCurrency(Number(rule.price))}
                                  </td>
                                  <td className="px-3 py-2 text-center">
                                    <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${rule.isActive ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-400'}`}>
                                      {rule.isActive ? 'Yes' : 'No'}
                                    </span>
                                  </td>
                                  <td className="px-3 py-2 text-right">
                                    <button onClick={() => handleDeletePriceRule(rule.id)}
                                      className="text-stone-400 hover:text-red-600 transition-colors">
                                      <Trash2 size={12} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <p className="text-sm text-stone-500">No date-range rules. Base price always applies.</p>
                        )}

                        <PricingRuleForm
                          addOnId={addon.id}
                          isAddOn
                          onSave={(data) => handleSaveAddOnRule(addon.id, data)}
                          onCancel={() => setShowPriceRuleFor(null)}
                        />
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
            {addOns.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-stone-400">
                  No add-ons configured yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
              <h2 className="font-bold text-stone-900 text-lg">
                {editingAddon ? `Edit: ${editingAddon.name}` : 'New Add-On'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-stone-400 hover:text-stone-700 rounded">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {saveMsg && (
                <div className="bg-green-50 border border-green-200 text-green-800 px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
                  <Check size={15} /> {saveMsg}
                </div>
              )}
              {saveError && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded-lg flex items-center gap-2 text-sm">
                  <AlertTriangle size={15} /> {saveError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Name *</label>
                  <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Slug *</label>
                  <input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Base Price ($) *</label>
                  <input required type="number" min="0" step="0.01" value={form.basePrice}
                    onChange={(e) => setForm({ ...form, basePrice: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Sort Order</label>
                  <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Short Description *</label>
                <textarea required rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Long Description (optional)</label>
                <textarea rows={3} value={form.longDescription} onChange={(e) => setForm({ ...form, longDescription: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
              </div>

              <div className="flex items-center gap-3">
                <button type="button" role="switch" aria-checked={form.isActive}
                  onClick={() => setForm({ ...form, isActive: !form.isActive })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.isActive ? 'bg-green-500' : 'bg-stone-300'}`}>
                  <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${form.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
                <label className="text-sm text-stone-700">Active</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-stone-200 text-stone-600 rounded-lg text-sm hover:bg-stone-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors">
                  <Save size={14} />
                  {saving ? 'Saving...' : editingAddon ? 'Save Changes' : 'Create Add-On'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
