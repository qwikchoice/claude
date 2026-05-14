import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import BookingWizard from '@/components/booking/BookingWizard'

export const metadata: Metadata = {
  title: 'Book Your Glamping Experience | SunRioVistas',
  description:
    'Reserve your luxury stationary RV glamping experience near Folsom Lake. Choose your RV, destination, and dates.',
}

interface BookPageProps {
  searchParams: { rv?: string; destination?: string }
}

export default async function BookPage({ searchParams }: BookPageProps) {
  // Fetch active RVs with priceRules
  const rvs = await prisma.rV.findMany({
    where: { isActive: true },
    include: { priceRules: { where: { isActive: true } } },
    orderBy: { sortOrder: 'asc' },
  })

  // Fetch active destinations
  const destinations = await prisma.destination.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  })

  // Fetch active add-ons with priceRules
  const addOns = await prisma.addOn.findMany({
    where: { isActive: true },
    include: { priceRules: { where: { isActive: true } } },
    orderBy: { sortOrder: 'asc' },
  })

  // Fetch active terms document
  const termsDoc = await prisma.termsDocument.findFirst({
    where: { isActive: true },
    orderBy: { createdAt: 'desc' },
  })

  const termsUrl = termsDoc?.url ?? '/terms'
  const termsVersion = termsDoc?.version ?? '1.0'

  return (
    <div className="min-h-screen bg-amber-50">
      {/* Header */}
      <div className="bg-white border-b border-amber-100">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌄</span>
            <div>
              <h1 className="font-serif text-2xl font-bold text-stone-900">
                Book Your Glamping Experience
              </h1>
              <p className="text-stone-500 text-sm mt-0.5">
                Luxury stationary RV glamping near Folsom Lake, Northern California
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* How Booking Works callout */}
        <div className="bg-white border border-amber-200 rounded-2xl p-5 mb-8">
          <h2 className="text-sm font-semibold text-stone-700 mb-4 uppercase tracking-wide">
            How Booking Works
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              {
                step: '1',
                label: 'Submit Request',
                desc: 'Fill out the booking form below',
                icon: '📋',
              },
              {
                step: '2',
                label: 'Admin Review',
                desc: 'We review within 1–2 business days',
                icon: '👀',
              },
              {
                step: '3',
                label: 'Payment Link',
                desc: 'Receive a secure Stripe payment link',
                icon: '💳',
              },
              {
                step: '4',
                label: 'Confirmed!',
                desc: 'Pay and your booking is confirmed',
                icon: '✅',
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="text-2xl mb-2">{item.icon}</div>
                <div className="text-xs font-semibold text-amber-700 mb-0.5 uppercase tracking-wide">
                  Step {item.step}
                </div>
                <div className="text-sm font-medium text-stone-800">{item.label}</div>
                <div className="text-xs text-stone-400 mt-1 leading-relaxed">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Wizard */}
        <BookingWizard
          initialRvSlug={searchParams.rv}
          initialDestinationSlug={searchParams.destination}
          rvs={rvs.map((rv) => ({
            id: rv.id,
            name: rv.name,
            slug: rv.slug,
            tagline: rv.tagline,
            emoji: rv.emoji,
            maxGuests: rv.maxGuests,
            isActive: rv.isActive,
          }))}
          destinations={destinations.map((d) => ({
            id: d.id,
            name: d.name,
            slug: d.slug,
            emoji: d.emoji,
            campgroundFeeEstimate: d.campgroundFeeEstimate,
            isActive: d.isActive,
          }))}
          addOns={addOns.map((a) => ({
            id: a.id,
            name: a.name,
            slug: a.slug,
            description: a.description,
            basePrice: Number(a.basePrice),
            isActive: a.isActive,
          }))}
          termsUrl={termsUrl}
          termsVersion={termsVersion}
        />
      </div>
    </div>
  )
}
