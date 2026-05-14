import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrendProps {
  value: number
  direction: 'up' | 'down'
}

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon?: LucideIcon
  trend?: TrendProps
  color?: 'amber' | 'green' | 'blue' | 'red' | 'purple'
}

const colorMap = {
  amber: { bg: 'bg-amber-50', icon: 'bg-amber-100 text-amber-700', border: 'border-amber-200' },
  green: { bg: 'bg-green-50', icon: 'bg-green-100 text-green-700', border: 'border-green-200' },
  blue: { bg: 'bg-blue-50', icon: 'bg-blue-100 text-blue-700', border: 'border-blue-200' },
  red: { bg: 'bg-red-50', icon: 'bg-red-100 text-red-700', border: 'border-red-200' },
  purple: { bg: 'bg-purple-50', icon: 'bg-purple-100 text-purple-700', border: 'border-purple-200' },
}

export default function StatCard({ title, value, subtitle, icon: Icon, trend, color = 'amber' }: StatCardProps) {
  const colors = colorMap[color]

  return (
    <div className={cn('rounded-xl border p-5 shadow-sm', colors.bg, colors.border)}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-stone-500 truncate">{title}</p>
          <p className="mt-1 text-2xl font-bold text-stone-900">{value}</p>
          {subtitle && <p className="mt-0.5 text-xs text-stone-500">{subtitle}</p>}
          {trend && (
            <p className={cn('mt-1 text-xs font-medium flex items-center gap-1', trend.direction === 'up' ? 'text-green-600' : 'text-red-600')}>
              <span>{trend.direction === 'up' ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}% vs last month</span>
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn('flex-shrink-0 ml-3 p-2.5 rounded-lg', colors.icon)}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
    </div>
  )
}
