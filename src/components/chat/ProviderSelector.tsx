'use client'

import { useState } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import { TEXT_PROVIDERS, Provider } from '@/lib/providers/registry'
import { ProviderBadge } from '@/components/ProviderBadge'
import { cn } from '@/lib/utils'

interface ProviderSelectorProps {
  selectedProvider: string
  selectedModel: string
  onProviderChange: (providerId: string) => void
  onModelChange: (modelId: string) => void
}

export function ProviderSelector({
  selectedProvider,
  selectedModel,
  onProviderChange,
  onModelChange,
}: ProviderSelectorProps) {
  const [open, setOpen] = useState(false)
  const provider = TEXT_PROVIDERS.find(p => p.id === selectedProvider) ?? TEXT_PROVIDERS[0]
  const model = provider.models.find(m => m.id === selectedModel) ?? provider.models[0]

  const handleProviderSelect = (p: Provider) => {
    onProviderChange(p.id)
    onModelChange(p.models[0].id)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-2 transition-all text-left"
      >
        <ProviderBadge provider={provider} size="sm" />
        <div className="min-w-0">
          <p className="text-xs font-semibold text-white leading-none">{provider.name}</p>
          <p className="text-[10px] text-gray-400 mt-0.5 truncate max-w-[120px]">{model.name}</p>
        </div>
        <ChevronDown className={cn('w-3.5 h-3.5 text-gray-400 transition-transform flex-shrink-0', open && 'rotate-180')} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-72 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden">
            <div className="max-h-96 overflow-y-auto">
              {TEXT_PROVIDERS.map(p => (
                <div key={p.id}>
                  <button
                    onClick={() => handleProviderSelect(p)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-all',
                      p.id === selectedProvider && 'bg-white/5'
                    )}
                  >
                    <ProviderBadge provider={p} size="sm" />
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium text-white">{p.name}</p>
                      <p className="text-[10px] text-gray-500">{p.description}</p>
                    </div>
                    {p.id === selectedProvider && (
                      <Check className="w-3.5 h-3.5 text-violet-400 flex-shrink-0" />
                    )}
                  </button>

                  {p.id === selectedProvider && (
                    <div className="bg-black/30 px-3 py-1.5 border-t border-white/5">
                      <p className="text-[10px] text-gray-500 mb-1.5 uppercase tracking-wide">Modèle</p>
                      <div className="space-y-0.5">
                        {p.models.map(m => (
                          <button
                            key={m.id}
                            onClick={() => { onModelChange(m.id); setOpen(false) }}
                            className={cn(
                              'w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left transition-all hover:bg-white/5',
                              m.id === selectedModel && 'bg-violet-500/10'
                            )}
                          >
                            <span className={cn('text-xs', m.id === selectedModel ? 'text-violet-300' : 'text-gray-300')}>
                              {m.name}
                            </span>
                            {m.id === selectedModel && (
                              <Check className="w-3 h-3 text-violet-400" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
