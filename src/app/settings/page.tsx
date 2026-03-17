'use client'

import { useState } from 'react'
import { Eye, EyeOff, Check, ExternalLink, AlertCircle } from 'lucide-react'
import { useSettingsStore, ApiKeys } from '@/stores/settings'
import { ALL_PROVIDERS, Provider } from '@/lib/providers/registry'
import { ProviderBadge } from '@/components/ProviderBadge'
import { cn } from '@/lib/utils'

const GROUPS = [
  {
    title: 'Chat & Texte',
    emoji: '💬',
    providers: ['openai', 'anthropic', 'google', 'mistral', 'xai', 'deepseek', 'cohere', 'perplexity', 'openrouter', 'together', 'replicate'],
  },
  {
    title: 'Images',
    emoji: '🎨',
    providers: ['openai-image', 'stability', 'ideogram', 'leonardo', 'runway', 'krea', 'getimg', 'scenario', 'flux'],
  },
  {
    title: 'Vidéo',
    emoji: '🎬',
    providers: ['runway-video', 'pika'],
  },
  {
    title: 'Audio',
    emoji: '🎵',
    providers: ['elevenlabs', 'openai-audio'],
  },
  {
    title: 'Recherche',
    emoji: '🔍',
    providers: ['serpapi', 'perplexity-search'],
  },
]

// Map provider IDs to env keys (some providers share keys)
const PROVIDER_ENV_KEY: Record<string, keyof ApiKeys> = {
  'openai': 'OPENAI_API_KEY',
  'openai-image': 'OPENAI_API_KEY',
  'openai-audio': 'OPENAI_API_KEY',
  'anthropic': 'ANTHROPIC_API_KEY',
  'google': 'GOOGLE_API_KEY',
  'mistral': 'MISTRAL_API_KEY',
  'xai': 'XAI_API_KEY',
  'deepseek': 'DEEPSEEK_API_KEY',
  'cohere': 'COHERE_API_KEY',
  'perplexity': 'PERPLEXITY_API_KEY',
  'perplexity-search': 'PERPLEXITY_API_KEY',
  'openrouter': 'OPENROUTER_API_KEY',
  'together': 'TOGETHER_API_KEY',
  'replicate': 'REPLICATE_API_KEY',
  'flux': 'REPLICATE_API_KEY',
  'stability': 'STABILITY_API_KEY',
  'ideogram': 'IDEOGRAM_API_KEY',
  'leonardo': 'LEONARDO_API_KEY',
  'runway': 'RUNWAY_API_KEY',
  'runway-video': 'RUNWAY_API_KEY',
  'krea': 'KREA_API_KEY',
  'getimg': 'GETIMG_API_KEY',
  'scenario': 'SCENARIO_API_KEY',
  'elevenlabs': 'ELEVENLABS_API_KEY',
  'serpapi': 'SERPAPI_KEY',
  'pika': 'PIKA_API_KEY',
}

