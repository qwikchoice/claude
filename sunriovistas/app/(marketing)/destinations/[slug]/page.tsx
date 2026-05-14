import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'

interface PageProps {
  params: { slug: string }
}

const staticDestinations: Record<
  string,
  {
    name: string
    emoji: string
    location: string
    description: string
    longDescription: string
    campgroundFeeEstimate: string
    campgroundFeeNote: string
    hookupAvailable: boolean
    activities: string[]
    highlights: string[]
    atmosphere: string[]
  }
> = {
  'beals-point-folsom-lake': {
    name: 'Beals Point / Folsom Lake',
    emoji: '🌊',
    location: 'Granite Bay, CA — ~30 min from Sacramento',
    description:
      'Wake up to glittering lake views and golden mornings. The quintessential Northern California glamping backdrop.',
    longDescription:
      'Beals Point is one of the most scenic campgrounds in the greater Sacramento area, situated right on the western shores of Folsom Lake. With direct lake access, paved bike trails, swimming areas, and sweeping water views, it delivers the full outdoor California experience — all from the comfort of your fully-setup luxury RV. Mornings here are magic: golden light hitting the water while you sip coffee on the steps.',
    campgroundFeeEstimate: '~$30–$60/night',
    campgroundFeeNote:
      'Campground fees vary by site type. Hookup sites cost more than primitive spots. Fees are paid directly to California State Parks on arrival.',
    hookupAvailable: true,
    activities: ['Kayaking', 'Swimming', 'Biking', 'Campfire Nights', 'Hiking', 'Fishing'],
    highlights: ['Direct lake access', 'Bike trail connections', 'Sunset views', 'Swimming beach nearby'],
    atmosphere: ['🌅 Golden mornings', '🚣 Lake adventures', '🔥 Campfire evenings', '🌙 Stargazing nights', '🚴 Scenic bike rides'],
  },
  'placerville-rv-resort': {
    name: 'Placerville RV Resort',
    emoji: '🏔️',
    location: 'Placerville, CA — ~45 min from Sacramento',
    description:
      'Nestled in the Sierra Nevada foothills with premium hookups and mountain-town charm.',
    longDescription:
      'Placerville, known as "Old Hangtown," sits at the gateway to the Sierra Nevada foothills with a rich Gold Rush history. The RV Resort offers full hookups in a lush, tree-lined setting minutes from downtown wine tasting rooms, apple orchards, and boutique shops. This destination is ideal for those who want the comfort of a premium campsite paired with the exploration of Gold Country wine country.',
    campgroundFeeEstimate: '~$90/night',
    campgroundFeeNote:
      'Placerville RV Resort is a private resort with full hookups. Fees are paid directly to the resort and include water, sewer, and electric.',
    hookupAvailable: true,
    activities: ['Wine Tasting', 'Apple Picking', 'Historic Downtown', 'Mountain Biking', 'Gold Country Touring'],
    highlights: ['Full hookups', 'Pool access', 'Minutes from wineries', 'Lush tree setting'],
    atmosphere: ['🍷 Wine country days', '🏘️ Small-town charm', '🍎 Orchard mornings', '🏔️ Foothill scenery', '🎭 Local culture'],
  },
  'red-hawk-casino': {
    name: 'Red Hawk Casino',
    emoji: '🎰',
    location: 'Shingle Springs, CA — ~30 min from Sacramento',
    description:
      'Entertainment-packed overnight stay with dining, shows, and the thrill of the floor.',
    longDescription:
      'Red Hawk Casino Resort offers a unique RV glamping experience: free dry camping in their parking area while enjoying world-class casino entertainment, multiple dining options, live performances, and spa services just steps away. This destination is perfect for those who want a social, entertainment-rich weekend with the cozy retreat of a luxury RV to come back to.',
    campgroundFeeEstimate: 'Free dry camping',
    campgroundFeeNote:
      'Red Hawk Casino offers free dry camping (no hookups) for RV guests. No campground fees required. You only pay for what you spend inside.',
    hookupAvailable: false,
    activities: ['Casino Entertainment', 'Fine Dining', 'Live Shows', 'Spa Services', 'Pool Access'],
    highlights: ['Free parking/camping', 'On-site dining', 'Entertainment complex', 'No campground fee'],
    atmosphere: ['🎲 Casino thrills', '🍽️ Fine dining', '🎭 Live entertainment', '💆 Spa relaxation', '✨ City glamour'],
  },
  'harvest-hosts-wineries': {
    name: 'Harvest Hosts / Wineries',
    emoji: '🍷',
    location: 'Various Northern CA Vineyards',
    description:
      'Sleep under the stars at working vineyards and farms. Wake up to wine country.',
    longDescription:
      "Through the Harvest Hosts network, SunRioVistas guests can stay directly on working vineyards, farms, and unique properties across Northern California. You'll be the only guests on-site, enjoying exclusive access to the property, complimentary tastings, and the rare experience of waking up surrounded by grapevines. These are the most intimate and exclusive stays we offer.",
    campgroundFeeEstimate: '$0–$30/night',
    campgroundFeeNote:
      'Most Harvest Hosts locations are free with a Harvest Hosts membership (which we coordinate). Some properties charge a small hospitality fee paid directly on arrival.',
    hookupAvailable: false,
    activities: ['Wine Tasting', 'Vineyard Tours', 'Farm-to-Table Dining', 'Scenic Walks', 'Olive Oil Tasting'],
    highlights: ['Private vineyard access', 'Complimentary tastings', 'Farm-to-table atmosphere', 'Exclusive stays'],
    atmosphere: ['🍇 Vineyard mornings', '🌿 Farm-fresh living', '🥂 Sunset wine hours', '🌾 Rural serenity', '🌙 Dark-sky stargazing'],
  },
  'auburn-gold-country': {
    name: 'Auburn / Gold Country',
    emoji: '⛏️',
    location: 'Auburn, CA — ~45 min from Sacramento',
    description:
      'Foothill escapes with history, rivers, and nature trails at every turn.',
    longDescription:
      "Auburn sits at the crossroads of history and adventure. Once the heart of the California Gold Rush, it now offers some of the best outdoor recreation in the foothills — kayaking on the American River, hiking through stunning canyons, and exploring a historic downtown that feels frozen in time. The area's dramatic landscape, combined with mild foothill weather, makes it an exceptional glamping destination year-round.",
    campgroundFeeEstimate: 'Varies by site',
    campgroundFeeNote:
      'Campground fees in the Auburn area vary widely depending on the specific site (state park, county park, or private). We provide specific estimates upon booking.',
    hookupAvailable: false,
    activities: ['Gold Panning', 'River Kayaking', 'Hiking', 'Historic Exploration', 'Rock Climbing'],
    highlights: ['American River access', 'Gold Rush history', 'Canyon hiking', 'Outdoor adventure hub'],
    atmosphere: ['⛏️ Gold Rush history', '🛶 River adventures', '🥾 Trail days', '🌅 Canyon sunsets', '🏛️ Historic exploration'],
  },
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const data = staticDestinations[params.slug]
  if (!data) return { title: 'Destination | SunRioVistas' }

  return {
    title: `${data.emoji} ${data.name} | SunRioVistas Glamping`,
    description: `${data.description} Luxury RV glamping at ${data.name}, ${data.location}. Drive your own car — the RV is already setup.`,
  }
}

