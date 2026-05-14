import type { Metadata } from 'next'
import FAQ, { faqItems } from '@/components/marketing/FAQ'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'FAQ | SunRioVistas',
  description:
    'Frequently asked questions about SunRioVistas RV glamping near Folsom Lake. Learn about how stationary RV glamping works, pricing, campground fees, pets, and more.',
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqItems.map((item) => ({
    '@type': 'Question',
    name: item.question,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.answer,
    },
  })),
}

export default function FAQPage() {
  return (
    <>
      {/* JSON-LD FAQ Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <main className="pt-20">
        {/* Header */}
        <section className="bg-gradient-to-br from-amber-900 via-orange-800 to-amber-700 py-20 md:py-24 text-center px-4">
          <div className="max-w-3xl mx-auto">
            <span className="text-5xl block mb-4" aria-hidden="true">❓</span>
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-5">
              Frequently Asked Questions
            </h1>
            <p className="text-amber-100 text-lg leading-relaxed">
              Everything you need to know about SunRioVistas luxury RV glamping. No RV experience
              required — just your curiosity.
            </p>
          </div>
        </section>

        {/* Quick Answer Banner */}
        <div className="bg-amber-600 py-4 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-white font-semibold text-base">
              🚗 The #1 question: <span className="font-bold">No — you never drive the RV.</span>{' '}
              You drive your own car. The RV is already set up and waiting.
            </p>
          </div>
        </div>

        {/* Main FAQ Accordion */}
        <FAQ />

        {/* Additional Content */}
        <section className="section-padding bg-amber-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="font-serif text-3xl font-bold text-stone-900 text-center mb-10">
              More About How It Works
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Booking Process */}
              <div className="bg-white border border-amber-200 rounded-2xl p-6">
                <h3 className="font-serif text-xl font-bold text-stone-900 mb-4">
                  📋 The Booking Process
                </h3>
                <ol className="space-y-3">
                  {[
                    'Fill out the booking request form with your dates, RV, and destination.',
                    'Our team manually reviews your request (usually within 24 hours).',
                    'You receive a confirmation email with a secure Stripe payment link.',
                    'Complete payment to lock in your reservation.',
                    'Drive your own car to the campground — the RV is already there.',
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-stone-600 text-sm">
                      <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Fee Breakdown */}
              <div className="bg-white border border-amber-200 rounded-2xl p-6">
                <h3 className="font-serif text-xl font-bold text-stone-900 mb-4">
                  💰 Understanding Fees
                </h3>
                <div className="space-y-4">
                  <div className="border-b border-stone-100 pb-3">
                    <p className="font-semibold text-stone-800 text-sm">Nightly Rate</p>
                    <p className="text-stone-500 text-xs mt-1">
                      The main glamping cost. Varies by RV and season. Set and managed by admin.
                    </p>
                  </div>
                  <div className="border-b border-stone-100 pb-3">
                    <p className="font-semibold text-stone-800 text-sm">$60 Cleaning Fee</p>
                    <p className="text-stone-500 text-xs mt-1">
                      Mandatory for every stay. Covers professional cleaning between guests.
                    </p>
                  </div>
                  <div className="border-b border-stone-100 pb-3">
                    <p className="font-semibold text-stone-800 text-sm">Campground Fees</p>
                    <p className="text-stone-500 text-xs mt-1">
                      Paid directly to the campground — NOT included in your booking. Varies by
                      destination ($0–$90/night).
                    </p>
                  </div>
                  <div>
                    <p className="font-semibold text-stone-800 text-sm">Add-Ons (Optional)</p>
                    <p className="text-stone-500 text-xs mt-1">
                      Extra touches like charcuterie boards, special decorations, etc.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 bg-stone-900 text-center px-4">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-serif text-3xl font-bold text-white mb-4">
              Still Have Questions?
            </h2>
            <p className="text-stone-400 mb-8">
              We respond within 24 hours. Our team is here to help you plan the perfect getaway.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold px-8 py-4 rounded-full text-base shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
              >
                Contact Us
              </Link>
              <Link
                href="/book"
                className="inline-flex items-center justify-center gap-2 border-2 border-stone-600 text-stone-300 hover:border-amber-500 hover:text-amber-400 font-semibold px-8 py-4 rounded-full text-base transition-all duration-200"
              >
                Book Now
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
