import Link from 'next/link'

const urgencyItems = [
  {
    emoji: '🌊',
    title: 'Folsom Lake weekends',
    description:
      'Peak summer spots near the water go fast. Lake-view weekends sell out early — especially July and August.',
    pulseColor: 'bg-blue-500',
    borderColor: 'border-blue-200',
    bgColor: 'bg-blue-50',
    titleColor: 'text-blue-900',
    descColor: 'text-blue-700',
  },
  {
    emoji: '🍷',
    title: 'Winery glamping',
    description:
      'Harvest season winery weekends fill up months in advance. September and October are especially popular.',
    pulseColor: 'bg-purple-500',
    borderColor: 'border-purple-200',
    bgColor: 'bg-purple-50',
    titleColor: 'text-purple-900',
    descColor: 'text-purple-700',
  },
  {
    emoji: '🎆',
    title: 'Holiday weekends',
    description:
      "Memorial Day, July 4th, Labor Day — book early or miss out. These dates fill up first and we can't hold them.",
    pulseColor: 'bg-red-500',
    borderColor: 'border-red-200',
    bgColor: 'bg-red-50',
    titleColor: 'text-red-900',
    descColor: 'text-red-700',
  },
]

export default function Scarcity() {
  return (
    <section className="section-padding bg-amber-50" aria-labelledby="scarcity-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-red-100 border border-red-200 text-red-700 text-sm font-semibold px-4 py-2 rounded-full mb-6">
            <span
              className="inline-block w-2 h-2 bg-red-500 rounded-full animate-pulse"
              aria-hidden="true"
            />
            Limited Availability
          </div>
          <h2 id="scarcity-title" className="section-title mb-4">
            Limited Summer Weekends Available
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            Only 3 RVs means spots are genuinely limited. These dates fill faster than you&apos;d expect.
          </p>
        </div>

        {/* Urgency Banners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-14">
          {urgencyItems.map((item) => (
            <div
              key={item.title}
              className={`rounded-2xl border-2 ${item.borderColor} ${item.bgColor} p-7 relative overflow-hidden`}
            >
              {/* Decorative circle */}
              <div
                className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-10"
                style={{ background: 'currentColor' }}
                aria-hidden="true"
              />

              {/* Live indicator */}
              <div className="flex items-center gap-2 mb-4">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${item.pulseColor} animate-pulse`}
                  aria-hidden="true"
                />
                <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                  High Demand
                </span>
              </div>

              <span className="text-4xl block mb-3" aria-hidden="true">
                {item.emoji}
              </span>
              <h3 className={`font-serif text-xl font-bold ${item.titleColor} mb-2`}>
                {item.title}
              </h3>
              <p className={`${item.descColor} text-sm leading-relaxed`}>{item.description}</p>
            </div>
          ))}
        </div>

        {/* Countdown-style Callout */}
        <div className="max-w-3xl mx-auto bg-amber-600 rounded-2xl p-10 text-center shadow-xl">
          <div className="text-4xl mb-4" aria-hidden="true">
            ⏳
          </div>
          <p className="font-serif text-2xl sm:text-3xl font-bold text-white mb-3 leading-snug">
            Don&apos;t wait for the perfect moment.
          </p>
          <p className="text-amber-100 text-lg mb-8">
            Book now and <span className="text-white font-semibold">make it</span> the perfect
            moment.
          </p>
          <Link
            href="/book"
            className="inline-flex items-center gap-2 bg-white text-amber-700 font-bold px-10 py-4 rounded-full text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            Check Availability Now
          </Link>
        </div>
      </div>
    </section>
  )
}
