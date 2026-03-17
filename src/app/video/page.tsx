'use client'

import { useState } from 'react'
import { Video, Upload, Wand2, Film } from 'lucide-react'
import { VIDEO_PROVIDERS } from '@/lib/providers/registry'
import { ProviderBadge } from '@/components/ProviderBadge'
import { cn } from '@/lib/utils'

const DURATIONS = ['5s', '10s']
const RATIOS = ['16:9', '9:16', '1:1']

export default function VideoPage() {
  const [prompt, setPrompt] = useState('')
  const [selectedProvider, setSelectedProvider] = useState(VIDEO_PROVIDERS[0])
  const [selectedModel, setSelectedModel] = useState(VIDEO_PROVIDERS[0].models[0].id)
  const [duration, setDuration] = useState('5s')
  const [ratio, setRatio] = useState('16:9')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return
    setIsGenerating(true)
    await new Promise(r => setTimeout(r, 2000 + Math.random() * 1500))
    setIsGenerating(false)
    setGenerated(true)
  }

  return (
    <div className="h-screen overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">Génération vidéo</h1>
          <p className="text-sm text-gray-500 mt-1">Texte ou image → vidéo IA</p>
        </div>

        {/* Provider selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {VIDEO_PROVIDERS.map(p => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedProvider(p)
                setSelectedModel(p.models[0].id)
                setGenerated(false)
              }}
              className={cn(
                'flex items-center gap-3 p-4 rounded-xl border transition-all text-left',
                p.id === selectedProvider.id
                  ? 'bg-violet-500/10 border-violet-500/30'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              )}
            >
              <ProviderBadge provider={p} size="md" />
              <div>
                <p className="text-sm font-semibold text-white">{p.name}</p>
                <p className="text-xs text-gray-500">{p.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Model */}
        <div className="mb-5">
          <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">Modèle</label>
          <div className="flex gap-2">
            {selectedProvider.models.map(m => (
              <button
                key={m.id}
                onClick={() => { setSelectedModel(m.id); setGenerated(false) }}
                className={cn(
                  'flex-1 px-3 py-2.5 rounded-lg border text-sm transition-all',
                  m.id === selectedModel
                    ? 'bg-violet-500/10 border-violet-500/30 text-white'
                    : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                )}
              >
                <p className="font-medium">{m.name}</p>
                {m.description && <p className="text-[10px] text-gray-500 mt-0.5">{m.description}</p>}
              </button>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-2 gap-4 mb-5">
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">Durée</label>
            <div className="flex gap-2">
              {DURATIONS.map(d => (
                <button
                  key={d}
                  onClick={() => setDuration(d)}
                  className={cn(
                    'flex-1 py-2 rounded-lg border text-sm transition-all',
                    d === duration
                      ? 'bg-violet-500/10 border-violet-500/30 text-white'
                      : 'border-white/10 text-gray-400 hover:text-white'
                  )}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">Format</label>
            <div className="flex gap-2">
              {RATIOS.map(r => (
                <button
                  key={r}
                  onClick={() => setRatio(r)}
                  className={cn(
                    'flex-1 py-2 rounded-lg border text-xs transition-all',
                    r === ratio
                      ? 'bg-violet-500/10 border-violet-500/30 text-white'
                      : 'border-white/10 text-gray-400 hover:text-white'
                  )}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Image input (optional) */}
        <div className="mb-4">
          <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">
            Image de départ <span className="normal-case text-gray-700">(optionnel — Image to Video)</span>
          </label>
          <div className="border-2 border-dashed border-white/10 hover:border-white/20 rounded-xl p-6 text-center cursor-pointer transition-all">
            <Upload className="w-6 h-6 text-gray-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">Glissez une image ou cliquez pour choisir</p>
            <p className="text-xs text-gray-700 mt-1">PNG, JPG jusqu'à 10 Mo</p>
          </div>
        </div>

        {/* Prompt */}
        <div className="mb-5">
          <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">Prompt</label>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 focus-within:border-violet-500/50 transition-all">
            <textarea
              value={prompt}
              onChange={e => { setPrompt(e.target.value); setGenerated(false) }}
              placeholder="Décrivez la vidéo… Ex : Un astronaute marchant sur la lune, caméra lente, ciel étoilé, ambiance cinématographique"
              className="w-full bg-transparent text-sm text-white placeholder-gray-600 resize-none focus:outline-none min-h-[80px]"
              rows={3}
            />
          </div>
        </div>

        {/* Generate */}
        <button
          onClick={handleGenerate}
          disabled={!prompt.trim() || isGenerating}
          className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed py-3 rounded-xl text-sm font-medium text-white transition-all mb-4"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Génération en cours… ({duration})
            </>
          ) : (
            <>
              <Film className="w-4 h-4" />
              Générer la vidéo
            </>
          )}
        </button>

        {/* Result placeholder */}
        {generated && (
          <div className="bg-black rounded-xl overflow-hidden border border-white/10 aspect-video flex items-center justify-center">
            <div className="text-center">
              <Video className="w-12 h-12 text-gray-600 mx-auto mb-3" />
              <p className="text-sm text-gray-400 font-medium">Vidéo générée ✓</p>
              <p className="text-xs text-gray-600 mt-1">
                Mode démo — Ajoutez votre clé {selectedProvider.name} pour les vraies vidéos
              </p>
            </div>
          </div>
        )}

        {/* Info */}
        <div className="mt-6 bg-amber-500/5 border border-amber-500/20 rounded-xl p-4">
          <p className="text-xs text-amber-400 font-medium mb-1">Note sur la génération vidéo</p>
          <p className="text-xs text-gray-500 leading-relaxed">
            La génération vidéo est significativement plus longue (30s à plusieurs minutes) et plus coûteuse que les autres modalités.
            Runway et Pika sont les leaders du marché. Les vidéos générées sont souvent de 5 à 10 secondes.
          </p>
        </div>
      </div>
    </div>
  )
}
