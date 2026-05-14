import { cn } from '@/lib/utils'

interface RVOption {
  id: string
  name: string
  slug: string
  tagline: string
  emoji: string
  maxGuests: number
  isActive: boolean
}

interface StepRVProps {
  rvs: RVOption[]
  selectedRvId: string | null
  onSelect: (rv: RVOption) => void
}

export default function StepRV({ rvs, selectedRvId, onSelect }: StepRVProps) {
  const activeRVs = rvs.filter((rv) => rv.isActive)

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-2xl font-bold text-stone-900">
          Choose Your RV
        </h2>
        <p className="text-stone-500 mt-1 text-sm">
          Select the luxury RV that matches your glamping vision.
        </p>
      </div>

      {activeRVs.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <p>No RVs available at this time. Please check back soon.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {activeRVs.map((rv) => {
            const isSelected = selectedRvId === rv.id
            return (
              <button
                key={rv.id}
                type="button"
                onClick={() => onSelect(rv)}
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
                <div className="text-4xl mb-3">{rv.emoji}</div>

                {/* Name */}
                <h3
                  className={cn(
                    'font-serif font-bold text-lg leading-tight',
                    isSelected ? 'text-amber-800' : 'text-stone-900'
                  )}
                >
                  {rv.name}
                </h3>

                {/* Tagline */}
                <p className="text-stone-500 text-sm mt-1 leading-relaxed line-clamp-2">
                  {rv.tagline}
                </p>

                {/* Guests */}
                <div className="mt-4 flex items-center gap-1.5">
                  <svg
                    className="w-4 h-4 text-stone-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                  </svg>
                  <span className="text-xs text-stone-500">
                    Up to {rv.maxGuests} guests
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
