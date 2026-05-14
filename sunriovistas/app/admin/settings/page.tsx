'use client'

import { useEffect, useState } from 'react'
import { Save, Check, AlertTriangle, Mail, Shield, CreditCard, FileText, Clock } from 'lucide-react'

interface Settings {
  business_name?: string
  admin_email?: string
  contact_phone?: string
  min_nights?: string
  cleaning_fee?: string
  auto_approve?: string
  deposit_enabled?: string
  deposit_type?: string
  deposit_percent?: string
  deposit_fixed?: string
  tax_enabled?: string
  tax_percent?: string
  cancellation_policy?: string
  terms_version?: string
  terms_url?: string
  pet_policy?: string
  gmail_user?: string
  [key: string]: string | undefined
}

type SectionKey = 'business' | 'booking' | 'deposit' | 'tax' | 'cancellation' | 'terms' | 'pet' | 'email' | 'stripe'

const DEFAULT_CANCELLATION_POLICY = `Full refund for cancellations made 7 or more days before check-in.
50% refund for cancellations made within 7 days of check-in.
No refund for cancellations made within 48 hours of check-in.

All cancellation requests must be submitted in writing via email to admin@sunriovistas.com.`

const DEFAULT_PET_POLICY = `Pets are not automatically permitted. Guests must request pet approval when booking.
A pet fee may apply. Only well-behaved, leashed pets are allowed on premises.
Guests are responsible for any damage caused by their pets.`

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Settings>({})
  const [loading, setLoading] = useState(true)
  const [sectionStatus, setSectionStatus] = useState<Record<SectionKey, 'idle' | 'saving' | 'saved' | 'error'>>({
    business: 'idle', booking: 'idle', deposit: 'idle', tax: 'idle',
    cancellation: 'idle', terms: 'idle', pet: 'idle', email: 'idle', stripe: 'idle',
  })

  // Section form states
  const [businessName, setBusinessName] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [contactPhone, setContactPhone] = useState('')

  const [minNights, setMinNights] = useState('2')
  const [cleaningFee, setCleaningFee] = useState('60')
  const [autoApprove, setAutoApprove] = useState(false)

  const [depositEnabled, setDepositEnabled] = useState(false)
  const [depositType, setDepositType] = useState<'percent' | 'fixed'>('percent')
  const [depositValue, setDepositValue] = useState('20')

  const [taxEnabled, setTaxEnabled] = useState(false)
  const [taxPercent, setTaxPercent] = useState('0')

  const [cancellationPolicy, setCancellationPolicy] = useState(DEFAULT_CANCELLATION_POLICY)
  const [termsVersion, setTermsVersion] = useState('1.0')
  const [termsUrl, setTermsUrl] = useState('')
  const [petPolicy, setPetPolicy] = useState(DEFAULT_PET_POLICY)

  async function fetchSettings() {
    try {
      const res = await fetch('/api/admin/settings')
      const data = await res.json()
      const s: Settings = data.data ?? {}
      setSettings(s)
      setBusinessName(s.business_name ?? 'SunRioVistas')
      setAdminEmail(s.admin_email ?? '')
      setContactPhone(s.contact_phone ?? '')
      setMinNights(s.min_nights ?? '2')
      setCleaningFee(s.cleaning_fee ?? '60')
      setAutoApprove(s.auto_approve === 'true')
      setDepositEnabled(s.deposit_enabled === 'true')
      setDepositType((s.deposit_type as 'percent' | 'fixed') ?? 'percent')
      setDepositValue(s.deposit_percent ?? s.deposit_fixed ?? '20')
      setTaxEnabled(s.tax_enabled === 'true')
      setTaxPercent(s.tax_percent ?? '0')
      setCancellationPolicy(s.cancellation_policy ?? DEFAULT_CANCELLATION_POLICY)
      setTermsVersion(s.terms_version ?? '1.0')
      setTermsUrl(s.terms_url ?? '')
      setPetPolicy(s.pet_policy ?? DEFAULT_PET_POLICY)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSettings() }, [])

  async function saveSection(key: SectionKey, payload: Record<string, string>) {
    setSectionStatus((prev) => ({ ...prev, [key]: 'saving' }))
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        setSectionStatus((prev) => ({ ...prev, [key]: 'error' }))
        return
      }
      setSectionStatus((prev) => ({ ...prev, [key]: 'saved' }))
      setTimeout(() => setSectionStatus((prev) => ({ ...prev, [key]: 'idle' })), 3000)
    } catch {
      setSectionStatus((prev) => ({ ...prev, [key]: 'error' }))
    }
  }

  function SectionFooter({ sectionKey }: { sectionKey: SectionKey }) {
    const status = sectionStatus[sectionKey]
    return (
      <div className="pt-4 border-t border-stone-100 flex items-center gap-3">
        <button
          onClick={() => {
            const payloads: Record<SectionKey, Record<string, string>> = {
              business: { business_name: businessName, admin_email: adminEmail, contact_phone: contactPhone },
              booking: { min_nights: minNights, cleaning_fee: cleaningFee, auto_approve: String(autoApprove) },
              deposit: { deposit_enabled: String(depositEnabled), deposit_type: depositType, deposit_percent: depositType === 'percent' ? depositValue : '', deposit_fixed: depositType === 'fixed' ? depositValue : '' },
              tax: { tax_enabled: String(taxEnabled), tax_percent: taxPercent },
              cancellation: { cancellation_policy: cancellationPolicy },
              terms: { terms_version: termsVersion, terms_url: termsUrl },
              pet: { pet_policy: petPolicy },
              email: {},
              stripe: {},
            }
            saveSection(sectionKey, payloads[sectionKey])
          }}
          disabled={status === 'saving'}
          className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white font-medium px-5 py-2 rounded-lg text-sm transition-colors"
        >
          <Save size={14} />
          {status === 'saving' ? 'Saving...' : 'Save'}
        </button>
        {status === 'saved' && (
          <span className="flex items-center gap-1.5 text-green-600 text-sm">
            <Check size={14} /> Saved!
          </span>
        )}
        {status === 'error' && (
          <span className="flex items-center gap-1.5 text-red-600 text-sm">
            <AlertTriangle size={14} /> Failed to save
          </span>
        )}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Settings</h1>
        <p className="text-stone-500 text-sm mt-1">Configure platform-wide settings and policies</p>
      </div>

      {/* 1. Business Settings */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-stone-900 flex items-center gap-2">
          <Shield size={16} className="text-stone-400" />
          Business Settings
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Business Name</label>
            <input value={businessName} onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Admin Email</label>
            <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)}
              placeholder="admin@sunriovistas.com"
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Contact Phone</label>
            <input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)}
              placeholder="+1 (916) 555-0100"
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
        </div>
        <SectionFooter sectionKey="business" />
      </div>

      {/* 2. Booking Rules */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-stone-900 flex items-center gap-2">
          <Clock size={16} className="text-stone-400" />
          Booking Rules
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Minimum Nights</label>
            <input type="number" min="1" value={minNights} onChange={(e) => setMinNights(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            <p className="text-xs text-stone-400 mt-1">Default: 2 nights</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Cleaning Fee ($)</label>
            <input type="number" min="0" step="5" value={cleaningFee} onChange={(e) => setCleaningFee(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            <p className="text-xs text-stone-400 mt-1">Default: $60</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="button" role="switch" aria-checked={autoApprove}
            onClick={() => setAutoApprove(!autoApprove)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${autoApprove ? 'bg-amber-500' : 'bg-stone-300'}`}>
            <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${autoApprove ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <div>
            <p className="text-sm font-medium text-stone-700">Auto-Approve Bookings</p>
            <p className="text-xs text-stone-400">Skip manual review — not recommended</p>
          </div>
        </div>
        <SectionFooter sectionKey="booking" />
      </div>

      {/* 3. Deposit Settings */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-stone-900">Deposit Settings</h2>
        <div className="flex items-center gap-3">
          <button type="button" role="switch" aria-checked={depositEnabled}
            onClick={() => setDepositEnabled(!depositEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${depositEnabled ? 'bg-amber-500' : 'bg-stone-300'}`}>
            <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${depositEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <div>
            <p className="text-sm font-medium text-stone-700">Require Security Deposit</p>
            <p className="text-xs text-stone-400">Collect a deposit on all bookings</p>
          </div>
        </div>
        {depositEnabled && (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Deposit Type</label>
              <select value={depositType} onChange={(e) => setDepositType(e.target.value as 'percent' | 'fixed')}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
                <option value="percent">Percentage</option>
                <option value="fixed">Fixed Amount ($)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">
                {depositType === 'percent' ? 'Percentage (%)' : 'Amount ($)'}
              </label>
              <input type="number" min="0" step={depositType === 'percent' ? '1' : '5'} value={depositValue}
                onChange={(e) => setDepositValue(e.target.value)}
                className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            </div>
          </div>
        )}
        <SectionFooter sectionKey="deposit" />
      </div>

      {/* 4. Tax Settings */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-stone-900">Tax Settings</h2>
        <div className="flex items-center gap-3">
          <button type="button" role="switch" aria-checked={taxEnabled}
            onClick={() => setTaxEnabled(!taxEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${taxEnabled ? 'bg-amber-500' : 'bg-stone-300'}`}>
            <span className={`inline-block h-4 w-4 rounded-full bg-white transition-transform ${taxEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
          </button>
          <div>
            <p className="text-sm font-medium text-stone-700">Collect Tax</p>
            <p className="text-xs text-stone-400">Apply occupancy/sales tax to bookings</p>
          </div>
        </div>
        {taxEnabled && (
          <div className="max-w-xs">
            <label className="block text-sm font-medium text-stone-700 mb-1">Tax Rate (%)</label>
            <input type="number" min="0" step="0.5" value={taxPercent} onChange={(e) => setTaxPercent(e.target.value)}
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
        )}
        <SectionFooter sectionKey="tax" />
      </div>

      {/* 5. Cancellation Policy */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-stone-900">Cancellation Policy</h2>
        <p className="text-xs text-stone-400">
          This text is displayed to customers during booking and in confirmation emails.
        </p>
        <textarea
          rows={6}
          value={cancellationPolicy}
          onChange={(e) => setCancellationPolicy(e.target.value)}
          className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none font-mono"
        />
        <SectionFooter sectionKey="cancellation" />
      </div>

      {/* 6. Terms Document */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-stone-900 flex items-center gap-2">
          <FileText size={16} className="text-stone-400" />
          Terms & Conditions Document
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Current Version</label>
            <input value={termsVersion} onChange={(e) => setTermsVersion(e.target.value)}
              placeholder="e.g. 1.0, 2.1"
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Document URL</label>
            <input type="url" value={termsUrl} onChange={(e) => setTermsUrl(e.target.value)}
              placeholder="[ADD_TERMS_AND_CONDITIONS_DOC_LINK_HERE]"
              className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
        </div>
        <p className="text-xs text-amber-700 bg-amber-50 px-3 py-2 rounded-lg">
          Updating the version number will require new customers to re-accept terms. Make sure the document URL is publicly accessible.
        </p>
        <SectionFooter sectionKey="terms" />
      </div>

      {/* 7. Pet Policy */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-stone-900">Pet Policy</h2>
        <textarea
          rows={4}
          value={petPolicy}
          onChange={(e) => setPetPolicy(e.target.value)}
          className="w-full px-3 py-2 border border-stone-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none"
        />
        <SectionFooter sectionKey="pet" />
      </div>

      {/* 8. Email Settings */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-stone-900 flex items-center gap-2">
          <Mail size={16} className="text-stone-400" />
          Email Settings
        </h2>
        <div className="bg-stone-50 rounded-lg p-4 text-sm text-stone-600 space-y-1">
          <p><strong>Gmail User:</strong> {settings.gmail_user ?? process.env.NEXT_PUBLIC_GMAIL_USER ?? 'Configured via .env (GMAIL_USER)'}</p>
          <p className="text-xs text-stone-400">
            Email credentials are configured via environment variables (GMAIL_USER, GMAIL_APP_PASSWORD).
            Update them in your hosting environment to change email settings.
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
          To test email delivery, trigger a test booking through the platform and monitor your inbox.
        </div>
      </div>

      {/* 9. Stripe Settings */}
      <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-stone-900 flex items-center gap-2">
          <CreditCard size={16} className="text-stone-400" />
          Stripe Settings
        </h2>
        <div className="bg-stone-50 rounded-lg p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-600">Secret Key</span>
            <span className="font-mono text-stone-500">
              sk_●●●●●●●●●●●●●●●●●●●●
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-600">Webhook Secret</span>
            <span className="font-mono text-stone-500">
              whsec_●●●●●●●●●●●●●●●●●●●●
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-stone-600">Webhook Status</span>
            <span className="flex items-center gap-1.5 text-green-600 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              Configured
            </span>
          </div>
        </div>
        <p className="text-xs text-stone-400">
          Stripe keys are managed via environment variables (STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET).
          Update them in your hosting environment or .env file.
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800">
          <strong>Webhook URL:</strong>{' '}
          <code className="font-mono">{typeof window !== 'undefined' ? window.location.origin : 'https://yourdomain.com'}/api/webhooks/stripe</code>
          <br />
          Configure this URL in your Stripe Dashboard → Webhooks.
        </div>
      </div>
    </div>
  )
}
