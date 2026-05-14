import { cn, CAMPGROUND_FEE_DISCLAIMER } from '@/lib/utils'

interface DestinationOption {
  id: string
  name: string
  slug: string
  emoji: string
  campgroundFeeEstimate: string | null
  isActive: boolean
}

interface StepDestinationProps {
  destinations: DestinationOption[]
  selectedDestinationId: string | null
  onSelect: (destination: DestinationOption) => void
}

export default function StepDestination({
  destinations,
  selectedDestinationId,
  onSelect,
}: StepDestinationProps) {
  const active = destinations.filter((d) => d.isActive)

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-2xl font-bold text-stone-900">
          Choose Your Destination
        </h2>
        <p className="text-stone-500 mt-1 text-sm">
          Select the campground or location you'd like to explore near Folsom Lake.
        </p>
      </div>

      {active.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <p>No destinations available at this time.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {active.map((dest) => {
            const isSelected = selectedDestinationId === dest.id
            return (
              <button
                key={dest.id}
                type="button"
                onClick={() => onSelect(dest)}
                className={cn(
                  'relative text-left rounded-2xl border-2 p-5 transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400',
                  isSelected
                    ? 'border-amber-500 bg-amber-50 shadow-md'
                    : 'border-stone-200 bg-white hover:border-amber-300'
                )}
              >
                {/* Selected checkmark */}
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-amber-500 rounded-full flex items-center justify-center">
                    <svg
                      className="w-3.5 h-3.5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                )}

                {/* Emoji */}
                <div className="text-4xl mb-3">{dest.emoji}</div>

                {/* Name */}
                <h3
                  className={cn(
                    'font-serif font-bold text-lg leading-tight',
                    isSelected ? 'text-amber-800' : 'text-stone-900'
                  )}
                >
                  {dest.name}
                </h3>

                {/* Campground fee estimate */}
                {dest.campgroundFeeEstimate && (
                  <div className="mt-3 inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-xs font-medium px-2.5 py-1 rounded-full">
                    <svg
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                      />
                    </svg>
                    Campground fee: ~{dest.campgroundFeeEstimate}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Disclaimer */}
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4">
        <div className="flex gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg
              className="w-4 h-4 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-semibold">Campground fee notice: </span>
            {CAMPGROUND_FEE_DISCLAIMER}
          </p>
        </div>
      </div>
    </div>
  )
}
