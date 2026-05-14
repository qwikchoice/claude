import { cn, formatCurrency, CAMPGROUND_FEE_DISCLAIMER } from '@/lib/utils'
import type { PriceBreakdownPublic } from '@/types'

interface PriceSummaryProps {
  breakdown: PriceBreakdownPublic
  showDisclaimer?: boolean
  compact?: boolean
}

export default function PriceSummary({
  breakdown,
  showDisclaimer = false,
  compact = false,
}: PriceSummaryProps) {
  return (
    <div className={cn('bg-amber-50 border border-amber-200 rounded-xl', compact ? 'p-4' : 'p-6')}>
      {!compact && (
        <h3 className="font-serif font-bold text-stone-900 text-lg mb-4">
          Price Breakdown
        </h3>
      )}

      <div className="space-y-2">
        {/* Nightly subtotal */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-stone-600">
            {formatCurrency(breakdown.nightlyRate)} × {breakdown.nights} night
            {breakdown.nights !== 1 ? 's' : ''}
          </span>
          <span className="font-medium text-stone-800">
            {formatCurrency(breakdown.subtotal)}
          </span>
        </div>

        {/* Cleaning fee */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-stone-600">Cleaning fee</span>
          <span className="font-medium text-stone-800">
            {formatCurrency(breakdown.cleaningFee)}
          </span>
        </div>

        {/* Add-ons */}
        {breakdown.addOnTotal > 0 && (
          <>
            {breakdown.lineItems
              .filter((item) => item.type === 'addon')
              .map((item, i) => (
                <div key={i} className="flex justify-between items-center text-sm">
                  <span className="text-stone-600">{item.description}</span>
                  <span className="font-medium text-stone-800">
                    {formatCurrency(item.total)}
                  </span>
                </div>
              ))}
          </>
        )}

        {/* Deposit */}
        {breakdown.depositAmount > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-stone-600">
              Security deposit ({breakdown.depositPercent}%)
            </span>
            <span className="font-medium text-stone-800">
              {formatCurrency(breakdown.depositAmount)}
            </span>
          </div>
        )}

        {/* Tax */}
        {breakdown.taxAmount > 0 && (
          <div className="flex justify-between items-center text-sm">
            <span className="text-stone-600">
              Tax ({breakdown.taxPercent}%)
            </span>
            <span className="font-medium text-stone-800">
              {formatCurrency(breakdown.taxAmount)}
            </span>
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-amber-300 pt-3 mt-3">
          <div className="flex justify-between items-center">
            <span className={cn('font-bold text-stone-900', compact ? 'text-base' : 'text-lg')}>
              Total
            </span>
            <span
              className={cn(
                'font-bold text-amber-700',
                compact ? 'text-lg' : 'text-2xl'
              )}
            >
              {formatCurrency(breakdown.total)}
            </span>
          </div>
        </div>
      </div>

      {/* Campground fee disclaimer */}
      {showDisclaimer && (
        <div className="mt-4 bg-amber-100 border border-amber-200 rounded-lg p-3">
          <p className="text-xs text-amber-800 leading-relaxed">
            <span className="font-semibold">Note: </span>
            {CAMPGROUND_FEE_DISCLAIMER}
          </p>
        </div>
      )}
    </div>
  )
}
