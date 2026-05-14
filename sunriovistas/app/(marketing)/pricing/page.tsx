import type { Metadata } from 'next'
import Link from 'next/link'
import PricingAnchor from '@/components/marketing/PricingAnchor'
import prisma from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Pricing | SunRioVistas',
  description:
    'Transparent pricing for SunRioVistas luxury RV glamping. See nightly rates, cleaning fee, campground fee estimates, and available add-ons.',
}

const destinationFees = [
  {
    emoji: '🌊',
    name: 'Beals Point / Folsom Lake',
    fee: '~$30–$60/night',
    notes: 'Varies by site type. Hookup sites cost more.',
    hookups: true,
  },
  {
    emoji: '🏔️',
    name: 'Placerville RV Resort',
    fee: '~$90/night',
    notes: 'Full hookups included in fee.',
    hookups: true,
  },
  {
    emoji: '🎰',
    name: 'Red Hawk Casino',
    fee: 'Free',
    notes: 'Free dry camping. No hookups.',
    hookups: false,
  },
  {
    emoji: '🍷',
    name: 'Harvest Hosts / Wineries',
    fee: '$0–$30/night',
    notes: 'Most locations free with Harvest Hosts membership. Some charge small hospitality fee.',
    hookups: false,
  },
  {
    emoji: '⛏️',
    name: 'Auburn / Gold Country',
    fee: 'Varies',
    notes: 'Depends on specific campground selected. Quote provided at booking.',
    hookups: false,
  },
]

const staticAddOns = [
  { name: 'Late Checkout (11am → 1pm)', price: '$40', description: 'Sleep in a little longer.' },
  { name: 'Early Arrival Setup', price: '$35', description: 'RV ready before standard check-in.' },
  {
    name: 'Welcome Charcuterie Board',
    price: '$55',
    description: 'Artisan cheese and charcuterie waiting for your arrival.',
  },
  {
    name: 'Birthday / Anniversary Décor',
    price: '$45',
    description: 'Balloons, banners, and a celebratory setup.',
  },
  {
    name: "S'mores Kit",
    price: '$20',
    description: 'Everything you need for the perfect campfire dessert.',
  },
  {
    name: 'Breakfast Basket',
    price: '$30',
    description: 'Pastries, coffee, and fresh fruit for your first morning.',
  },
]

async function getAddOns() {
  try {
    const addons = await prisma.addOn.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
    return addons.length > 0 ? addons : null
  } catch {
    return null
  }
}

