'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Edit, Power, PowerOff, MapPin, BarChart2, Save, X, AlertTriangle, Check } from 'lucide-react'

interface Destination {
  id: string
  name: string
  slug: string
  description: string
  location: string | null
  campgroundFeeEstimate: string | null
  campgroundFeeNote: string | null
  emoji: string
  isActive: boolean
  sortOrder: number
  _count: { bookings: number }
}

interface AddDestForm {
  name: string
  slug: string
  description: string
  location: string
  campgroundFeeEstimate: string
  campgroundFeeNote: string
  emoji: string
  isActive: boolean
}

const EMPTY_FORM: AddDestForm = {
  name: '',
  slug: '',
  description: '',
  location: '',
  campgroundFeeEstimate: '',
  campgroundFeeNote: '',
  emoji: '🏕️',
  isActive: true,
}

export default function AdminDestinationsPage() {
  const [destinations, setDestinations] = useState<Destination[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editingDest, setEditingDest] = useState<Destination | null>(null)
  const [form, setForm] = useState<AddDestForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function fetchDestinations() {
    try {
      const res = await fetch('/api/admin/destinations')
      const data = await res.json()
      setDestinations(data.data ?? [])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchDestinations() }, [])

  function openAdd() {
    setEditingDest(null)
    setForm(EMPTY_FORM)
    setSaveMsg(null)
    setSaveError(null)
    setShowAddModal(true)
  }

  function openEdit(dest: Destination) {
    setEditingDest(dest)
    setForm({
      name: dest.name,
      slug: dest.slug,
      description: dest.description,
      location: dest.location ?? '',
      campgroundFeeEstimate: dest.campgroundFeeEstimate ?? '',
      campgroundFeeNote: dest.campgroundFeeNote ?? '',
      emoji: dest.emoji,
      isActive: dest.isActive,
    })
    setSaveMsg(null)
    setSaveError(null)
    setShowAddModal(true)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setSaveMsg(null)
    setSaveError(null)
    try {
      const url = editingDest ? `/api/admin/destinations/${editingDest.id}` : '/api/admin/destinations'
      const method = editingDest ? 'PATCH' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) {
        const d = await res.json()
        setSaveError(d.error ?? 'Save failed')
        return
      }
      setSaveMsg(editingDest ? 'Destination updated!' : 'Destination created!')
      await fetchDestinations()
      setTimeout(() => { setShowAddModal(false); setSaveMsg(null) }, 1000)
    } catch {
      setSaveError('Network error')
    } finally {
      setSaving(false)
    }
  }

  async function toggleActive(dest: Destination) {
    await fetch(`/api/admin/destinations/${dest.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !dest.isActive }),
    })
    await fetchDestinations()
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
          <h1 className="text-2xl font-bold text-stone-900">Destinations</h1>
          <p className="text-stone-500 text-sm mt-1">{destinations.length} destination{destinations.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white font-medium px-4 py-2 rounded-lg transition-colors text-sm"
        >
          <Plus size={16} />
          Add Destination
        </button>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {destinations.map((dest) => (
          <div
            key={dest.id}
            className={`bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow ${dest.isActive ? 'border-stone-200' : 'border-stone-200 opacity-70'}`}
          >
            <div className="bg-gradient-to-r from-stone-50 to-stone-100 px-5 py-4 border-b border-stone-200">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-3xl">{dest.emoji}</span>
                  <div>
                    <h3 className="font-bold text-stone-900">{dest.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-stone-500">
                      <MapPin size={10} />
                      {dest.location ?? 'No location set'}
                    </div>
                  </div>
                </div>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${dest.isActive ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                  {dest.isActive ? <Power size={10} /> : <PowerOff size={10} />}
                  {dest.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            <div className="px-5 py-4 space-y-3">
              <p className="text-sm text-stone-600 line-clamp-2">{dest.description}</p>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-stone-50 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-stone-400 mb-1">
                    <BarChart2 size={12} />
                    <span className="text-xs">Bookings</span>
                  </div>
                  <p className="text-xl font-bold text-stone-900">{dest._count.bookings}</p>
                </div>
                <div className="bg-stone-50 rounded-lg p-3 text-center">
                  <div className="text-xs text-stone-400 mb-1">Site Fee Est.</div>
                  <p className="text-sm font-semibold text-amber-600 truncate">
                    {dest.campgroundFeeEstimate ?? 'Not set'}
                  </p>
                </div>
              </div>

              {dest.campgroundFeeNote && (
                <p className="text-xs text-stone-400 italic">{dest.campgroundFeeNote}</p>
              )}
            </div>

            <div className="px-5 py-3 border-t border-stone-100 bg-stone-50 flex gap-2">
              <button
                onClick={() => openEdit(dest)}
                className="flex-1 flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-900 text-white text-sm font-medium py-2 rounded-lg transition-colors"
              >
                <Edit size={14} />
                Edit
              </button>
              <button
                onClick={() => toggleActive(dest)}
                className={`flex items-center justify-center gap-1 px-3 py-2 border text-sm rounded-lg transition-colors ${
                  dest.isActive
                    ? 'border-stone-200 text-stone-500 hover:bg-white'
                    : 'border-green-200 text-green-600 hover:bg-green-50'
                }`}
              >
                {dest.isActive ? <PowerOff size={13} /> : <Power size={13} />}
                {dest.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
              <h2 className="font-bold text-stone-900 text-lg">
                {editingDest ? `Edit: ${editingDest.name}` : 'Add New Destination'}
              </h2>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 text-stone-400 hover:text-stone-700 rounded">
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
                  <label className="block text-sm font-medium text-stone-700 mb-1">Emoji *</label>
                  <input required value={form.emoji} onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Slug *</label>
                  <input required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Location</label>
                  <input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="e.g. Folsom Lake, CA"
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-700 mb-1">Description *</label>
                <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Campground Fee Est.</label>
                  <input value={form.campgroundFeeEstimate} onChange={(e) => setForm({ ...form, campgroundFeeEstimate: e.target.value })}
                    placeholder="e.g. $35–$55/night"
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-stone-700 mb-1">Fee Note</label>
                  <input value={form.campgroundFeeNote} onChange={(e) => setForm({ ...form, campgroundFeeNote: e.target.value })}
                    placeholder="e.g. Varies by site type"
                    className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
                </div>
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
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-stone-200 text-stone-600 rounded-lg text-sm hover:bg-stone-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors">
                  <Save size={14} />
                  {saving ? 'Saving...' : editingDest ? 'Save Changes' : 'Create Destination'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
