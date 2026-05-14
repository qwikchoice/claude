import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import prisma from '@/lib/prisma'

interface PageProps {
  params: { slug: string }
}

// Static RV data for fallback / generateStaticParams
const staticRVData: Record<
  string,
  {
    name: string
    emoji: string
    tagline: string
    description: string
    longDescription: string
    bestFor: string[]
    vibe: string[]
    maxGuests: number
    amenities: string[]
    colorScheme: string
  }
> = {
  lunaris: {
    name: 'Lunaris',
    emoji: '🌙',
    tagline: 'Cozy Couples & Family-Friendly Getaways',
    description:
      'A warm retreat where lake mornings meet campfire evenings. Perfect for families making memories and couples seeking relaxed togetherness.',
    longDescription:
      'Lunaris is our warmest, most family-ready RV experience. With a cozy aesthetic inspired by lakeside cabins, Lunaris wraps you in comfort the moment you step inside. Soft lighting, warm wood tones, and thoughtful family-friendly touches make it the perfect home base for lake adventures, campfire stories, and slow mornings with coffee.',
    bestFor: ['Couples', 'Small Families', 'First-Time Glampers', 'Beginners'],
    vibe: [
      '🔥 Campfire nights',
      '🌅 Lakeside mornings',
      '🛋️ Cozy interiors',
      '👨‍👩‍👧 Family memories',
      '☕ Morning coffee rituals',
    ],
    maxGuests: 6,
    amenities: [
      'Full kitchen with cookware',
      'Queen bed + bunk beds',
      'Private bathroom',
      'Outdoor seating & picnic table',
      'Campfire setup',
      'Bluetooth speaker',
      'Board games & books',
      'Linens & towels provided',
      'Climate control (A/C + heat)',
      'USB charging stations',
    ],
    colorScheme: 'amber',
  },
  stellaris: {
    name: 'Stellaris',
    emoji: '✨',
    tagline: 'Spiritual & Soulful Journeys',
    description:
      'A healing sanctuary designed for intentional living. Breathe deep, unplug, and reconnect with what matters most.',
    longDescription:
      'Stellaris is more than an RV — it is a mobile retreat designed for those who seek stillness. Carefully curated wellness touches, a designated meditation corner, yoga mats, and calming aromatherapy make this RV feel like a spa in the woods. Leave your screens behind and reconnect with nature, yourself, and the people you love.',
    bestFor: ['Wellness Travelers', 'Couples Retreats', 'Solo Travelers', 'Digital Detox'],
    vibe: [
      '🧘 Meditation & yoga',
      '🌿 Digital detox',
      '🌸 Nature healing',
      '☕ Slow mornings',
      '🌙 Stargazing nights',
    ],
    maxGuests: 4,
    amenities: [
      'King bed with premium linens',
      'Yoga mats & meditation cushions',
      'Essential oil diffuser',
      'Herbal tea & coffee station',
      'Nature sound system',
      'Journaling supplies',
      'Private bathroom',
      'Soft ambient lighting',
      'Climate control',
      'Blackout curtains for deep sleep',
    ],
    colorScheme: 'purple',
  },
  solaris: {
    name: 'Solaris',
    emoji: '☀️',
    tagline: 'For Free Spirits & Young Explorers',
    description:
      "Life's too short for boring weekends. Pack your friends, pour the wine, and make stories worth telling.",
    longDescription:
      "Solaris is built for the adventurous soul. Whether you're wine-tasting through Harvest Hosts vineyards, exploring Auburn's Gold Country, or simply soaking in the scenery with friends, Solaris sets the stage for unforgettable weekends. Social seating, string lights, and a vibrant energy make every night feel like a celebration.",
    bestFor: ['Young Couples', 'Friend Groups', 'Adventurers', 'Wine Lovers'],
    vibe: [
      '🍷 Wine-country sunsets',
      '🏕️ Scenic escapes',
      '🎉 Social weekends',
      '🗺️ Exploration',
      '🌅 Golden hour magic',
    ],
    maxGuests: 6,
    amenities: [
      'Social lounge seating',
      'Queen bed + pull-out sofa',
      'Wine glasses & opener',
      'Outdoor string lights',
      'Bluetooth party speaker',
      'Full kitchen',
      'Private bathroom',
      'Outdoor BBQ grill',
      'Adventure gear storage',
      'Climate control',
    ],
    colorScheme: 'orange',
  },
}

