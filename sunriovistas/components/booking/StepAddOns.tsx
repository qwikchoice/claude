import { cn, formatCurrency } from '@/lib/utils'

interface AddOnOption {
  id: string
  name: string
  slug: string
  description: string
  basePrice: number
  isActive: boolean
}

interface StepAddOnsProps {
  addOns: AddOnOption[]
  selectedAddOnIds: string[]
  checkIn: string | null
  onToggle: (addOnId: string) => void
}

export default function StepAddOns({
  addOns,
  selectedAddOnIds,
  checkIn,
  onToggle,
}: StepAddOnsProps) {
  const activeAddOns = addOns.filter((a) => a.isActive)
  const selectedTotal = activeAddOns
    .filter((a) => selectedAddOnIds.includes(a.id))
    .reduce((sum, a) => sum + a.basePrice, 0)

  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif text-2xl font-bold text-stone-900">
          Enhance Your Stay
        </h2>
        <p className="text-stone-500 mt-1 text-sm">
          Add optional experiences to make your glamping trip unforgettable.
        </p>
      </div>

      {activeAddOns.length === 0 ? (
        <div className="text-center py-12 text-stone-400">
          <p>No add-ons available for this stay.</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {activeAddOns.map((addOn) => {
              const isSelected = selectedAddOnIds.includes(addOn.id)
              return (
                <button
                  key={addOn.id}
                  type="button"
                  onClick={() => onToggle(addOn.id)}
                  className={cn(
                    'relative text-left rounded-2xl border-2 p-5 transition-all duration-200 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-amber-400',
                    isSelected
                      ? 'border-amber-500 bg-amber-50 shadow-md'
                      : 'border-stone-200 bg-white hover:border-amber-300'
                  )}
                >
                  {/* Checkbox indicator */}
                  <div className="absolute top-4 right-4">
                    <div
                      className={cn(
                        'w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all',
                        isSelected
                          ? 'bg-amber-500 border-amber-500'
                          : 'border-stone-300 bg-white'
                      )}
                    >
                      {isSelected && (
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
                      )}
                    </div>
                  </div>

                  {/* Name */}
                  <h3
                    className={cn(
                      'font-semibold text-base leading-tight pr-8',
                      isSelected ? 'text-amber-800' : 'text-stone-900'
                    )}
                  >
                    {addOn.name}
                  </h3>

                  {/* Description */}
                  <p className="text-stone-500 text-sm mt-2 leading-relaxed line-clamp-3">
                    {addOn.description}
                  </p>

                  {/* Price */}
                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className={cn(
                        'font-bold text-lg',
                        isSelected ? 'text-amber-700' : 'text-stone-800'
                      )}
                    >
                      {formatCurrency(addOn.basePrice)}
                    </span>
                    <span
                      className={cn(
                        'text-xs font-medium px-2.5 py-1 rounded-full border',
                        isSelected
                          ? 'bg-amber-100 text-amber-700 border-amber-200'
                          : 'bg-stone-100 text-stone-500 border-stone-200'
                      )}
                    >
                      {isSelected ? 'Added' : 'Add'}
                    </span>
                  </div>
                </button>
              )
            })}
          </div>

          {/* "No add-ons needed" note */}
          <div className="mt-4 flex items-center gap-2 text-sm text-stone-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            No add-ons needed? That&apos;s totally fine — just continue.
          </div>

          {/* Selected total */}
          {selectedAddOnIds.length > 0 && (
            <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-stone-700">
                  {selectedAddOnIds.length} add-on{selectedAddOnIds.length !== 1 ? 's' : ''} selected
                </p>
              </div>
              <p className="text-lg font-bold text-amber-700">
                +{formatCurrency(selectedTotal)}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
