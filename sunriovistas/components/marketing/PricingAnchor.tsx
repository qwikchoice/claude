import Link from 'next/link'

const elsewhereItems = [
  { label: 'RV rental fee', value: '$400–$700', strikethrough: true },
  { label: 'RV insurance', value: '$50–$150', strikethrough: true },
  { label: 'Gas (full tank)', value: '$80–$200', strikethrough: true },
  { label: 'Mileage fees', value: '$50–$150', strikethrough: true },
  { label: 'Setup stress', value: 'Priceless 😅', strikethrough: true },
]

const withUsItems = [
  { label: 'Luxury glamping nightly rate', value: 'Admin-configurable', highlight: false },
  { label: 'Cleaning fee (mandatory)', value: '$60 flat', highlight: true },
  { label: 'RV insurance', value: 'None', highlight: true },
  { label: 'Gas costs', value: 'None', highlight: true },
  { label: 'Mileage fees', value: 'None — ever', highlight: true },
  { label: 'RV pre-setup', value: 'Included', highlight: true },
]

export default function PricingAnchor() {
  return (
    <section className="section-padding bg-stone-900" aria-labelledby="pricing-anchor-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h2
            id="pricing-anchor-title"
            className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Real Savings, Real Luxury
          </h2>
          <p className="text-stone-400 text-lg max-w-2xl mx-auto">
            See how traditional RV rentals compare to a SunRioVistas glamping experience.
          </p>
        </div>

        {/* Comparison Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {/* Elsewhere Column */}
          <div className="bg-stone-800 border border-stone-700 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-stone-700 flex items-center justify-center text-xl">
                🚛
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-stone-200">
                  Typical RV Rental
                </h3>
                <p className="text-stone-500 text-sm">What you'd pay elsewhere</p>
              </div>
            </div>

            <ul className="space-y-4 mb-6">
              {elsewhereItems.map((item, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span className="text-stone-400 text-sm">{item.label}</span>
                  <span className="text-stone-500 text-sm line-through">{item.value}</span>
                </li>
              ))}
            </ul>

            <div className="border-t border-stone-700 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-stone-300 font-semibold">Typical Total</span>
                <span className="text-red-400 font-bold text-xl line-through">$580–$1,200+</span>
              </div>
            </div>
          </div>

          {/* With Us Column */}
          <div className="bg-amber-600 border-2 border-amber-500 rounded-2xl p-8 relative overflow-hidden">
            <div className="absolute -top-3 right-6">
              <span className="bg-white text-amber-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide shadow">
                The Better Way
              </span>
            </div>

            {/* Decorative glow */}
            <div
              className="absolute inset-0 opacity-20 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse at top right, #fbbf24, transparent 70%)',
              }}
              aria-hidden="true"
            />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-xl">
                  ⛺
                </div>
                <div>
                  <h3 className="font-serif text-xl font-bold text-white">
                    SunRioVistas Glamping
                  </h3>
                  <p className="text-amber-100 text-sm">What you pay with us</p>
                </div>
              </div>

              <ul className="space-y-4 mb-6">
                {withUsItems.map((item, i) => (
                  <li key={i} className="flex items-center justify-between">
                    <span className="text-amber-50 text-sm">{item.label}</span>
                    <span
                      className={`text-sm font-semibold ${
                        item.highlight ? 'text-white' : 'text-amber-200'
                      }`}
                    >
                      {item.value}
                    </span>
                  </li>
                ))}
              </ul>

              <div className="border-t border-amber-500 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-amber-50 font-semibold">You Save</span>
                  <span className="text-white font-bold text-xl">Hundreds</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Campground Fee Note */}
        <div className="max-w-3xl mx-auto bg-stone-800 border border-stone-700 rounded-xl p-6 text-center mb-10">
          <p className="text-stone-300 text-base leading-relaxed">
            <span className="text-amber-400 font-semibold">Plus:</span> Campground fees are paid
            directly to the campground — not us. No hidden fees, no markups.
          </p>
        </div>

        {/* Urgency */}
        <div className="text-center mb-10">
          <p className="text-amber-300 text-lg font-semibold">
            ⚡ Summer weekends near Folsom Lake fill up fast.
          </p>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-semibold px-10 py-4 rounded-full text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            See Pricing &amp; Availability
          </Link>
        </div>
      </div>
    </section>
  )
}