const colorMap: Record<string, { gradient: string; light: string; badge: string; cta: string; text: string }> = {
  amber: {
    gradient: 'from-amber-600 to-orange-600',
    light: 'bg-amber-50',
    badge: 'bg-amber-100 text-amber-800',
    cta: 'bg-amber-600 hover:bg-amber-700',
    text: 'text-amber-700',
  },
  purple: {
    gradient: 'from-purple-600 to-violet-600',
    light: 'bg-purple-50',
    badge: 'bg-purple-100 text-purple-800',
    cta: 'bg-purple-600 hover:bg-purple-700',
    text: 'text-purple-700',
  },
  orange: {
    gradient: 'from-orange-500 to-amber-500',
    light: 'bg-orange-50',
    badge: 'bg-orange-100 text-orange-800',
    cta: 'bg-orange-600 hover:bg-orange-700',
    text: 'text-orange-700',
  },
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const slug = params.slug
  const staticData = staticRVData[slug]
  const name = staticData?.name ?? slug

  try {
    const rv = await prisma.rV.findUnique({ where: { slug } })
    if (rv) {
      return {
        title: `${rv.emoji} ${rv.name} — ${rv.tagline} | SunRioVistas`,
        description: `${rv.description} Book the ${rv.name} luxury glamping experience near Folsom Lake. No driving required — just arrive in your own car.`,
      }
    }
  } catch {}

  return {
    title: staticData
      ? `${staticData.emoji} ${name} — ${staticData.tagline} | SunRioVistas`
      : `${name} | SunRioVistas`,
    description: staticData
      ? `${staticData.description} Book this luxury glamping experience near Folsom Lake. No driving required.`
      : `Luxury RV glamping experience near Folsom Lake, Northern California.`,
  }
}

export function generateStaticParams() {
  return Object.keys(staticRVData).map((slug) => ({ slug }))
}

async function getRVData(slug: string) {
  try {
    const rv = await prisma.rV.findUnique({
      where: { slug },
      include: { priceRules: { where: { isActive: true }, take: 1 } },
    })
    if (rv) return rv
  } catch {}

  // Fallback to static
  const staticData = staticRVData[slug]
  if (!staticData) return null
  return { slug, ...staticData }
}

const staticAddOns = [
  { name: 'Late Checkout (11am → 1pm)', basePrice: 40 },
  { name: 'Early Arrival Setup', basePrice: 35 },
  { name: 'Welcome Charcuterie Board', basePrice: 55 },
  { name: 'Birthday/Anniversary Decor', basePrice: 45 },
  { name: 'S\'mores Kit', basePrice: 20 },
]

