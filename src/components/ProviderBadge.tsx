'use client'

import { Provider } from '@/lib/providers/registry'
import { cn, getInitials } from '@/lib/utils'

interface ProviderBadgeProps {
  provider: Provider
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
  className?: string
}

export function ProviderBadge({ provider, size = 'md', showName = false, className }: ProviderBadgeProps) {
  const sizes = {
    sm: 'w-6 h-6 text-[9px]',
    md: 'w-8 h-8 text-xs',
    lg: 'w-10 h-10 text-sm',
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        className={cn(
          'rounded-lg flex items-center justify-center font-bold text-white flex-shrink-0',
          sizes[size]
        )}
        style={{ backgroundColor: provider.color }}
      >
        {getInitials(provider.name)}
      </div>
      {showName && (
        <span className="text-sm font-medium text-gray-200">{provider.name}</span>
      )}
    </div>
  )
}
