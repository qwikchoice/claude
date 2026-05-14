import type { Metadata } from 'next'
import Link from 'next/link'
import prisma from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Our RV Experiences | SunRioVistas',
  description:
    'Browse our three luxury stationary RV glamping experiences near Folsom Lake, Northern California. No driving required — your RV is already set up on arrival.',
}

// Static fallback data when DB is unavailable
const staticRVs = [
  {
    id: 'lunaris',
    slug: 'lunaris',
    name: 'Lunaris',
    emoji: '🌙',
    tagline: 'Cozy Couples & Family-Friendly Getaways',
    description:
      'A warm retreat where lake mornings meet campfire evenings. Perfect for families making memories and couples seeking relaxed togetherness.',
    maxGuests: 6,
    amenities: [
      'Full kitchen',
      'Queen bed + bunks',
      'Private bathroom',
      'Outdoor seating',
      'Campfire setup',
    ],
    colorScheme: 'amber',
    theme: 'cozy-family',
  },
  {
    id: 'stellaris',
    slug: 'stellaris',
    name: 'Stellaris',
    emoji: '✨',
    tagline: 'Spiritual & Soulful Journeys',
    description:
      'A healing sanctuary designed for intentional living. Breathe deep, unplug, and reconnect with what matters most.',
    maxGuests: 4,
    amenities: [
      'Yoga mats & meditation space',
      'King bed',
      'Essential oil diffuser',
      'Herbal tea station',
      'Nature sound system',
    ],
    colorScheme: 'purple',
    theme: 'wellness',
  },
  {
    id: 'solaris',
    slug: 'solaris',
    name: 'Solaris',
    emoji: '☀️',
    tagline: 'For Free Spirits & Young Explorers',
    description:
      "Life's too short for boring weekends. Pack your friends, pour the wine, and make stories worth telling.",
    maxGuests: 6,
    amenities: [
      'Social lounge area',
      'Wine glasses & opener',
      'Outdoor string lights',
      'Bluetooth speaker',
      'Adventure gear storage',
    ],
    colorScheme: 'orange',
    theme: 'adventure',
  },
]

type RVDisplay = {
  id: string
  slug: string
  name: string
  emoji: string
  tagline: string
  description: string
  maxGuests: number
  amenities: string[]
  colorScheme: string
  theme: string
}

const colorMap: Record<string, { gradient: string; badge: string; border: string; cta: string }> = {
  amber: {
    gradient: 'from-amber-600 to-orange-600',
    badge: 'bg-amber-100 text-amber-800',
    border: 'border-amber-200',
    cta: 'bg-amber-600 hover:bg-amber-700',
  },
  purple: {
    gradient: 'from-purple-600 to-violet-600',
    badge: 'bg-purple-100 text-purple-800',
    border: 'border-purple-200',
    cta: 'bg-purple-600 hover:bg-purple-700',
  },
  orange: {
    gradient: 'from-orange-500 to-amber-500',
    badge: 'bg-orange-100 text-orange-800',
    border: 'border-orange-200',
    cta: 'bg-orange-600 hover:bg-orange-700',
  },
}

async function getRVs(): Promise<RVDisplay[]> {
  try {
    const rvs = await prisma.rV.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        slug: true,
        name: true,
        emoji: true,
        tagline: true,
        description: true,
        maxGuests: true,
        amenities: true,
        colorScheme: true,
        theme: true,
      },
    })
    return rvs.length > 0 ? rvs : staticRVs
  } catch {
    return staticRVs
  }
}

