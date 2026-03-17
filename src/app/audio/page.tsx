'use client'

import { useState } from 'react'
import { Play, Download, Mic, Volume2 } from 'lucide-react'
import { AUDIO_PROVIDERS } from '@/lib/providers/registry'
import { ProviderBadge } from '@/components/ProviderBadge'
import { cn } from '@/lib/utils'

const VOICES_ELEVENLABS = ['Rachel', 'Drew', 'Clyde', 'Paul', 'Domi', 'Dave', 'Fin', 'Sarah', 'Antoni', 'Thomas']
const VOICES_OPENAI = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer']

const SAMPLE_TEXTS = [
  "Bonjour, je suis une voix générée par intelligence artificielle. La synthèse vocale moderne permet de créer des voix naturelles et expressives.",
  "Welcome to AI Hub. This is a demonstration of text-to-speech capabilities powered by state-of-the-art AI models.",
  "Les modèles de synthèse vocale actuels atteignent un niveau de réalisme remarquable, capable de transmettre des émotions et des nuances.",
]

export default function AudioPage() {
  const [text, setText] = useState('')
  const [selectedProvider, setSelectedProvider] = useState(AUDIO_PROVIDERS[0])
  const [selectedModel, setSelectedModel] = useState(AUDIO_PROVIDERS[0].models[0].id)
  const [selectedVoice, setSelectedVoice] = useState('Rachel')
  const [speed, setSpeed] = useState(1.0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [generated, setGenerated] = useState(false)

  const voices = selectedProvider.id === 'elevenlabs' ? VOICES_ELEVENLABS : VOICES_OPENAI

  const handleGenerate = async () => {
    if (!text.trim() || isGenerating) return
    setIsGenerating(true)
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800))
    setIsGenerating(false)
    setGenerated(true)
  }

  const handlePlay = () => {
    if (!generated) return
    setIsPlaying(true)
    setTimeout(() => setIsPlaying(false), 3000)
  }

  return (
    <div className="h-screen overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">Synthèse vocale</h1>
          <p className="text-sm text-gray-500 mt-1">Convertissez du texte en audio naturel</p>
        </div>

        {/* Provider selection */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {AUDIO_PROVIDERS.map(p => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedProvider(p)
                setSelectedModel(p.models[0].id)
                setSelectedVoice(p.id === 'elevenlabs' ? 'Rachel' : 'alloy')
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
                  'flex-1 px-3 py-2 rounded-lg border text-sm transition-all',
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

        {/* Voice */}
        <div className="mb-5">
          <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">Voix</label>
          <div className="flex flex-wrap gap-2">
            {voices.map(v => (
              <button
                key={v}
                onClick={() => { setSelectedVoice(v); setGenerated(false) }}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-all',
                  v === selectedVoice
                    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                    : 'border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                )}
              >
                <Mic className="w-3 h-3" />
                {v}
              </button>
            ))}
          </div>
        </div>

        {/* Speed */}
        <div className="mb-5">
          <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 flex items-center justify-between">
            <span>Vitesse</span>
            <span className="text-white">{speed.toFixed(1)}×</span>
          </label>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={speed}
            onChange={e => setSpeed(parseFloat(e.target.value))}
            className="w-full accent-violet-500"
          />
          <div className="flex justify-between text-[10px] text-gray-600 mt-1">
            <span>0.5× Lent</span>
            <span>1.0× Normal</span>
            <span>2.0× Rapide</span>
          </div>
        </div>

        {/* Text input */}
        <div className="mb-4">
          <label className="text-xs text-gray-500 uppercase tracking-wide mb-2 block">Texte</label>
          <div className="bg-white/5 border border-white/10 rounded-xl p-3 focus-within:border-violet-500/50 transition-all">
            <textarea
              value={text}
              onChange={e => { setText(e.target.value); setGenerated(false) }}
              placeholder="Entrez le texte à convertir en audio…"
              className="w-full bg-transparent text-sm text-white placeholder-gray-600 resize-none focus:outline-none min-h-[120px]"
              rows={5}
            />
          </div>
          <div className="flex gap-2 mt-2">
            {SAMPLE_TEXTS.map((s, i) => (
              <button
                key={i}
                onClick={() => { setText(s); setGenerated(false) }}
                className="text-xs text-gray-600 hover:text-gray-400 underline transition-colors"
              >
                Exemple {i + 1}
              </button>
            ))}
          </div>
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={!text.trim() || isGenerating}
          className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed py-3 rounded-xl text-sm font-medium text-white transition-all mb-4"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Génération en cours…
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4" />
              Générer l'audio
            </>
          )}
        </button>

        {/* Audio player (mock) */}
        {generated && (
          <div className="bg-white/5 border border-white/10 rounded-xl p-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePlay}
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                  isPlaying ? 'bg-violet-600' : 'bg-white/10 hover:bg-white/20'
                )}
              >
                <Play className={cn('w-4 h-4 text-white', isPlaying && 'animate-pulse')} />
              </button>
              <div className="flex-1">
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className={cn(
                      'h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full transition-all',
                      isPlaying ? 'animate-pulse' : 'w-0'
                    )}
                    style={{ width: isPlaying ? '40%' : '0%' }}
                  />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-[10px] text-gray-600">0:00</span>
                  <span className="text-[10px] text-gray-600">~{Math.round(text.length / 15)}s</span>
                </div>
              </div>
              <button className="w-8 h-8 bg-white/5 hover:bg-white/10 rounded-lg flex items-center justify-center transition-all">
                <Download className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
            <p className="text-[10px] text-gray-600 mt-2 text-center">
              Mode démo — Ajoutez votre clé {selectedProvider.name} dans Paramètres pour générer un vrai fichier audio
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
