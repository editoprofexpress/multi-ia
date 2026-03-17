import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface ApiKeys {
  // Text
  OPENAI_API_KEY: string
  ANTHROPIC_API_KEY: string
  GOOGLE_API_KEY: string
  MISTRAL_API_KEY: string
  XAI_API_KEY: string
  DEEPSEEK_API_KEY: string
  COHERE_API_KEY: string
  PERPLEXITY_API_KEY: string
  OPENROUTER_API_KEY: string
  TOGETHER_API_KEY: string
  REPLICATE_API_KEY: string
  // Image
  STABILITY_API_KEY: string
  IDEOGRAM_API_KEY: string
  LEONARDO_API_KEY: string
  RUNWAY_API_KEY: string
  KREA_API_KEY: string
  GETIMG_API_KEY: string
  SCENARIO_API_KEY: string
  // Audio
  ELEVENLABS_API_KEY: string
  // Search
  SERPAPI_KEY: string
  // Video
  PIKA_API_KEY: string
}

type SettingsStore = {
  apiKeys: ApiKeys
  setApiKey: (key: keyof ApiKeys, value: string) => void
  hasKey: (key: keyof ApiKeys) => boolean
  clearKey: (key: keyof ApiKeys) => void
}

const defaultKeys: ApiKeys = {
  OPENAI_API_KEY: '',
  ANTHROPIC_API_KEY: '',
  GOOGLE_API_KEY: '',
  MISTRAL_API_KEY: '',
  XAI_API_KEY: '',
  DEEPSEEK_API_KEY: '',
  COHERE_API_KEY: '',
  PERPLEXITY_API_KEY: '',
  OPENROUTER_API_KEY: '',
  TOGETHER_API_KEY: '',
  REPLICATE_API_KEY: '',
  STABILITY_API_KEY: '',
  IDEOGRAM_API_KEY: '',
  LEONARDO_API_KEY: '',
  RUNWAY_API_KEY: '',
  KREA_API_KEY: '',
  GETIMG_API_KEY: '',
  SCENARIO_API_KEY: '',
  ELEVENLABS_API_KEY: '',
  SERPAPI_KEY: '',
  PIKA_API_KEY: '',
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      apiKeys: defaultKeys,
      setApiKey: (key, value) =>
        set(state => ({ apiKeys: { ...state.apiKeys, [key]: value } })),
      hasKey: key => {
        const envVal = process.env[`NEXT_PUBLIC_${key}`] || ''
        return envVal.length > 0 || get().apiKeys[key].length > 0
      },
      clearKey: key =>
        set(state => ({ apiKeys: { ...state.apiKeys, [key]: '' } })),
    }),
    { name: 'ai-hub-settings' }
  )
)