export function generateStaticParams() {
  return Object.keys(staticDestinations).map((slug) => ({ slug }))
}

async function getDestinationData(slug: string) {
  try {
    const dest = await prisma.destination.findUnique({ where: { slug } })
    if (dest) return dest
  } catch {}
  return staticDestinations[slug] ?? null
}

const otherDestinations = Object.entries(staticDestinations)

export default async function DestinationDetailPage({ params }: PageProps) {
  const dest = await getDestinationData(params.slug)
  if (!dest) notFound()

  const d = dest as any

  return (
    <main className="pt-20">
      {/* Hero */}
      <section className="bg-gradient-to-br from-amber-900 via-orange-800 to-amber-700 py-20 md:py-28 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: 'radial-gradient(ellipse at bottom left, white, transparent 60%)' }}
          aria-hidden="true"
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-7xl block mb-4" aria-hidden="true">{d.emoji}</span>
          <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-4">
            {d.name}
          </h1>
          <p className="text-amber-200 text-base mb-4">📍 {d.location}</p>
          <p className="text-amber-100 text-lg sm:text-xl max-w-2xl mx-auto leading-relaxed">
            {d.description}
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* About */}
            <section aria-labelledby="dest-about">
              <h2 id="dest-about" className="font-serif text-2xl font-bold text-stone-900 mb-4">
                About This Destination
              </h2>
              <p className="text-stone-600 leading-relaxed text-base">{d.longDescription ?? d.description}</p>
            </section>

            {/* Atmosphere */}
            {d.atmosphere?.length > 0 && (
              <section aria-labelledby="dest-atmosphere">
                <h2 id="dest-atmosphere" className="font-serif text-2xl font-bold text-stone-900 mb-5">
                  The Atmosphere
                </h2>
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {d.atmosphere.map((item: string) => (
                      <li key={item} className="flex items-center gap-3 text-stone-700 font-medium">
                        <span className="text-xl flex-shrink-0" aria-hidden="true">
                          {item.split(' ')[0]}
                        </span>
                        <span>{item.split(' ').slice(1).join(' ')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* Activities */}
            {d.activities?.length > 0 && (
              <section aria-labelledby="dest-activities">
                <h2 id="dest-activities" className="font-serif text-2xl font-bold text-stone-900 mb-5">
                  Activities &amp; Things To Do
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {d.activities.map((act: string) => (
                    <div
                      key={act}
                      className="bg-white border border-stone-200 rounded-xl p-4 text-center shadow-sm hover:border-amber-300 hover:shadow-md transition-all duration-200"
                    >
                      <span className="text-stone-700 text-sm font-medium">{act}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Highlights */}
            {d.highlights?.length > 0 && (
              <section aria-labelledby="dest-highlights">
                <h2 id="dest-highlights" className="font-serif text-2xl font-bold text-stone-900 mb-5">
                  Why We Love This Spot
                </h2>
                <ul className="space-y-3">
                  {d.highlights.map((h: string) => (
                    <li key={h} className="flex items-center gap-3 text-stone-700">
                      <span className="text-amber-500 font-bold flex-shrink-0" aria-hidden="true">★</span>
                      {h}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* What to Expect */}
            <section aria-labelledby="what-to-expect">
              <h2 id="what-to-expect" className="font-serif text-2xl font-bold text-stone-900 mb-5">
                What to Expect
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { icon: '🚗', title: 'Drive Your Car', desc: 'You never drive the RV. Just drive your own car to the campground.' },
                  { icon: '🏕️', title: 'RV Pre-Setup', desc: 'The RV is fully setup, stocked, and ready when you arrive.' },
                  { icon: '💳', title: 'Pay Campground Directly', desc: 'Campground fees are paid directly to the site — not included in booking.' },
                  { icon: '📞', title: 'Our Team Support', desc: 'We\'re available throughout your stay if anything comes up.' },
                ].map((item) => (
                  <div key={item.title} className="bg-white border border-stone-200 rounded-xl p-5 flex gap-4 shadow-sm">
                    <span className="text-3xl flex-shrink-0" aria-hidden="true">{item.icon}</span>
                    <div>
                      <h3 className="font-semibold text-stone-900 mb-1 text-sm">{item.title}</h3>
                      <p className="text-stone-500 text-xs leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Booking Card */}
              <div className="bg-white border-2 border-amber-200 rounded-2xl p-6 shadow-lg">
                <h3 className="font-serif text-xl font-bold text-stone-900 mb-4">
                  Book at This Destination
                </h3>

                {/* Campground Fee */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5">
                  <p className="text-xs font-semibold text-amber-700 uppercase tracking-wide mb-1">
                    Campground Fee Estimate
                  </p>
                  <p className="text-stone-900 font-bold text-lg">
                    {d.campgroundFeeEstimate}
                  </p>
                  <p className="text-stone-500 text-xs mt-1 leading-relaxed">
                    {d.campgroundFeeNote ?? 'Paid directly to campground on arrival.'}
                  </p>
                </div>

                {/* Hookup Badge */}
                <div className="mb-5">
                  <span
                    className={`badge text-xs ${
                      d.hookupAvailable
                        ? 'bg-green-100 text-green-700'
                        : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {d.hookupAvailable ? '✓ Full hookups available' : 'Dry camping / no hookups'}
                  </span>
                </div>

                <Link
                  href={`/book?destination=${params.slug}`}
                  className="block w-full text-center py-4 px-6 rounded-full bg-amber-600 hover:bg-amber-700 text-white font-bold text-base shadow hover:shadow-lg hover:scale-105 transition-all duration-200 mb-3"
                >
                  Book at {d.name.split('/')[0].trim()}
                </Link>
                <Link
                  href="/contact"
                  className="block w-full text-center py-3 px-6 rounded-full border-2 border-stone-200 text-stone-600 font-medium text-sm hover:border-amber-300 hover:text-amber-700 transition-all duration-200"
                >
                  Ask a Question
                </Link>

                <p className="text-stone-400 text-xs text-center mt-4 leading-relaxed">
                  Campground fees paid directly to campground. Not included in booking total.
                </p>
              </div>

              {/* Other Destinations */}
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
                <h3 className="font-semibold text-stone-900 text-sm mb-3 uppercase tracking-wide">
                  Other Destinations
                </h3>
                <div className="space-y-2">
                  {otherDestinations
                    .filter(([s]) => s !== params.slug)
                    .map(([s, data]) => (
                      <Link
                        key={s}
                        href={`/destinations/${s}`}
                        className="flex items-center gap-2 text-sm text-stone-600 hover:text-amber-700 transition-colors py-1"
                      >
                        <span aria-hidden="true">{data.emoji}</span>
                        <span>{data.name}</span>
                      </Link>
                    ))}
                </div>
              </div>

              {/* Browse RVs */}
              <div className="bg-white border border-stone-200 rounded-xl p-5 text-center">
                <p className="text-stone-500 text-sm mb-3">
                  Which RV is right for this destination?
                </p>
                <Link
                  href="/rvs"
                  className="inline-block text-amber-600 hover:text-amber-700 font-semibold text-sm underline underline-offset-2"
                >
                  Browse RV Experiences →
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