export default async function PricingPage() {
  const dbAddOns = await getAddOns()

  return (
    <main className="pt-20">
      {/* Header */}
      <section className="bg-gradient-to-br from-amber-900 via-orange-800 to-amber-700 py-20 md:py-24 text-center px-4">
        <div className="max-w-4xl mx-auto">
          <span className="text-5xl block mb-4" aria-hidden="true">💰</span>
          <h1 className="font-serif text-4xl sm:text-5xl font-bold text-white mb-5">
            Transparent Pricing
          </h1>
          <p className="text-amber-100 text-lg leading-relaxed max-w-2xl mx-auto">
            No hidden fees. No RV insurance. No mileage. Just honest glamping pricing — and a
            breakdown of what you&apos;ll actually pay.
          </p>
        </div>
      </section>

      {/* Pricing Anchor Component (Value Stack) */}
      <PricingAnchor />

      {/* How Pricing Works */}
      <section className="section-padding bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-4">How Pricing Works</h2>
          <p className="section-subtitle text-center max-w-2xl mx-auto mb-12">
            We believe in simple, honest pricing with no surprises.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {[
              {
                icon: '🌙',
                title: 'Nightly Rate',
                desc: 'Set by our admin based on RV, season, and demand. Rates vary. Request a booking to see current pricing for your preferred dates.',
                badge: 'Variable',
                badgeColor: 'bg-blue-100 text-blue-700',
              },
              {
                icon: '🧹',
                title: '$60 Cleaning Fee',
                desc: 'A flat $60 cleaning fee applies to every booking, regardless of stay length. This covers professional cleaning between guests.',
                badge: '$60 flat',
                badgeColor: 'bg-amber-100 text-amber-700',
              },
              {
                icon: '🏕️',
                title: 'Campground Fee',
                desc: 'Paid directly to the campground on arrival. Varies by destination ($0–$90/night). Not collected by SunRioVistas.',
                badge: 'Paid to campground',
                badgeColor: 'bg-green-100 text-green-700',
              },
            ].map((item) => (
              <div
                key={item.title}
                className="bg-amber-50 border border-amber-200 rounded-2xl p-7 text-center"
              >
                <span className="text-4xl block mb-3" aria-hidden="true">{item.icon}</span>
                <span className={`badge ${item.badgeColor} text-xs mb-3`}>{item.badge}</span>
                <h3 className="font-serif text-xl font-bold text-stone-900 mb-3">{item.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Minimum Stay Note */}
          <div className="bg-stone-50 border border-stone-200 rounded-xl p-5 flex items-start gap-3 max-w-2xl mx-auto mb-4">
            <span className="text-xl flex-shrink-0" aria-hidden="true">📅</span>
            <p className="text-stone-600 text-sm leading-relaxed">
              <span className="font-semibold text-stone-800">Minimum stay: 2 nights.</span> All
              bookings must include at least 2 nights. This ensures you have time to truly settle
              in and enjoy the experience.
            </p>
          </div>
        </div>
      </section>

      {/* Campground Fee Estimates Table */}
      <section className="section-padding bg-amber-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-4">Campground Fee Estimates</h2>
          <p className="section-subtitle text-center max-w-2xl mx-auto mb-3">
            These fees are paid directly to the campground — not to SunRioVistas.
          </p>
          <p className="text-amber-700 text-sm text-center font-medium mb-10">
            ⚠️ Campground fees are not included in your booking total.
          </p>

          <div className="bg-white rounded-2xl border border-amber-200 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full" aria-label="Campground fee estimates by destination">
                <thead>
                  <tr className="bg-amber-600 text-white">
                    <th className="text-left px-6 py-4 text-sm font-semibold">Destination</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold">Est. Nightly Fee</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold hidden sm:table-cell">
                      Hookups
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold hidden md:table-cell">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {destinationFees.map((dest, i) => (
                    <tr
                      key={dest.name}
                      className={`border-t border-amber-100 ${i % 2 === 0 ? 'bg-white' : 'bg-amber-50/40'}`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span aria-hidden="true">{dest.emoji}</span>
                          <span className="font-medium text-stone-800 text-sm">{dest.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-amber-700 text-sm">{dest.fee}</span>
                      </td>
                      <td className="px-6 py-4 hidden sm:table-cell">
                        <span
                          className={`badge text-xs ${
                            dest.hookups
                              ? 'bg-green-100 text-green-700'
                              : 'bg-stone-100 text-stone-500'
                          }`}
                        >
                          {dest.hookups ? 'Yes' : 'Dry camping'}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <p className="text-stone-500 text-xs leading-relaxed">{dest.notes}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <p className="text-stone-400 text-xs text-center mt-4 leading-relaxed">
            Fee estimates are approximate and subject to change. Always verify with the campground
            directly. Campground fees are paid on arrival — not to SunRioVistas.
          </p>
        </div>
      </section>

      {/* Add-Ons */}
      <section className="section-padding bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-4">Optional Add-Ons</h2>
          <p className="section-subtitle text-center max-w-2xl mx-auto mb-10">
            Make your stay extra special with curated add-ons. Request them during booking.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {(dbAddOns ?? staticAddOns).map((addon: any) => (
              <div
                key={addon.name}
                className="bg-amber-50 border border-amber-200 rounded-xl p-5 hover:border-amber-400 hover:shadow-sm transition-all duration-200"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="font-semibold text-stone-900 text-sm leading-tight">{addon.name}</h3>
                  <span className="text-amber-700 font-bold text-sm whitespace-nowrap flex-shrink-0">
                    +{addon.price ?? `$${Number(addon.basePrice).toFixed(0)}`}
                  </span>
                </div>
                <p className="text-stone-500 text-xs leading-relaxed">
                  {addon.description}
                </p>
              </div>
            ))}
          </div>

          <p className="text-stone-400 text-xs text-center mt-6">
            Add-on pricing may vary. Mention your preferred add-ons in the booking request message.
          </p>
        </div>
      </section>

      {/* Pricing FAQ */}
      <section className="section-padding bg-stone-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-serif text-3xl font-bold text-white text-center mb-10">
            Pricing FAQs
          </h2>
          <div className="space-y-4">
            {[
              {
                q: 'Is the campground fee included in my booking?',
                a: 'No. Campground fees are paid directly to the campground or host on arrival. They are never included in your SunRioVistas booking total.',
              },
              {
                q: 'Can I see rates before requesting a booking?',
                a: 'Nightly rates are configurable by admin and vary by RV and season. Submit a booking request or contact us to receive a quote for your specific dates.',
              },
              {
                q: 'Is the $60 cleaning fee negotiable?',
                a: 'The $60 cleaning fee is mandatory for all bookings and covers professional cleaning between every stay. It is non-negotiable.',
              },
              {
                q: 'Are there any other fees I should know about?',
                a: "The only fees from SunRioVistas are the nightly rate, $60 cleaning fee, and any optional add-ons you request. No mileage, no insurance, no hidden fees. Campground fees are separate and paid to the campground.",
              },
            ].map((item) => (
              <div key={item.q} className="bg-stone-800 border border-stone-700 rounded-xl p-6">
                <h3 className="font-semibold text-white mb-2 text-base">{item.q}</h3>
                <p className="text-stone-400 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-amber-600 text-center px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl font-bold text-white mb-4">
            Ready to Check Availability?
          </h2>
          <p className="text-amber-100 mb-8">
            Submit a booking request and we&apos;ll confirm your dates and pricing within 24 hours.
          </p>
          <Link
            href="/book"
            className="inline-flex items-center gap-2 bg-white text-amber-700 font-bold px-10 py-4 rounded-full text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            Check Availability
          </Link>
        </div>
      </section>
    </main>
  )
}
