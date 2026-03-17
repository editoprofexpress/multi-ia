'use client'

import { useState } from 'react'
import { Search, ExternalLink, Globe, Clock } from 'lucide-react'
import { SEARCH_PROVIDERS } from '@/lib/providers/registry'
import { ProviderBadge } from '@/components/ProviderBadge'
import { cn } from '@/lib/utils'

const MOCK_RESULTS = [
  {
    title: 'Les dernières avancées en intelligence artificielle — 2025',
    url: 'https://example.com/ia-2025',
    snippet: "L'intelligence artificielle continue de progresser à une vitesse remarquable. Les modèles de langage de nouvelle génération démontrent des capacités de raisonnement inédites...",
    domain: 'example.com',
    date: 'Il y a 2 heures',
  },
  {
    title: 'GPT-5 et Claude Opus : comparatif des meilleurs LLMs',
    url: 'https://example.com/comparatif-llm',
    snippet: "Découvrez notre analyse approfondie des modèles de langage les plus puissants de 2025. Nous comparons les performances sur 50 benchmarks standardisés...",
    domain: 'example.com',
    date: 'Il y a 1 jour',
  },
  {
    title: "L'IA générative dans les entreprises : état des lieux",
    url: 'https://example.com/ia-entreprises',
    snippet: "86% des grandes entreprises ont intégré des outils d'IA générative dans leurs processus en 2025. Retour sur les cas d'usage les plus transformateurs...",
    domain: 'example.com',
    date: 'Il y a 3 jours',
  },
  {
    title: "Flux 1.1 Pro : le meilleur modèle de génération d'image ?",
    url: 'https://example.com/flux-pro',
    snippet: "Black Forest Labs dévoile Flux 1.1 Pro, un modèle de génération d'image qui surpasse DALL-E 3 et Midjourney sur la plupart des métriques de qualité...",
    domain: 'example.com',
    date: 'Il y a 5 jours',
  },
]

const MOCK_AI_ANSWER = `## Synthèse IA

L'intelligence artificielle connaît une évolution accélérée en 2025, avec plusieurs tendances clés :

**Modèles multimodaux** : Les LLMs intègrent désormais nativement texte, image, audio et vidéo dans un seul modèle.

**Raisonnement amélioré** : Les modèles de type "o1/o3" (OpenAI) et "DeepSeek R1" montrent des capacités de raisonnement mathématique proches du niveau expert.

**Coût en baisse** : Les prix ont chuté de 90% en 2 ans, rendant l'IA accessible à tous les projets.

*Sources : 4 résultats analysés*`

export default function SearchPage() {
  const [query, setQuery] = useState('')
  const [selectedProvider, setSelectedProvider] = useState(SEARCH_PROVIDERS[0])
  const [selectedEngine, setSelectedEngine] = useState(SEARCH_PROVIDERS[0].models[0].id)
  const [isSearching, setIsSearching] = useState(false)
  const [results, setResults] = useState<typeof MOCK_RESULTS>([])
  const [aiAnswer, setAiAnswer] = useState('')

  const handleSearch = async () => {
    if (!query.trim() || isSearching) return
    setIsSearching(true)
    setResults([])
    setAiAnswer('')

    await new Promise(r => setTimeout(r, 800 + Math.random() * 700))
    setResults(MOCK_RESULTS)

    if (selectedProvider.id === 'perplexity-search') {
      let accumulated = ''
      for (const char of MOCK_AI_ANSWER) {
        accumulated += char
        setAiAnswer(accumulated)
        await new Promise(r => setTimeout(r, 8))
      }
    }

    setIsSearching(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch()
  }

  return (
    <div className="h-screen overflow-y-auto">
      <div className="max-w-3xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">Recherche web</h1>
          <p className="text-sm text-gray-500 mt-1">SerpAPI + Perplexity avec synthèse IA</p>
        </div>

        {/* Provider selection */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {SEARCH_PROVIDERS.map(p => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedProvider(p)
                setSelectedEngine(p.models[0].id)
                setResults([])
                setAiAnswer('')
              }}
              className={cn(
                'flex items-center gap-3 p-3 rounded-xl border transition-all text-left',
                p.id === selectedProvider.id
                  ? 'bg-violet-500/10 border-violet-500/30'
                  : 'bg-white/5 border-white/10 hover:bg-white/10'
              )}
            >
              <ProviderBadge provider={p} size="sm" />
              <div>
                <p className="text-sm font-semibold text-white">{p.name}</p>
                <p className="text-xs text-gray-500">{p.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Engine */}
        <div className="flex gap-2 mb-5">
          {selectedProvider.models.map(m => (
            <button
              key={m.id}
              onClick={() => setSelectedEngine(m.id)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs transition-all',
                m.id === selectedEngine
                  ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                  : 'border-white/10 text-gray-500 hover:text-white'
              )}
            >
              <Globe className="w-3 h-3" />
              {m.name}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="flex gap-3 mb-6">
          <div className="flex-1 flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus-within:border-violet-500/50 transition-all">
            <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Rechercher sur le web…"
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 focus:outline-none"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={!query.trim() || isSearching}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed px-5 rounded-xl text-sm font-medium text-white transition-all flex-shrink-0"
          >
            {isSearching ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Chercher
          </button>
        </div>

        {/* Loading */}
        {isSearching && (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white/5 rounded-xl p-4 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                <div className="h-3 bg-white/5 rounded w-full mb-1" />
                <div className="h-3 bg-white/5 rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* AI Answer (Perplexity) */}
        {aiAnswer && (
          <div className="bg-gradient-to-br from-cyan-500/5 to-violet-500/5 border border-cyan-500/20 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-3">
              <ProviderBadge provider={SEARCH_PROVIDERS[1]} size="sm" />
              <span className="text-xs font-medium text-cyan-400">Réponse IA</span>
            </div>
            <div className="text-sm text-gray-200 leading-relaxed whitespace-pre-line">{aiAnswer}</div>
          </div>
        )}

        {/* Results */}
        {results.length > 0 && !isSearching && (
          <div className="space-y-3">
            <p className="text-xs text-gray-600">{results.length} résultats pour « {query} »</p>
            {results.map((r, i) => (
              <div key={i} className="bg-white/5 hover:bg-white/8 border border-white/5 hover:border-white/10 rounded-xl p-4 transition-all cursor-pointer group">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-blue-300 group-hover:text-blue-200 mb-1">{r.title}</p>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-[10px] text-green-600">{r.domain}</span>
                      <span className="text-gray-700">·</span>
                      <span className="flex items-center gap-1 text-[10px] text-gray-600">
                        <Clock className="w-2.5 h-2.5" />
                        {r.date}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">{r.snippet}</p>
                  </div>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400 flex-shrink-0 mt-0.5 transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