export default async function RVDetailPage({ params }: PageProps) {
  const rv = await getRVData(params.slug)
  if (!rv) notFound()

  const colors = colorMap[(rv as any).colorScheme ?? 'amber'] ?? colorMap.amber
  const name = (rv as any).name ?? ''
  const emoji = (rv as any).emoji ?? '⛺'
  const tagline = (rv as any).tagline ?? ''
  const description = (rv as any).description ?? ''
  const longDescription = (rv as any).longDescription ?? description
  const bestFor: string[] = (rv as any).bestFor ?? []
  const vibe: string[] = (rv as any).vibe ?? []
  const amenities: string[] = (rv as any).amenities ?? []
  const maxGuests = (rv as any).maxGuests ?? 4

  return (
    <main className="pt-20">
      {/* Hero Header */}
      <section className={`bg-gradient-to-br ${colors.gradient} py-20 md:py-28 relative overflow-hidden`}>
        <div
          className="absolute inset-0 opacity-20"
          style={{ background: 'radial-gradient(ellipse at top right, white, transparent 60%)' }}
          aria-hidden="true"
        />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-8xl block mb-4 animate-float" aria-hidden="true">{emoji}</span>
          <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold text-white mb-4">
            {name}
          </h1>
          <p className="text-white/80 text-xl sm:text-2xl max-w-2xl mx-auto mb-6">{tagline}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {bestFor.map((tag) => (
              <span key={tag} className="bg-white/20 border border-white/30 text-white text-sm px-4 py-1.5 rounded-full font-medium backdrop-blur-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Image Gallery Placeholder */}
            <section aria-label="Image gallery">
              <div className="grid grid-cols-2 gap-3">
                <div className={`${colors.light} rounded-2xl h-64 flex items-center justify-center col-span-2 lg:col-span-1`}>
                  <div className="text-center">
                    <span className="text-5xl block mb-2" aria-hidden="true">{emoji}</span>
                    <p className="text-stone-400 text-sm">Main photo</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 col-span-2 lg:col-span-1">
                  {[1, 2, 3, 4].map((n) => (
                    <div key={n} className="bg-stone-100 rounded-xl h-[7.5rem] flex items-center justify-center">
                      <span className="text-stone-300 text-xs">Photo {n + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Description */}
            <section aria-labelledby="rv-description">
              <h2 id="rv-description" className="font-serif text-2xl font-bold text-stone-900 mb-4">
                About {name}
              </h2>
              <p className="text-stone-600 leading-relaxed text-base">{longDescription}</p>
            </section>

            {/* The Vibe */}
            {vibe.length > 0 && (
              <section aria-labelledby="rv-vibe">
                <h2 id="rv-vibe" className="font-serif text-2xl font-bold text-stone-900 mb-5">
                  The {name} Vibe
                </h2>
                <div className={`${colors.light} rounded-2xl p-6`}>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {vibe.map((item) => (
                      <li key={item} className="flex items-center gap-3 text-stone-700 font-medium">
                        <span className="text-xl flex-shrink-0" aria-hidden="true">{item.split(' ')[0]}</span>
                        <span>{item.split(' ').slice(1).join(' ')}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            )}

            {/* Amenities */}
            <section aria-labelledby="rv-amenities">
              <h2 id="rv-amenities" className="font-serif text-2xl font-bold text-stone-900 mb-5">
                Full Amenities List
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {amenities.map((a) => (
                  <div key={a} className="flex items-center gap-3 bg-white border border-stone-100 rounded-lg px-4 py-3 shadow-sm">
                    <span className="text-amber-500 flex-shrink-0 font-bold" aria-hidden="true">✓</span>
                    <span className="text-stone-700 text-sm">{a}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* What's Included */}
            <section aria-labelledby="whats-included">
              <h2 id="whats-included" className="font-serif text-2xl font-bold text-stone-900 mb-5">
                What&apos;s Included
              </h2>
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <ul className="space-y-3">
                  {[
                    'RV pre-setup and ready on arrival',
                    'All linens and towels',
                    'Kitchen cookware and utensils',
                    'Welcome guide and local recommendations',
                    'Direct support from our team',
                    'Full RV breakdown after checkout',
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3 text-stone-700">
                      <span className="text-amber-600 font-bold flex-shrink-0" aria-hidden="true">✅</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Available Add-Ons */}
            <section aria-labelledby="add-ons">
              <h2 id="add-ons" className="font-serif text-2xl font-bold text-stone-900 mb-5">
                Available Add-Ons
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {staticAddOns.map((addon) => (
                  <div key={addon.name} className="bg-white border border-stone-200 rounded-xl p-4 flex items-center justify-between shadow-sm hover:border-amber-300 transition-colors">
                    <span className="text-stone-700 text-sm font-medium">{addon.name}</span>
                    <span className="text-amber-700 font-bold text-sm">+${addon.basePrice}</span>
                  </div>
                ))}
              </div>
              <p className="text-stone-400 text-xs mt-3">
                Add-on prices may vary. Mention your preferences in the booking request.
              </p>
            </section>

            {/* How It Works — mini */}
            <section aria-labelledby="how-it-works-mini">
              <h2 id="how-it-works-mini" className="font-serif text-2xl font-bold text-stone-900 mb-5">
                How It Works
              </h2>
              <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6">
                <p className="font-bold text-amber-900 text-base mb-4">
                  🚗 You NEVER drive this RV.
                </p>
                <ol className="space-y-3">
                  {[
                    'Submit your booking request with dates and destination',
                    'We review and manually approve your request',
                    'Receive a secure Stripe payment link by email',
                    'Drive YOUR car to the campground',
                    `The ${name} is fully setup and waiting for you`,
                  ].map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-stone-700 text-sm">
                      <span className="w-6 h-6 rounded-full bg-amber-600 text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Booking Card */}
              <div className="bg-white border-2 border-amber-200 rounded-2xl p-6 shadow-lg">
                <div className="text-center mb-5">
                  <span className="text-5xl block mb-2" aria-hidden="true">{emoji}</span>
                  <h3 className="font-serif text-2xl font-bold text-stone-900">{name}</h3>
                  <p className="text-stone-500 text-sm mt-1">Up to {maxGuests} guests</p>
                </div>

                <div className="bg-amber-50 rounded-xl p-4 mb-5 text-center">
                  <p className="text-amber-800 text-sm font-medium">
                    Rates vary by date and season
                  </p>
                  <p className="text-stone-500 text-xs mt-1">
                    Request a booking to see current pricing
                  </p>
                </div>

                <div className="space-y-2 mb-5 text-sm">
                  <div className="flex justify-between text-stone-600">
                    <span>Min stay</span>
                    <span className="font-medium text-stone-900">2 nights</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Cleaning fee</span>
                    <span className="font-medium text-stone-900">$60 (mandatory)</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>RV insurance</span>
                    <span className="font-semibold text-green-600">Not required</span>
                  </div>
                  <div className="flex justify-between text-stone-600">
                    <span>Mileage fees</span>
                    <span className="font-semibold text-green-600">None</span>
                  </div>
                </div>

                <Link
                  href={`/book?rv=${rv.slug}`}
                  className={`block w-full text-center py-4 px-6 rounded-full ${colors.cta} text-white font-bold text-base shadow hover:shadow-lg hover:scale-105 transition-all duration-200 mb-3`}
                >
                  Book {name}
                </Link>
                <Link
                  href="/contact"
                  className="block w-full text-center py-3 px-6 rounded-full border-2 border-stone-200 text-stone-600 font-medium text-sm hover:border-amber-300 hover:text-amber-700 transition-all duration-200"
                >
                  Ask a Question
                </Link>
              </div>

              {/* Best For */}
              <div className={`${colors.light} border border-stone-200 rounded-2xl p-5`}>
                <h3 className="font-semibold text-stone-900 mb-3 text-sm uppercase tracking-wide">
                  Best For
                </h3>
                <div className="flex flex-wrap gap-2">
                  {bestFor.map((tag) => (
                    <span key={tag} className={`badge ${colors.badge} text-xs`}>{tag}</span>
                  ))}
                </div>
              </div>

              {/* Campground Note */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4">
                <p className="text-stone-500 text-xs leading-relaxed">
                  <span className="font-semibold text-stone-700">Note:</span> Campground fees are
                  paid directly to the campground and are not included in your booking total.
                </p>
              </div>

              {/* Other RVs */}
              <div>
                <p className="text-xs font-semibold text-stone-400 uppercase tracking-wider mb-3">
                  Other Experiences
                </p>
                <div className="space-y-2">
                  {Object.entries(staticRVData)
                    .filter(([s]) => s !== params.slug)
                    .map(([s, d]) => (
                      <Link
                        key={s}
                        href={`/rvs/${s}`}
                        className="flex items-center gap-2 text-sm text-stone-600 hover:text-amber-700 transition-colors"
                      >
                        <span aria-hidden="true">{d.emoji}</span>
                        <span>{d.name} — {d.tagline.split(' ').slice(0, 4).join(' ')}…</span>
                      </Link>
                    ))}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  )
}
