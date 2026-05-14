import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerAuthSession, isAdmin } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import { Edit, Power, PowerOff, BarChart2 } from 'lucide-react'

export default async function AdminRVsPage() {
  const session = await getServerAuthSession()
  if (!session || !isAdmin(session)) {
    redirect('/login')
  }

  const rvs = await prisma.rV.findMany({
    orderBy: { sortOrder: 'asc' },
    include: {
      priceRules: { where: { isActive: true }, orderBy: { startDate: 'asc' } },
      _count: { select: { bookings: true } },
    },
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">RV Experiences</h1>
          <p className="text-stone-500 text-sm mt-1">{rvs.length} RV{rvs.length !== 1 ? 's' : ''} configured</p>
        </div>
      </div>

      {/* Info banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
        RVs are pre-seeded (Lunaris, Stellaris, Solaris). Use the edit page to manage pricing, amenities, and availability.
      </div>

      {/* RV Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {rvs.map((rv) => (
          <div
            key={rv.id}
            className={`bg-white border rounded-xl overflow-hidden shadow-sm transition-shadow hover:shadow-md ${
              rv.isActive ? 'border-stone-200' : 'border-stone-200 opacity-70'
            }`}
          >
            {/* Card header */}
            <div className="bg-gradient-to-r from-amber-50 to-amber-100 px-5 py-4 border-b border-amber-200">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">{rv.emoji}</span>
                    <div>
                      <h3 className="font-bold text-stone-900">{rv.name}</h3>
                      <p className="text-xs text-stone-500">{rv.tagline}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      rv.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-stone-100 text-stone-500'
                    }`}
                  >
                    {rv.isActive ? <Power size={10} /> : <PowerOff size={10} />}
                    {rv.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>

            {/* Card body */}
            <div className="px-5 py-4 space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-stone-50 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-stone-400 mb-1">
                    <BarChart2 size={13} />
                    <span className="text-xs">Total Bookings</span>
                  </div>
                  <p className="text-xl font-bold text-stone-900">{rv._count.bookings}</p>
                </div>
                <div className="bg-stone-50 rounded-lg p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-stone-400 mb-1">
                    <span className="text-xs">Max Guests</span>
                  </div>
                  <p className="text-xl font-bold text-stone-900">{rv.maxGuests}</p>
                </div>
              </div>

              {/* Pricing rules summary */}
              <div>
                <p className="text-xs font-medium text-stone-500 mb-2">Active Pricing Rules ({rv.priceRules.length})</p>
                {rv.priceRules.length === 0 ? (
                  <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg">
                    No active pricing rules — add pricing to accept bookings
                  </p>
                ) : (
                  <div className="space-y-1.5">
                    {rv.priceRules.slice(0, 3).map((rule) => (
                      <div key={rule.id} className="flex items-center justify-between text-xs bg-stone-50 rounded-lg px-3 py-2">
                        <span className="font-medium text-stone-700">{rule.name}</span>
                        <span className="text-amber-600 font-medium">{formatCurrency(Number(rule.nightlyRate))}/night</span>
                      </div>
                    ))}
                    {rv.priceRules.length > 3 && (
                      <p className="text-xs text-stone-400 text-center">+{rv.priceRules.length - 3} more rules</p>
                    )}
                  </div>
                )}
              </div>

              {/* Amenities preview */}
              <div>
                <p className="text-xs font-medium text-stone-500 mb-2">Amenities</p>
                <div className="flex flex-wrap gap-1">
                  {rv.amenities.slice(0, 5).map((a, i) => (
                    <span key={i} className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                      {a}
                    </span>
                  ))}
                  {rv.amenities.length > 5 && (
                    <span className="text-xs bg-stone-100 text-stone-400 px-2 py-0.5 rounded-full">
                      +{rv.amenities.length - 5}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Card footer */}
            <div className="px-5 py-3 border-t border-stone-100 bg-stone-50 flex gap-2">
              <Link
                href={`/admin/rvs/${rv.id}`}
                className="flex-1 flex items-center justify-center gap-2 bg-stone-800 hover:bg-stone-900 text-white text-sm font-medium py-2 rounded-lg transition-colors"
              >
                <Edit size={14} />
                Edit & Manage
              </Link>
              <Link
                href={`/admin/pricing?rvId=${rv.id}`}
                className="flex items-center justify-center gap-1 px-3 py-2 border border-stone-200 text-stone-600 hover:bg-white text-sm rounded-lg transition-colors"
              >
                Pricing
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
