import type { Metadata } from 'next'
import Link from 'next/link'
import prisma from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Terms & Conditions | SunRioVistas',
  description:
    'Terms and conditions for SunRioVistas luxury RV glamping. Read our policies on cancellations, pets, campground fees, and more.',
}

async function getLatestTerms() {
  try {
    return await prisma.termsDocument.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
    })
  } catch {
    return null
  }
}

export default async function TermsPage() {
  const terms = await getLatestTerms()
  const lastUpdated = terms?.createdAt
    ? new Date(terms.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'May 2025'

  return (
    <main className="pt-20">
      {/* Header */}
      <section className="bg-gradient-to-br from-stone-800 to-stone-900 py-16 md:py-20 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <span className="text-4xl block mb-4" aria-hidden="true">📄</span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-4">
            Terms &amp; Conditions
          </h1>
          <p className="text-stone-400 text-base">Last updated: {lastUpdated}</p>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Terms Document Link */}
          {terms?.url ? (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-10 flex items-center gap-4">
              <span className="text-3xl flex-shrink-0" aria-hidden="true">📋</span>
              <div className="flex-1">
                <p className="font-semibold text-stone-900 mb-1">Current Terms Document</p>
                <p className="text-stone-500 text-sm mb-2">Version: {terms.version}</p>
                <a
                  href={terms.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-amber-700 font-semibold text-sm underline hover:no-underline"
                >
                  View Full Terms Document →
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-10">
              <p className="text-stone-500 text-sm italic text-center">
                [Terms document will appear here once uploaded in admin settings. The full terms
                document can be linked or displayed inline.]
              </p>
            </div>
          )}

          {/* Terms Sections */}
          <div className="prose prose-stone max-w-none space-y-10">
            {/* Overview */}
            <section aria-labelledby="terms-overview">
              <h2 id="terms-overview" className="font-serif text-2xl font-bold text-stone-900 mb-4">
                Overview
              </h2>
              <p className="text-stone-600 leading-relaxed">
                SunRioVistas provides stationary luxury RV glamping experiences in Northern
                California. By booking with us, you agree to the following terms and conditions. All
                bookings are subject to manual approval and availability.
              </p>
            </section>

            {/* Booking & Payment */}
            <section aria-labelledby="terms-booking">
              <h2 id="terms-booking" className="font-serif text-2xl font-bold text-stone-900 mb-4">
                Booking &amp; Payment
              </h2>
              <ul className="space-y-3 text-stone-600">
                {[
                  'All bookings require manual admin approval before payment is collected.',
                  'A Stripe payment link will be sent via email upon booking approval.',
                  'A minimum 2-night stay is required for all bookings.',
                  'A mandatory $60 cleaning fee applies to every booking.',
                  'Campground fees are paid directly to the campground/host and are NOT included in your booking total.',
                  'Pricing is set by admin and may vary by date, season, and RV.',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-amber-500 flex-shrink-0 font-bold mt-0.5" aria-hidden="true">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* Cancellation Policy */}
            <section aria-labelledby="terms-cancellation">
              <h2 id="terms-cancellation" className="font-serif text-2xl font-bold text-stone-900 mb-4">
                Cancellation Policy
              </h2>
              <div className="bg-red-50 border border-red-100 rounded-xl p-6">
                <p className="text-stone-500 text-sm italic mb-4">
                  [Cancellation policy to be defined and added by admin. Example structure below.]
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { timeframe: '14+ days before', policy: 'Full refund minus cleaning fee', color: 'text-green-700' },
                    { timeframe: '7–14 days before', policy: '50% refund', color: 'text-amber-700' },
                    { timeframe: 'Under 7 days', policy: 'No refund', color: 'text-red-700' },
                  ].map((row) => (
                    <div key={row.timeframe} className="bg-white rounded-lg p-4 border border-stone-100 text-center">
                      <p className="font-semibold text-stone-800 text-sm mb-1">{row.timeframe}</p>
                      <p className={`text-sm font-medium ${row.color}`}>{row.policy}</p>
                    </div>
                  ))}
                </div>
                <p className="text-stone-400 text-xs mt-4 italic">
                  * Exact policy is subject to admin configuration and may differ. See your booking
                  confirmation for the specific cancellation terms that apply to your reservation.
                </p>
              </div>
            </section>

            {/* Pet Policy */}
            <section aria-labelledby="terms-pets">
              <h2 id="terms-pets" className="font-serif text-2xl font-bold text-stone-900 mb-4">
                Pet Policy
              </h2>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
                <ul className="space-y-3 text-stone-600">
                  {[
                    'Pets are considered on a case-by-case basis and must be disclosed at the time of booking.',
                    'Pet approval is at the sole discretion of SunRioVistas admin.',
                    'A pet fee may apply, to be communicated during the approval process.',
                    'Guests are responsible for any pet-related damage to the RV or campground.',
                    'Some campground destinations have their own pet policies, which must also be respected.',
                    'Undisclosed pets may result in booking cancellation and forfeiture of payment.',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="text-amber-500 flex-shrink-0 font-bold mt-0.5" aria-hidden="true">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Guest Conduct */}
            <section aria-labelledby="terms-conduct">
              <h2 id="terms-conduct" className="font-serif text-2xl font-bold text-stone-900 mb-4">
                Guest Conduct &amp; Responsibility
              </h2>
              <ul className="space-y-3 text-stone-600">
                {[
                  'Guests are responsible for the RV and its contents during the stay.',
                  'Guests must follow all campground/destination rules and regulations.',
                  'Damage to the RV, fixtures, or amenities is the financial responsibility of the guest.',
                  'The RV is stationary — guests must NOT attempt to move the RV under any circumstances.',
                  'SunRioVistas reserves the right to terminate a booking for conduct violations without refund.',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="text-amber-500 flex-shrink-0 font-bold mt-0.5" aria-hidden="true">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            {/* Contact */}
            <section className="bg-stone-50 border border-stone-200 rounded-2xl p-6 text-center">
              <p className="text-stone-600 text-sm mb-4">
                Questions about our terms? We&apos;re happy to clarify anything.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-6 py-3 rounded-full text-sm shadow hover:shadow-md transition-all duration-200"
              >
                Contact Us
              </Link>
            </section>
          </div>
        </div>
      </section>
    </main>
  )
}
