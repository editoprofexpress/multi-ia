'use client'

import { useState, useEffect } from 'react'
import { Sparkles, Download, Copy, ChevronDown, Check, Wand2 } from 'lucide-react'
import { IMAGE_PROVIDERS, Provider } from '@/lib/providers/registry'
import { ProviderBadge } from '@/components/ProviderBadge'
import { useProvidersStore } from '@/stores/settings'
import { getMockImageUrl } from '@/lib/mock/responses'
import { cn } from '@/lib/utils'

const SIZES = ['1024x1024', '1792x1024', '1024x1792', '512x512']
const STYLES = ['Photorealiste', 'Illustration', 'Peinture', 'Anime', 'Concept art', '3D render', 'Sketch']

interface GeneratedImage {
  url: string
  prompt: string
  provider: string
  model: string
  size: string
  timestamp: Date
}

function ProviderPicker({ selected, onSelect }: { selected: Provider; onSelect: (p: Provider) => void }) {
  const [open, setOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState(selected.models[0].id)
  const { isAvailable, loaded } = useProvidersStore()

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-2 transition-all"
      >
        <ProviderBadge provider={selected} size="sm" />
        <div>
          <p className="text-xs font-semibold text-white">{selected.name}</p>
          <p className="text-[10px] text-gray-500">{selected.models.find(m => m.id === selectedModel)?.name}</p>
        </div>
        <ChevronDown className={cn('w-3.5 h-3.5 text-gray-400 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 w-64 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-20 overflow-hidden max-h-96 overflow-y-auto">
            {IMAGE_PROVIDERS.map(p => (
              <button
                key={p.id}
                onClick={() => { onSelect(p); setSelectedModel(p.models[0].id); setOpen(false) }}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-all',
                  p.id === selected.id && 'bg-white/5'
                )}
              >
                <ProviderBadge provider={p} size="sm" />
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-white">{p.name}</p>
                  <p className="text-[10px] text-gray-500">{p.description}</p>
                </div>
                {loaded && isAvailable(p.id) && (
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                )}
                {p.id === selected.id && <Check className="w-3.5 h-3.5 text-violet-400" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function ImagePage() {
  const [prompt, setPrompt] = useState('')
  const [negativePrompt, setNegativePrompt] = useState('')
  const [selectedProvider, setSelectedProvider] = useState(IMAGE_PROVIDERS[0])
  const [selectedModel, setSelectedModel] = useState(IMAGE_PROVIDERS[0].models[0].id)
  const [selectedSize, setSelectedSize] = useState(SIZES[0])
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null)
  const [count, setCount] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)
  const [images, setImages] = useState<GeneratedImage[]>([])
  const { isAvailable, fetchProviders, loaded } = useProvidersStore()

  useEffect(() => {
    if (!loaded) fetchProviders()
  }, [loaded, fetchProviders])

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return
    setIsGenerating(true)

    const fullPrompt = selectedStyle ? `${prompt.trim()}, style ${selectedStyle}` : prompt.trim()
    const providerReady = isAvailable(selectedProvider.id)

    if (!providerReady) {
      // Demo mode
      await new Promise(r => setTimeout(r, 1500 + Math.random() * 1000))
      const newImages: GeneratedImage[] = Array.from({ length: count }, () => ({
        url: getMockImageUrl(),
        prompt: fullPrompt,
        provider: selectedProvider.name,
        model: selectedModel,
        size: selectedSize,
        timestamp: new Date(),
      }))
      setImages(prev => [...newImages, ...prev])
    } else {
      try {
        const res = await fetch('/api/image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: selectedProvider.id,
            model: selectedModel,
            prompt: fullPrompt,
            negativePrompt: negativePrompt || undefined,
            size: selectedSize,
            count,
          }),
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }))
          throw new Error(err.error || `Erreur ${res.status}`)
        }

        const data = await res.json()
        const newImages: GeneratedImage[] = (data.images || []).map((img: { url?: string; b64?: string }) => ({
          url: img.url || (img.b64 ? `data:image/png;base64,${img.b64}` : getMockImageUrl()),
          prompt: fullPrompt,
          provider: selectedProvider.name,
          model: selectedModel,
          size: selectedSize,
          timestamp: new Date(),
        }))
        setImages(prev => [...newImages, ...prev])
      } catch (err) {
        console.error('Image generation error:', err)
      }
    }

    setIsGenerating(false)
  }

  return (
    <div className="flex h-screen">
      {/* Left panel - controls */}
      <div className="w-72 flex-shrink-0 bg-[#111] border-r border-white/5 flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-white/5">
          <h1 className="text-sm font-bold text-white">Generation d'images</h1>
          <p className="text-xs text-gray-500 mt-0.5">9 providers disponibles</p>
        </div>

        <div className="p-4 space-y-5 flex-1">
          {/* Provider */}
          <div>
            <label className="text-xs text-gray-500 mb-2 block uppercase tracking-wide">Provider</label>
            <ProviderPicker selected={selectedProvider} onSelect={p => { setSelectedProvider(p); setSelectedModel(p.models[0].id) }} />
          </div>

          {/* Model */}
          <div>
            <label className="text-xs text-gray-500 mb-2 block uppercase tracking-wide">Modele</label>
            <div className="space-y-1">
              {selectedProvider.models.map(m => (
                <button
                  key={m.id}
                  onClick={() => setSelectedModel(m.id)}
                  className={cn(
                    'w-full flex items-start gap-2 px-3 py-2 rounded-lg border text-left transition-all',
                    m.id === selectedModel
                      ? 'bg-violet-500/10 border-violet-500/30 text-white'
                      : 'border-white/5 text-gray-400 hover:bg-white/5 hover:text-white'
                  )}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{m.name}</p>
                    {m.description && <p className="text-[10px] text-gray-600 mt-0.5">{m.description}</p>}
                  </div>
                  {m.id === selectedModel && <Check className="w-3 h-3 text-violet-400 mt-0.5 flex-shrink-0" />}
                </button>
              ))}
            </div>
          </div>

          {/* Size */}
          <div>
            <label className="text-xs text-gray-500 mb-2 block uppercase tracking-wide">Format</label>
            <div className="grid grid-cols-2 gap-1.5">
              {SIZES.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedSize(s)}
                  className={cn(
                    'text-xs py-1.5 rounded-lg border transition-all',
                    s === selectedSize
                      ? 'bg-violet-500/10 border-violet-500/30 text-white'
                      : 'border-white/5 text-gray-500 hover:text-white hover:border-white/10'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Style */}
          <div>
            <label className="text-xs text-gray-500 mb-2 block uppercase tracking-wide">Style</label>
            <div className="flex flex-wrap gap-1.5">
              {STYLES.map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedStyle(s === selectedStyle ? null : s)}
                  className={cn(
                    'text-xs px-2.5 py-1 rounded-full border transition-all',
                    s === selectedStyle
                      ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                      : 'border-white/5 text-gray-500 hover:text-white hover:border-white/10'
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Count */}
          <div>
            <label className="text-xs text-gray-500 mb-2 block uppercase tracking-wide">Nombre d'images</label>
            <div className="flex gap-1.5">
              {[1, 2, 4].map(n => (
                <button
                  key={n}
                  onClick={() => setCount(n)}
                  className={cn(
                    'flex-1 text-xs py-1.5 rounded-lg border transition-all',
                    n === count
                      ? 'bg-violet-500/10 border-violet-500/30 text-white'
                      : 'border-white/5 text-gray-500 hover:text-white'
                  )}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Demo badge */}
        {loaded && !isAvailable(selectedProvider.id) && (
          <div className="px-4 py-2 bg-amber-500/5 border-b border-amber-500/20 text-center">
            <span className="text-xs text-amber-400">Mode demo — resultats simules</span>
          </div>
        )}

        {/* Prompt area */}
        <div className="p-4 border-b border-white/5 space-y-3">
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 focus-within:border-violet-500/50 transition-all">
            <textarea
              value={prompt}
              onChange={e => setPrompt(e.target.value)}
              placeholder="Decrivez l'image que vous souhaitez generer... Ex : Un dragon volant au-dessus d'une foret enchantee au coucher du soleil"
              className="w-full bg-transparent text-sm text-white placeholder-gray-600 resize-none focus:outline-none min-h-[72px]"
              rows={3}
            />
          </div>
          <div className="flex gap-3 items-start">
            <input
              value={negativePrompt}
              onChange={e => setNegativePrompt(e.target.value)}
              placeholder="Negatif (ce que vous ne voulez pas)"
              className="flex-1 bg-white/5 border border-white/5 rounded-lg px-3 py-2 text-xs text-gray-400 placeholder-gray-700 focus:outline-none focus:border-white/20 transition-all"
            />
            <button
              onClick={handleGenerate}
              disabled={!prompt.trim() || isGenerating}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed px-5 py-2 rounded-lg text-sm font-medium text-white transition-all flex-shrink-0"
            >
              {isGenerating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Generation...
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  Generer
                </>
              )}
            </button>
          </div>
        </div>

        {/* Images grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {images.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500/20 to-violet-500/20 border border-white/10 rounded-2xl flex items-center justify-center mb-4">
                <Sparkles className="w-7 h-7 text-pink-400" />
              </div>
              <h2 className="text-base font-semibold text-white mb-1">Pret a generer</h2>
              <p className="text-sm text-gray-500 max-w-sm">
                Decrivez votre image ci-dessus et cliquez sur Generer.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {isGenerating && Array.from({ length: count }).map((_, i) => (
                <div key={`loading-${i}`} className="aspect-square bg-white/5 border border-white/10 rounded-xl animate-pulse flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-violet-500/30 border-t-violet-500 rounded-full animate-spin" />
                </div>
              ))}
              {images.map((img, i) => (
                <div key={i} className="group relative aspect-square bg-black rounded-xl overflow-hidden border border-white/10">
                  <img src={img.url} alt={img.prompt} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex flex-col justify-between p-3">
                    <p className="text-xs text-white line-clamp-3">{img.prompt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-gray-400">{img.provider} - {img.size}</span>
                      <div className="flex gap-1.5">
                        <button className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all">
                          <Copy className="w-3 h-3 text-white" />
                        </button>
                        <a href={img.url} download className="w-7 h-7 bg-white/10 hover:bg-white/20 rounded-lg flex items-center justify-center transition-all">
                          <Download className="w-3 h-3 text-white" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
