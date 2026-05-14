const traditional = [
  'Expensive RV insurance required',
  'Gas costs ($80–$200/tank)',
  'Mileage fees (often $0.25–$0.35/mile)',
  'Stressful RV driving',
  'Towing required for some rigs',
  'Dumping tanks yourself',
  'Setup at campground',
  'Limited to experienced drivers',
]

const withUs = [
  'No RV insurance needed',
  'No RV gas costs',
  'No mileage fees — ever',
  'Drive your OWN car to us',
  'RV already setup on arrival',
  'No dumping tanks',
  'Full glamping amenities ready',
  'Perfect for first-timers',
]

export default function WhyDifferent() {
  return (
    <section className="section-padding bg-white" aria-labelledby="why-different-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 id="why-different-title" className="section-title mb-4">
            Why RV Glamping Is Better
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            Everything you love about RV camping. None of the stress.
          </p>
        </div>

        {/* Comparison Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {/* Traditional RV Rental */}
          <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-xl">
                😰
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-red-800">
                  Traditional RV Rental
                </h3>
                <p className="text-red-500 text-sm">The stressful way</p>
              </div>
            </div>
            <ul className="space-y-3">
              {traditional.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-lg mt-0.5 flex-shrink-0" aria-hidden="true">❌</span>
                  <span className="text-red-700 text-sm leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* SunRioVistas */}
          <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-8 relative">
            <div className="absolute -top-3 right-6">
              <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                The Better Way
              </span>
            </div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center text-xl">
                😎
              </div>
              <div>
                <h3 className="font-serif text-xl font-bold text-amber-900">
                  SunRioVistas Glamping
                </h3>
                <p className="text-amber-600 text-sm">Stress-free & luxurious</p>
              </div>
            </div>
            <ul className="space-y-3">
              {withUs.map((item, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-lg mt-0.5 flex-shrink-0" aria-hidden="true">✅</span>
                  <span className="text-amber-900 text-sm font-medium leading-snug">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bold Callout */}
        <div className="max-w-4xl mx-auto bg-amber-500 rounded-2xl p-8 text-center shadow-lg">
          <p className="text-white text-lg sm:text-xl font-semibold leading-relaxed">
            💡 Most 3-day RV rentals cost{' '}
            <span className="font-bold text-white">$800–$1,200+</span>{' '}
            after insurance, booking fees, gas, and mileage.{' '}
            <span className="block sm:inline mt-2 sm:mt-0">
              Our luxury glamping stays often come in{' '}
              <span className="font-bold underline">under $500</span>{' '}
              before campground fees.
            </span>
          </p>
        </div>
      </div>
    </section>
  )
}
