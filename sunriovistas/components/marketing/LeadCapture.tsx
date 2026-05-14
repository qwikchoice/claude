'use client'

import { useState } from 'react'

const destinations = [
  { value: '', label: 'Any destination' },
  { value: 'beals-point-folsom-lake', label: '🌊 Beals Point / Folsom Lake' },
  { value: 'placerville-rv-resort', label: '🏔️ Placerville RV Resort' },
  { value: 'red-hawk-casino', label: '🎰 Red Hawk Casino' },
  { value: 'harvest-hosts-wineries', label: '🍷 Harvest Hosts / Wineries' },
  { value: 'auburn-gold-country', label: '⛏️ Auburn / Gold Country' },
]

const groupSizes = [
  { value: '', label: 'Select group size' },
  { value: '1-2', label: '1–2 people' },
  { value: '3-4', label: '3–4 people' },
  { value: '5-6', label: '5–6 people' },
]

type FormState = {
  name: string
  email: string
  phone: string
  destination: string
  approximateDates: string
  groupSize: string
  message: string
}

const initialForm: FormState = {
  name: '',
  email: '',
  phone: '',
  destination: '',
  approximateDates: '',
  groupSize: '',
  message: '',
}

export default function LeadCapture() {
  const [form, setForm] = useState<FormState>(initialForm)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  // Waitlist state
  const [waitlistEmail, setWaitlistEmail] = useState('')
  const [waitlistSubmitting, setWaitlistSubmitting] = useState(false)
  const [waitlistSubmitted, setWaitlistSubmitted] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email) {
      setError('Please fill in your name and email.')
      return
    }
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          destination: form.destination || undefined,
          preferredDates: form.approximateDates || undefined,
          groupSize: form.groupSize || undefined,
          message: form.message || undefined,
          source: 'lead-capture-form',
        }),
      })
      if (!res.ok) throw new Error('Failed to submit')
      setSubmitted(true)
      setForm(initialForm)
    } catch {
      setError('Something went wrong. Please try again or email us directly.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!waitlistEmail) return
    setWaitlistSubmitting(true)
    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Waitlist',
          email: waitlistEmail,
          source: 'waitlist',
        }),
      })
      setWaitlistSubmitted(true)
      setWaitlistEmail('')
    } catch {
      // silent fail for waitlist
      setWaitlistSubmitted(true)
    } finally {
      setWaitlistSubmitting(false)
    }
  }

  return (
    <section className="section-padding bg-amber-50" aria-labelledby="lead-capture-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
          {/* Left: Heading + Waitlist */}
          <div className="lg:col-span-2">
            <h2 id="lead-capture-title" className="section-title mb-4">
              Not Ready to Book? Ask Us Anything.
            </h2>
            <p className="section-subtitle mb-8">
              We respond within 24 hours. No pressure, just friendly answers.
            </p>

            <ul className="space-y-3 mb-10">
              {[
                'No RV experience needed',
                'We manually approve every booking',
                'Campground fees paid directly to campground',
                'Min 2-night stay · $60 cleaning fee',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2 text-stone-600 text-sm">
                  <span className="text-amber-500 mt-0.5 flex-shrink-0" aria-hidden="true">✓</span>
                  {item}
                </li>
              ))}
            </ul>

            {/* Waitlist Block */}
            <div className="bg-white border border-amber-200 rounded-2xl p-6">
              <h3 className="font-serif text-lg font-bold text-stone-900 mb-1">
                Join Our Waitlist
              </h3>
              <p className="text-stone-500 text-sm mb-4">
                Get notified when new dates open up.
              </p>
              {waitlistSubmitted ? (
                <div className="bg-green-50 border border-green-200 text-green-700 text-sm font-medium px-4 py-3 rounded-lg">
                  You&apos;re on the list! We&apos;ll be in touch soon.
                </div>
              ) : (
                <form onSubmit={handleWaitlist} className="flex gap-2">
                  <input
                    type="email"
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    placeholder="your@email.com"
                    required
                    className="input-field flex-1 py-2.5 text-sm"
                    aria-label="Waitlist email address"
                  />
                  <button
                    type="submit"
                    disabled={waitlistSubmitting}
                    className="btn-primary px-4 py-2.5 rounded-lg text-sm font-semibold whitespace-nowrap disabled:opacity-60"
                  >
                    {waitlistSubmitting ? '...' : 'Join'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Right: Main Form */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-amber-100 rounded-2xl shadow-sm p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4" aria-hidden="true">🎉</div>
                  <h3 className="font-serif text-2xl font-bold text-stone-900 mb-3">
                    Thanks! We&apos;ll be in touch within 24 hours.
                  </h3>
                  <p className="text-stone-500 mb-6">
                    We&apos;ve received your message and will get back to you soon.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-amber-600 hover:text-amber-700 font-medium text-sm underline"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <h3 className="font-serif text-xl font-bold text-stone-900 mb-6">
                    Send Your Question
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
                    {/* Name */}
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-stone-700 mb-1.5">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="Your name"
                        className="input-field w-full"
                      />
                    </div>

                    {/* Email */}
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-stone-700 mb-1.5">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        required
                        placeholder="your@email.com"
                        className="input-field w-full"
                      />
                    </div>

                    {/* Phone */}
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-stone-700 mb-1.5">
                        Phone <span className="text-stone-400 font-normal">(optional)</span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        placeholder="(555) 555-5555"
                        className="input-field w-full"
                      />
                    </div>

                    {/* Preferred Destination */}
                    <div>
                      <label htmlFor="destination" className="block text-sm font-medium text-stone-700 mb-1.5">
                        Preferred Destination
                      </label>
                      <select
                        id="destination"
                        name="destination"
                        value={form.destination}
                        onChange={handleChange}
                        className="input-field w-full"
                      >
                        {destinations.map((d) => (
                          <option key={d.value} value={d.value}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Approximate Dates */}
                    <div>
                      <label htmlFor="approximateDates" className="block text-sm font-medium text-stone-700 mb-1.5">
                        Approximate Dates
                      </label>
                      <input
                        type="text"
                        id="approximateDates"
                        name="approximateDates"
                        value={form.approximateDates}
                        onChange={handleChange}
                        placeholder="e.g. Late July weekend"
                        className="input-field w-full"
                      />
                    </div>

                    {/* Group Size */}
                    <div>
                      <label htmlFor="groupSize" className="block text-sm font-medium text-stone-700 mb-1.5">
                        Group Size
                      </label>
                      <select
                        id="groupSize"
                        name="groupSize"
                        value={form.groupSize}
                        onChange={handleChange}
                        className="input-field w-full"
                      >
                        {groupSizes.map((g) => (
                          <option key={g.value} value={g.value}>
                            {g.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Message */}
                  <div className="mb-6">
                    <label htmlFor="message" className="block text-sm font-medium text-stone-700 mb-1.5">
                      Message / Questions
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={form.message}
                      onChange={handleChange}
                      rows={4}
                      placeholder="Tell us about your trip, ask a question, or mention anything special..."
                      className="input-field w-full resize-none"
                    />
                  </div>

                  {/* Error */}
                  {error && (
                    <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full py-4 rounded-xl font-semibold text-base shadow hover:shadow-md hover:scale-[1.01] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                  >
                    {submitting ? 'Sending...' : 'Send My Question'}
                  </button>

                  <p className="text-center text-stone-400 text-xs mt-4">
                    We respond within 24 hours. No spam, ever.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
