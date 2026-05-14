import Link from 'next/link'

const destinations = [
  {
    emoji: '🌊',
    name: 'Beals Point / Folsom Lake',
    slug: 'beals-point-folsom-lake',
    location: 'Granite Bay, CA',
    description:
      'Wake up to glittering lake views and golden mornings. The quintessential Northern California glamping backdrop.',
    feeEstimate: '~$30–$60/night',
    activities: [
      { icon: '🚣', label: 'Kayaking' },
      { icon: '🚴', label: 'Biking' },
      { icon: '🏊', label: 'Swimming' },
      { icon: '🔥', label: 'Campfire Nights' },
    ],
    badgeClass: 'bg-blue-100 text-blue-800',
    accentColor: 'border-blue-200',
    emojiAlt: 'Folsom Lake waterfront',
  },
  {
    emoji: '🏔️',
    name: 'Placerville RV Resort',
    slug: 'placerville-rv-resort',
    location: 'Placerville, CA',
    description:
      'Nestled in the Sierra Nevada foothills with premium hookups and mountain-town charm.',
    feeEstimate: '~$90/night',
    activities: [
      { icon: '🍷', label: 'Wine Tasting' },
      { icon: '🍎', label: 'Apple Picking' },
      { icon: '🏘️', label: 'Historic Downtown' },
      { icon: '🚵', label: 'Mountain Biking' },
    ],
    badgeClass: 'bg-green-100 text-green-800',
    accentColor: 'border-green-200',
    emojiAlt: 'Placerville mountain resort',
  },
  {
    emoji: '🎰',
    name: 'Red Hawk Casino',
    slug: 'red-hawk-casino',
    location: 'Shingle Springs, CA',
    description:
      'Entertainment-packed overnight stay with dining, shows, and the thrill of the floor.',
    feeEstimate: 'Free dry camping',
    activities: [
      { icon: '🎲', label: 'Casino Entertainment' },
      { icon: '🍽️', label: 'Fine Dining' },
      { icon: '🎭', label: 'Live Shows' },
      { icon: '💆', label: 'Spa Services' },
    ],
    badgeClass: 'bg-red-100 text-red-800',
    accentColor: 'border-red-200',
    emojiAlt: 'Red Hawk Casino exterior',
  },
  {
    emoji: '🍷',
    name: 'Harvest Hosts / Wineries',
    slug: 'harvest-hosts-wineries',
    location: 'Various, Northern CA',
    description:
      'Sleep under the stars at working vineyards and farms. Wake up to wine country.',
    feeEstimate: '$0–$30/night',
    activities: [
      { icon: '🍾', label: 'Wine Tasting' },
      { icon: '🌿', label: 'Vineyard Tours' },
      { icon: '🌾', label: 'Farm-to-Table Dining' },
      { icon: '🚶', label: 'Scenic Walks' },
    ],
    badgeClass: 'bg-purple-100 text-purple-800',
    accentColor: 'border-purple-200',
    emojiAlt: 'Winery vineyard at sunset',
  },
  {
    emoji: '⛏️',
    name: 'Auburn / Gold Country',
    slug: 'auburn-gold-country',
    location: 'Auburn, CA',
    description:
      'Foothill escapes with history, rivers, and nature trails at every turn.',
    feeEstimate: 'Varies by site',
    activities: [
      { icon: '⚒️', label: 'Gold Panning' },
      { icon: '🛶', label: 'River Kayaking' },
      { icon: '🥾', label: 'Hiking' },
      { icon: '🏛️', label: 'Historic Exploration' },
    ],
    badgeClass: 'bg-amber-100 text-amber-800',
    accentColor: 'border-amber-200',
    emojiAlt: 'Auburn Gold Country foothills',
  },
]

export default function DestinationCards() {
  return (
    <section className="section-padding bg-amber-50" aria-labelledby="destinations-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 id="destinations-title" className="section-title mb-4">
            Where Will You Escape?
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            From lakeside sunsets to vineyard evenings — find your perfect backdrop.
          </p>
        </div>

        {/* Mobile: horizontal scroll | Desktop: 3-col grid */}
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory md:grid md:grid-cols-3 md:overflow-visible md:pb-0 lg:grid-cols-5 scrollbar-hide">
          {destinations.map((dest) => (
            <article
              key={dest.slug}
              className={`card flex-none w-72 md:w-auto snap-start border-2 ${dest.accentColor} flex flex-col group`}
            >
              {/* Emoji Header */}
              <div className="bg-white rounded-t-xl p-6 text-center border-b border-stone-100">
                <span
                  className="text-5xl block mb-3 group-hover:scale-110 transition-transform duration-300"
                  role="img"
                  aria-label={dest.emojiAlt}
                >
                  {dest.emoji}
                </span>
                <h3 className="font-serif text-lg font-bold text-stone-900 leading-tight mb-1">
                  {dest.name}
                </h3>
                <p className="text-stone-400 text-xs font-medium">{dest.location}</p>
              </div>

              {/* Card Body */}
              <div className="flex flex-col flex-1 p-5">
                <p className="text-stone-600 text-xs leading-relaxed mb-4">{dest.description}</p>

                {/* Fee Badge */}
                <div className="mb-4">
                  <span className={`badge ${dest.badgeClass} text-xs`}>
                    Campground fee: {dest.feeEstimate}
                  </span>
                </div>

                {/* Activities */}
                <div className="mb-5 flex-1">
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                    Activities
                  </p>
                  <ul className="grid grid-cols-2 gap-1.5">
                    {dest.activities.map((act) => (
                      <li
                        key={act.label}
                        className="flex items-center gap-1.5 text-xs text-stone-600"
                      >
                        <span aria-hidden="true">{act.icon}</span>
                        <span>{act.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <Link
                  href={`/destinations/${dest.slug}`}
                  className="block w-full text-center py-2.5 px-4 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow hover:shadow-md hover:scale-105 transition-all duration-200 mt-auto"
                >
                  Explore
                </Link>
              </div>
            </article>
          ))}
        </div>

        {/* Campground Fee Disclaimer */}
        <div className="mt-10 max-w-3xl mx-auto">
          <p className="text-center text-stone-500 text-sm bg-white border border-amber-200 rounded-xl px-6 py-4 leading-relaxed">
            <span className="font-semibold text-amber-700">Important:</span> Campground fees are
            paid directly to the campground/host and are not included in your booking total. We
            provide fee estimates for each destination so you can plan accordingly.
          </p>
        </div>
      </div>
    </section>
  )
}