function ApiKeyInput({ provider }: { provider: Provider }) {
  const [showKey, setShowKey] = useState(false)
  const [saved, setSaved] = useState(false)
  const { apiKeys, setApiKey } = useSettingsStore()
  const envKey = PROVIDER_ENV_KEY[provider.id]
  if (!envKey) return null

  const value = apiKeys[envKey] ?? ''
  const isShared = ['openai-image', 'openai-audio', 'flux', 'runway-video', 'perplexity-search'].includes(provider.id)

  const handleChange = (v: string) => {
    setApiKey(envKey, v)
    setSaved(false)
  }

  const handleBlur = () => {
    if (value) setSaved(true)
  }

  return (
    <div className="flex items-center gap-3 p-3 bg-white/3 hover:bg-white/5 rounded-xl transition-all">
      <ProviderBadge provider={provider} size="sm" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-xs font-medium text-white">{provider.name}</p>
          {isShared && (
            <span className="text-[10px] text-gray-600 bg-white/5 px-1.5 py-0.5 rounded">
              Clé partagée avec {provider.id.includes('openai') ? 'OpenAI' : provider.id.includes('runway') ? 'Runway' : 'Perplexity'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 bg-black/30 border border-white/10 rounded-lg px-2.5 py-1.5 focus-within:border-violet-500/50 transition-all">
            <input
              type={showKey ? 'text' : 'password'}
              value={value}
              onChange={e => handleChange(e.target.value)}
              onBlur={handleBlur}
              placeholder={`${envKey}...`}
              className="flex-1 bg-transparent text-xs text-gray-300 placeholder-gray-700 focus:outline-none font-mono min-w-0"
            />
            <button
              onClick={() => setShowKey(!showKey)}
              className="text-gray-600 hover:text-gray-400 transition-colors flex-shrink-0"
            >
              {showKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            </button>
          </div>
          {value && saved && <Check className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />}
          <a
            href={provider.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-700 hover:text-gray-400 transition-colors flex-shrink-0"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { apiKeys } = useSettingsStore()
  const totalKeys = Object.values(apiKeys).filter(Boolean).length
  const totalProviders = Object.keys(PROVIDER_ENV_KEY).length

  // Deduplicate for counting
  const uniqueEnvKeys = new Set(Object.values(PROVIDER_ENV_KEY))
  const configuredKeys = [...uniqueEnvKeys].filter(k => apiKeys[k]).length

  return (
    <div className="h-screen overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-white">Paramètres</h1>
          <p className="text-sm text-gray-500 mt-1">Clés API — stockées localement dans votre navigateur</p>
        </div>

        {/* Status banner */}
        <div className={cn(
          'flex items-start gap-3 p-4 rounded-xl border mb-6',
          configuredKeys === 0
            ? 'bg-amber-500/5 border-amber-500/20'
            : configuredKeys === uniqueEnvKeys.size
            ? 'bg-green-500/5 border-green-500/20'
            : 'bg-blue-500/5 border-blue-500/20'
        )}>
          <AlertCircle className={cn('w-4 h-4 mt-0.5 flex-shrink-0',
            configuredKeys === 0 ? 'text-amber-400' : configuredKeys === uniqueEnvKeys.size ? 'text-green-400' : 'text-blue-400'
          )} />
          <div>
            <p className={cn('text-sm font-medium',
              configuredKeys === 0 ? 'text-amber-300' : 'text-gray-200'
            )}>
              {configuredKeys === 0
                ? 'Mode démo actif — aucune clé API configurée'
                : `${configuredKeys}/${uniqueEnvKeys.size} providers configurés`}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">
              {configuredKeys === 0
                ? "Entrez vos clés ci-dessous pour activer les vrais appels API. Sans clé, l'interface fonctionne en mode démo simulé."
                : "Les providers configurés utiliseront vos vraies clés API. Les autres restent en mode démo."}
            </p>
          </div>
        </div>

        {/* Security note */}
        <div className="bg-white/3 border border-white/10 rounded-xl p-4 mb-6 text-xs text-gray-500 leading-relaxed">
          <strong className="text-gray-300">🔒 Sécurité</strong> — Vos clés sont stockées uniquement dans le <code className="text-cyan-400 bg-black/30 px-1 rounded">localStorage</code> de votre navigateur.
          Elles ne sont jamais envoyées à un serveur tiers. Les appels API passent par les routes Next.js <code className="text-cyan-400 bg-black/30 px-1 rounded">/api/*</code> côté serveur,
          ce qui signifie que vos clés ne sont jamais exposées dans le code client.
          <br /><br />
          Vous pouvez aussi définir les variables d'environnement dans un fichier <code className="text-cyan-400 bg-black/30 px-1 rounded">.env.local</code> (prioritaire sur localStorage).
        </div>

        {/* Groups */}
        <div className="space-y-6">
          {GROUPS.map(group => {
            const groupProviders = group.providers
              .map(id => ALL_PROVIDERS.find(p => p.id === id))
              .filter(Boolean) as Provider[]

            return (
              <div key={group.title}>
                <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                  <span>{group.emoji}</span>
                  {group.title}
                </h2>
                <div className="space-y-1">
                  {groupProviders.map(p => (
                    <ApiKeyInput key={p.id} provider={p} />
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* .env.local template */}
        <div className="mt-8 bg-black/40 border border-white/10 rounded-xl p-4">
          <p className="text-xs font-medium text-gray-400 mb-3">Template <code>.env.local</code></p>
          <pre className="text-[10px] text-green-300 font-mono leading-5 overflow-x-auto">{`# Chat & Texte
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AIza...
MISTRAL_API_KEY=...
XAI_API_KEY=xai-...
DEEPSEEK_API_KEY=sk-...
COHERE_API_KEY=...
PERPLEXITY_API_KEY=pplx-...
OPENROUTER_API_KEY=sk-or-...
TOGETHER_API_KEY=...
REPLICATE_API_KEY=r8_...

# Images
STABILITY_API_KEY=sk-...
IDEOGRAM_API_KEY=...
LEONARDO_API_KEY=...
RUNWAY_API_KEY=...
KREA_API_KEY=...
GETIMG_API_KEY=...
SCENARIO_API_KEY=...

# Audio & Vidéo
ELEVENLABS_API_KEY=...
PIKA_API_KEY=...

# Recherche
SERPAPI_KEY=...`}</pre>
        </div>
      </div>
    </div>
  )
}
