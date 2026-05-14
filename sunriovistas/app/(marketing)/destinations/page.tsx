import type { Metadata } from 'next'
import Link from 'next/link'
import prisma from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Destinations | SunRioVistas',
  description:
    'Explore our curated glamping destinations near Folsom Lake and Northern California. From lakeside campgrounds to winery stays — all within 2 hours of Sacramento.',
}

const staticDestinations = [
  {
    id: 'beals-point',
    slug: 'beals-point-folsom-lake',
    name: 'Beals Point / Folsom Lake',
    emoji: '🌊',
    location: 'Granite Bay, CA',
    description:
      'Wake up to glittering lake views and golden mornings. The quintessential Northern California glamping backdrop with swimming, kayaking, and spectacular sunsets.',
    campgroundFeeEstimate: '~$30–$60/night',
    hookupAvailable: true,
    activities: ['Kayaking', 'Swimming', 'Biking', 'Campfire Nights', 'Hiking'],
  },
  {
    id: 'placerville',
    slug: 'placerville-rv-resort',
    name: 'Placerville RV Resort',
    emoji: '🏔️',
    location: 'Placerville, CA',
    description:
      'Nestled in the Sierra Nevada foothills with premium hookups and mountain-town charm. Apple orchards, wineries, and small-town history await.',
    campgroundFeeEstimate: '~$90/night',
    hookupAvailable: true,
    activities: ['Wine Tasting', 'Apple Picking', 'Historic Downtown', 'Mountain Biking'],
  },
  {
    id: 'red-hawk',
    slug: 'red-hawk-casino',
    name: 'Red Hawk Casino',
    emoji: '🎰',
    location: 'Shingle Springs, CA',
    description:
      'Entertainment-packed overnight stays with world-class dining, live shows, and the thrill of the casino floor — all with free dry camping.',
    campgroundFeeEstimate: 'Free dry camping',
    hookupAvailable: false,
    activities: ['Casino Entertainment', 'Fine Dining', 'Live Shows', 'Spa Services'],
  },
  {
    id: 'harvest-hosts',
    slug: 'harvest-hosts-wineries',
    name: 'Harvest Hosts / Wineries',
    emoji: '🍷',
    location: 'Various, Northern CA',
    description:
      'Sleep under the stars at working vineyards and farms. Wake up to wine country, farm-fresh breakfasts, and the kind of mornings you write home about.',
    campgroundFeeEstimate: '$0–$30/night',
    hookupAvailable: false,
    activities: ['Wine Tasting', 'Vineyard Tours', 'Farm-to-Table Dining', 'Scenic Walks'],
  },
  {
    id: 'auburn',
    slug: 'auburn-gold-country',
    name: 'Auburn / Gold Country',
    emoji: '⛏️',
    location: 'Auburn, CA',
    description:
      'Foothill escapes with history, rivers, and nature trails at every turn. Pan for gold, kayak the American River, and explore a region rich in California history.',
    campgroundFeeEstimate: 'Varies by site',
    hookupAvailable: false,
    activities: ['Gold Panning', 'River Kayaking', 'Hiking', 'Historic Exploration'],
  },
]

async function getDestinations() {
  try {
    const destinations = await prisma.destination.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    })
    return destinations.length > 0 ? destinations : staticDestinations
  } catch {
    return staticDestinations
  }
}

export default async function DestinationsPage() {
  const destinations = await getDestinations()

  return (
    <main className="pt-20">
      {/* Header */}
      <section className="bg-gradient-to-br from-amber-900 via-orange-800 to-amber-700 py-20 md:py-28 text-center px-4">
        <div className="max-w-4xl mx-auto">
          <span className="text-5xl block mb-4" aria-hidden="true">🗺️</span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">
            Explore Our Destinations
          </h1>
          <p className="text-amber-100 text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
            From California lake country to wine-country retreats — all within 2 hours of
            Sacramento. You drive your own car; the RV is already setup and waiting.
          </p>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className="section-padding bg-amber-50" aria-label="Available destinations">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {destinations.map((dest: any) => (
              <article
                key={dest.slug}
                className="bg-white border border-stone-200 rounded-2xl overflow-hidden shadow hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {/* Map placeholder */}
                <div className="bg-gradient-to-br from-amber-50 to-stone-100 h-44 flex items-center justify-center border-b border-stone-100">
                  <div className="text-center">
                    <span className="text-6xl block mb-2" aria-hidden="true">{dest.emoji}</span>
                    <span className="text-stone-400 text-xs">{dest.location}</span>
                  </div>
                </div>

                <div className="flex flex-col flex-1 p-6">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h2 className="font-serif text-xl font-bold text-stone-900 leading-tight">
                      {dest.name}
                    </h2>
                    {dest.hookupAvailable && (
                      <span className="badge bg-green-100 text-green-700 text-xs whitespace-nowrap flex-shrink-0">
                        Full hookups
                      </span>
                    )}
                  </div>

                  <p className="text-stone-500 text-xs mb-3">{dest.location}</p>
                  <p className="text-stone-600 text-sm leading-relaxed mb-4">{dest.description}</p>

                  {/* Fee badge */}
                  <div className="mb-4">
                    <span className="badge bg-amber-100 text-amber-800 text-xs">
                      Campground fee: {dest.campgroundFeeEstimate ?? dest.campgroundFeeEstimate}
                    </span>
                  </div>

                  {/* Activities */}
                  {dest.activities?.length > 0 && (
                    <div className="mb-5 flex-1">
                      <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-2">
                        Activities
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {dest.activities.slice(0, 4).map((act: string) => (
                          <span key={act} className="badge bg-stone-100 text-stone-600 text-xs">
                            {act}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <Link
                    href={`/destinations/${dest.slug}`}
                    className="block w-full text-center py-3 px-5 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-semibold text-sm shadow hover:shadow-md hover:scale-105 transition-all duration-200 mt-auto"
                  >
                    Explore Destination
                  </Link>
                </div>
              </article>
            ))}
          </div>

          {/* Disclaimer */}
          <div className="mt-12 max-w-3xl mx-auto bg-white border border-amber-200 rounded-xl px-6 py-5 text-center">
            <p className="text-stone-500 text-sm leading-relaxed">
              <span className="font-semibold text-amber-700">Important:</span> Campground fees are
              paid directly to the campground/host and are not included in your SunRioVistas booking
              total. We provide fee estimates so you can plan accordingly.
            </p>
          </div>
        </div>
      </section>

      {/* Book CTA */}
      <section className="py-16 bg-stone-900 text-center px-4">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl font-bold text-white mb-4">
            Found Your Perfect Backdrop?
          </h2>
          <p className="text-stone-400 mb-8">
            Choose your destination and RV, then submit your booking request. We&apos;ll take care
            of the rest.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/book"
              className="inline-flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold px-8 py-4 rounded-full text-base shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200"
            >
              Request a Booking
            </Link>
            <Link
              href="/rvs"
              className="inline-flex items-center justify-center gap-2 border-2 border-stone-600 text-stone-300 hover:border-amber-500 hover:text-amber-400 font-semibold px-8 py-4 rounded-full text-base transition-all duration-200"
            >
              Browse RV Experiences
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
