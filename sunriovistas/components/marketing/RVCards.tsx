import Link from 'next/link'

const rvs = [
  {
    emoji: '🌙',
    name: 'Lunaris',
    slug: 'lunaris',
    tagline: 'Cozy Couples & Family-Friendly Getaways',
    description:
      'A warm retreat where lake mornings meet campfire evenings. Perfect for families making memories and couples seeking relaxed togetherness.',
    bestFor: ['Couples', 'Small Families', 'Beginners'],
    vibe: [
      { icon: '🔥', label: 'Campfire nights' },
      { icon: '🌅', label: 'Lakeside mornings' },
      { icon: '🛋️', label: 'Cozy interiors' },
      { icon: '👨‍👩‍👧', label: 'Family memories' },
    ],
    gradient: 'from-amber-600 to-orange-600',
    badgeColor: 'bg-amber-100 text-amber-800',
    borderColor: 'border-amber-200',
    accentBg: 'bg-amber-50',
    ctaClass: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
  {
    emoji: '✨',
    name: 'Stellaris',
    slug: 'stellaris',
    tagline: 'Spiritual & Soulful Journeys',
    description:
      'A healing sanctuary designed for intentional living. Breathe deep, unplug, and reconnect with what matters most.',
    bestFor: ['Wellness Travelers', 'Couples Retreats', 'Solo Travelers'],
    vibe: [
      { icon: '🧘', label: 'Meditation & yoga' },
      { icon: '🌿', label: 'Digital detox' },
      { icon: '🌸', label: 'Nature healing' },
      { icon: '☕', label: 'Slow mornings' },
    ],
    gradient: 'from-purple-600 to-violet-600',
    badgeColor: 'bg-purple-100 text-purple-800',
    borderColor: 'border-purple-200',
    accentBg: 'bg-purple-50',
    ctaClass: 'bg-purple-600 hover:bg-purple-700 text-white',
  },
  {
    emoji: '☀️',
    name: 'Solaris',
    slug: 'solaris',
    tagline: 'For Free Spirits & Young Explorers',
    description:
      "Life's too short for boring weekends. Pack your friends, pour the wine, and make stories worth telling.",
    bestFor: ['Young Couples', 'Friend Groups', 'Adventurers'],
    vibe: [
      { icon: '🍷', label: 'Wine-country sunsets' },
      { icon: '🏕️', label: 'Scenic escapes' },
      { icon: '🎉', label: 'Social weekends' },
      { icon: '🗺️', label: 'Exploration' },
    ],
    gradient: 'from-orange-500 to-amber-500',
    badgeColor: 'bg-orange-100 text-orange-800',
    borderColor: 'border-orange-200',
    accentBg: 'bg-orange-50',
    ctaClass: 'bg-orange-600 hover:bg-orange-700 text-white',
  },
]

export default function RVCards() {
  return (
    <section className="section-padding bg-amber-50" aria-labelledby="rv-cards-title">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <h2 id="rv-cards-title" className="section-title mb-4">
            Choose Your Escape Style
          </h2>
          <p className="section-subtitle max-w-2xl mx-auto">
            Each RV is a curated lifestyle experience, not just a vehicle.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {rvs.map((rv) => (
            <article
              key={rv.slug}
              className={`card flex flex-col border-2 ${rv.borderColor} overflow-hidden group`}
            >
              {/* Card Header */}
              <div className={`bg-gradient-to-br ${rv.gradient} p-8 text-center relative overflow-hidden`}>
                {/* Decorative shimmer */}
                <div
                  className="absolute inset-0 opacity-20"
                  style={{
                    background: 'radial-gradient(ellipse at top left, white, transparent 70%)',
                  }}
                  aria-hidden="true"
                />
                <div className="relative z-10">
                  <span
                    className="text-6xl block mb-3 group-hover:scale-110 transition-transform duration-300"
                    aria-hidden="true"
                  >
                    {rv.emoji}
                  </span>
                  <h3 className="font-serif text-3xl font-bold text-white mb-1">{rv.name}</h3>
                  <p className="text-white/80 text-sm font-medium">{rv.tagline}</p>
                </div>
              </div>

              {/* Card Body */}
              <div className="flex flex-col flex-1 p-7">
                <p className="text-stone-600 text-sm leading-relaxed mb-5">{rv.description}</p>

                {/* Best For Pills */}
                <div className="mb-5">
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                    Best For
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {rv.bestFor.map((tag) => (
                      <span
                        key={tag}
                        className={`badge ${rv.badgeColor} text-xs font-medium`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Vibe List */}
                <div className={`${rv.accentBg} rounded-xl p-4 mb-6`}>
                  <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
                    The Vibe
                  </p>
                  <ul className="space-y-2">
                    {rv.vibe.map((item) => (
                      <li key={item.label} className="flex items-center gap-2 text-sm text-stone-700">
                        <span aria-hidden="true">{item.icon}</span>
                        <span>{item.label}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA */}
                <div className="mt-auto">
                  <Link
                    href={`/rvs/${rv.slug}`}
                    className={`block w-full text-center py-3 px-6 rounded-full font-semibold text-sm shadow hover:shadow-md hover:scale-105 transition-all duration-200 ${rv.ctaClass}`}
                  >
                    Explore {rv.name}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Bottom note */}
        <p className="text-center text-stone-500 text-sm mt-10">
          You drive your own car to us — the RV is already set up and waiting when you arrive.
        </p>
      </div>
    </section>
  )
}