export default async function RVsPage() {
  const rvs = await getRVs()

  return (
    <main className="pt-20">
      {/* Header */}
      <section className="bg-gradient-to-br from-amber-900 via-orange-800 to-amber-700 py-20 md:py-28 text-center px-4">
        <div className="max-w-4xl mx-auto">
          <span className="inline-block text-4xl mb-4" aria-hidden="true">⛺</span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Choose Your Luxury Experience
          </h1>
          <p className="text-amber-100 text-lg sm:text-xl max-w-2xl mx-auto mb-8 leading-relaxed">
            Three fully setup, curated RV lifestyles. You drive your car — the RV is already there,
            waiting for you.
          </p>
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-amber-100 text-sm font-medium px-4 py-2 rounded-full backdrop-blur-sm">
            <span aria-hidden="true">🚗</span>
            <span>You never drive the RV — just your own car</span>
          </div>
        </div>
      </section>

      {/* RV Cards Grid */}
      <section className="section-padding bg-amber-50" aria-label="RV Experiences">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {rvs.map((rv) => {
              const colors = colorMap[rv.colorScheme] ?? colorMap.amber
              return (
                <article
                  key={rv.id}
                  className={`bg-white rounded-2xl border-2 ${colors.border} overflow-hidden shadow hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col`}
                >
                  {/* Image Placeholder */}
                  <div
                    className={`bg-gradient-to-br ${colors.gradient} h-56 flex items-center justify-center relative overflow-hidden`}
                  >
                    <div
                      className="absolute inset-0 opacity-20"
                      style={{ background: 'radial-gradient(ellipse at top left, white, transparent 70%)' }}
                      aria-hidden="true"
                    />
                    <div className="relative z-10 text-center">
                      <span className="text-7xl block mb-2" aria-hidden="true">{rv.emoji}</span>
                      <span className="text-white/80 text-sm font-medium">Image coming soon</span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex flex-col flex-1 p-8">
                    <h2 className="font-serif text-2xl font-bold text-stone-900 mb-1">{rv.name}</h2>
                    <p className="text-amber-700 font-medium text-sm mb-3">{rv.tagline}</p>
                    <p className="text-stone-600 text-sm leading-relaxed mb-5">{rv.description}</p>

                    {/* Key Amenities */}
                    <div className="mb-5">
                      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                        Key Amenities
                      </p>
                      <ul className="space-y-1.5">
                        {rv.amenities.slice(0, 5).map((a) => (
                          <li key={a} className="flex items-center gap-2 text-sm text-stone-600">
                            <span className="text-amber-500 flex-shrink-0" aria-hidden="true">✓</span>
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Guests Badge */}
                    <div className="mb-6">
                      <span className={`badge ${colors.badge} text-xs`}>
                        Up to {rv.maxGuests} guests
                      </span>
                    </div>

                    {/* Price note */}
                    <p className="text-stone-400 text-xs mb-4 italic">
                      Pricing varies by date — request a quote to see current rates
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col gap-3 mt-auto">
                      <Link
                        href={`/rvs/${rv.slug}`}
                        className={`block w-full text-center py-3 px-6 rounded-full ${colors.cta} text-white font-semibold text-sm shadow hover:shadow-md hover:scale-105 transition-all duration-200`}
                      >
                        View Details — {rv.name}
                      </Link>
                      <Link
                        href={`/book?rv=${rv.slug}`}
                        className="block w-full text-center py-3 px-6 rounded-full border-2 border-amber-600 text-amber-700 font-semibold text-sm hover:bg-amber-50 transition-all duration-200"
                      >
                        Book {rv.name}
                      </Link>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* Why Our RVs Are Different */}
      <section className="section-padding bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="section-title mb-4">Why Our RVs Are Different</h2>
          <p className="section-subtitle mb-10">
            Every RV in our fleet is a curated glamping experience — not just a vehicle to rent.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {[
              {
                icon: '🚗',
                title: 'You Never Drive It',
                desc: 'Drive your own car. The RV is already setup at the campground when you arrive.',
              },
              {
                icon: '✨',
                title: 'Fully Curated',
                desc: 'Each RV has a distinct personality, décor, and amenity set designed for a specific travel style.',
              },
              {
                icon: '🔒',
                title: 'Manually Approved',
                desc: 'Every booking is personally reviewed to ensure you get the best possible experience.',
              },
            ].map((item) => (
              <div key={item.title} className="bg-amber-50 rounded-2xl p-6 text-center">
                <span className="text-4xl block mb-3" aria-hidden="true">{item.icon}</span>
                <h3 className="font-serif text-lg font-bold text-stone-900 mb-2">{item.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 bg-amber-600 text-center px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl font-bold text-white mb-4">
            Ready to Choose Your RV?
          </h2>
          <p className="text-amber-100 mb-8">
            Submit a booking request and we&apos;ll confirm your dates within 24 hours.
          </p>
          <Link
            href="/book"
            className="inline-flex items-center gap-2 bg-white text-amber-700 font-bold px-10 py-4 rounded-full text-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
          >
            Book Any RV
          </Link>
        </div>
      </section>
    </main>
  )
}
