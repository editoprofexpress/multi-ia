export type ProviderCategory = 'text' | 'image' | 'video' | 'audio' | 'search' | 'embedding'

export interface Provider {
  id: string
  name: string
  category: ProviderCategory[]
  color: string
  description: string
  models: Model[]
  envKey: string
  docsUrl: string
}

export interface Model {
  id: string
  name: string
  description?: string
  maxTokens?: number
  supportsStreaming?: boolean
  supportsVision?: boolean
}

export const TEXT_PROVIDERS: Provider[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    category: ['text'],
    color: '#10a37f',
    description: 'GPT-4o, o1 et plus',
    envKey: 'OPENAI_API_KEY',
    docsUrl: 'https://platform.openai.com',
    models: [
      { id: 'gpt-4o', name: 'GPT-4o', maxTokens: 128000, supportsStreaming: true, supportsVision: true },
      { id: 'gpt-4o-mini', name: 'GPT-4o mini', maxTokens: 128000, supportsStreaming: true },
      { id: 'o1', name: 'o1', maxTokens: 200000 },
      { id: 'o1-mini', name: 'o1-mini', maxTokens: 128000 },
      { id: 'o3-mini', name: 'o3-mini', maxTokens: 200000 },
    ],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    category: ['text'],
    color: '#d97706',
    description: 'Claude 3.5, Claude 4',
    envKey: 'ANTHROPIC_API_KEY',
    docsUrl: 'https://docs.anthropic.com',
    models: [
      { id: 'claude-opus-4-6', name: 'Claude Opus 4.6', maxTokens: 200000, supportsStreaming: true, supportsVision: true },
      { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', maxTokens: 200000, supportsStreaming: true, supportsVision: true },
      { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5', maxTokens: 200000, supportsStreaming: true },
    ],
  },
  {
    id: 'google',
    name: 'Google Gemini',
    category: ['text'],
    color: '#4285f4',
    description: 'Gemini 2.0, 1.5 Pro',
    envKey: 'GOOGLE_API_KEY',
    docsUrl: 'https://ai.google.dev',
    models: [
      { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', supportsStreaming: true, supportsVision: true },
      { id: 'gemini-2.0-pro', name: 'Gemini 2.0 Pro', supportsStreaming: true, supportsVision: true },
      { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', maxTokens: 1000000, supportsStreaming: true },
    ],
  },
  {
    id: 'mistral',
    name: 'Mistral AI',
    category: ['text'],
    color: '#ff7000',
    description: 'Mistral Large, Codestral',
    envKey: 'MISTRAL_API_KEY',
    docsUrl: 'https://docs.mistral.ai',
    models: [
      { id: 'mistral-large-latest', name: 'Mistral Large', supportsStreaming: true },
      { id: 'mistral-small-latest', name: 'Mistral Small', supportsStreaming: true },
      { id: 'codestral-latest', name: 'Codestral', supportsStreaming: true },
      { id: 'open-mistral-nemo', name: 'Mistral Nemo', supportsStreaming: true },
    ],
  },
  {
    id: 'xai',
    name: 'xAI',
    category: ['text'],
    color: '#1a1a1a',
    description: 'Grok-2, Grok Beta',
    envKey: 'XAI_API_KEY',
    docsUrl: 'https://docs.x.ai',
    models: [
      { id: 'grok-2', name: 'Grok-2', supportsStreaming: true },
      { id: 'grok-2-mini', name: 'Grok-2 Mini', supportsStreaming: true },
      { id: 'grok-beta', name: 'Grok Beta', supportsStreaming: true },
    ],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    category: ['text'],
    color: '#4f46e5',
    description: 'DeepSeek V3, R1',
    envKey: 'DEEPSEEK_API_KEY',
    docsUrl: 'https://platform.deepseek.com',
    models: [
      { id: 'deepseek-chat', name: 'DeepSeek V3', supportsStreaming: true },
      { id: 'deepseek-reasoner', name: 'DeepSeek R1', supportsStreaming: true },
    ],
  },
  {
    id: 'cohere',
    name: 'Cohere',
    category: ['text', 'embedding'],
    color: '#39594d',
    description: 'Command R+, Embed',
    envKey: 'COHERE_API_KEY',
    docsUrl: 'https://docs.cohere.com',
    models: [
      { id: 'command-r-plus', name: 'Command R+', supportsStreaming: true },
      { id: 'command-r', name: 'Command R', supportsStreaming: true },
      { id: 'command-light', name: 'Command Light', supportsStreaming: true },
    ],
  },
  {
    id: 'perplexity',
    name: 'Perplexity',
    category: ['text', 'search'],
    color: '#20b2aa',
    description: 'Sonar, recherche web',
    envKey: 'PERPLEXITY_API_KEY',
    docsUrl: 'https://docs.perplexity.ai',
    models: [
      { id: 'sonar-pro', name: 'Sonar Pro', supportsStreaming: true },
      { id: 'sonar', name: 'Sonar', supportsStreaming: true },
      { id: 'sonar-reasoning', name: 'Sonar Reasoning', supportsStreaming: true },
    ],
  },
  {
    id: 'openrouter',
    name: 'OpenRouter',
    category: ['text'],
    color: '#6366f1',
    description: 'Accès unifié à 100+ modèles',
    envKey: 'OPENROUTER_API_KEY',
    docsUrl: 'https://openrouter.ai',
    models: [
      { id: 'auto', name: 'Auto (meilleur modèle)', supportsStreaming: true },
      { id: 'meta-llama/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', supportsStreaming: true },
      { id: 'google/gemma-3-27b-it', name: 'Gemma 3 27B', supportsStreaming: true },
      { id: 'qwen/qwen-2.5-72b-instruct', name: 'Qwen 2.5 72B', supportsStreaming: true },
    ],
  },
  {
    id: 'together',
    name: 'Together AI',
    category: ['text'],
    color: '#7c3aed',
    description: 'LLMs open-source rapides',
    envKey: 'TOGETHER_API_KEY',
    docsUrl: 'https://docs.together.ai',
    models: [
      { id: 'meta-llama/Llama-3.3-70B-Instruct-Turbo', name: 'Llama 3.3 70B Turbo', supportsStreaming: true },
      { id: 'mistralai/Mixtral-8x22B-Instruct-v0.1', name: 'Mixtral 8x22B', supportsStreaming: true },
      { id: 'Qwen/Qwen2.5-72B-Instruct-Turbo', name: 'Qwen 2.5 72B', supportsStreaming: true },
    ],
  },
  {
    id: 'replicate',
    name: 'Replicate',
    category: ['text', 'image'],
    color: '#000000',
    description: 'Modèles ML à la demande',
    envKey: 'REPLICATE_API_KEY',
    docsUrl: 'https://replicate.com',
    models: [
      { id: 'meta/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', supportsStreaming: true },
      { id: 'mistralai/mistral-7b-instruct-v0.2', name: 'Mistral 7B', supportsStreaming: true },
    ],
  },
]

export const IMAGE_PROVIDERS: Provider[] = [
  {
    id: 'openai-image',
    name: 'OpenAI DALL-E',
    category: ['image'],
    color: '#10a37f',
    description: 'DALL-E 3, DALL-E 2',
    envKey: 'OPENAI_API_KEY',
    docsUrl: 'https://platform.openai.com',
    models: [
      { id: 'dall-e-3', name: 'DALL-E 3', description: '1024×1024 / 1792×1024 / 1024×1792' },
      { id: 'dall-e-2', name: 'DALL-E 2', description: '256×256 / 512×512 / 1024×1024' },
    ],
  },
  {
    id: 'stability',
    name: 'Stability AI',
    category: ['image'],
    color: '#7c23a8',
    description: 'Stable Diffusion 3.5',
    envKey: 'STABILITY_API_KEY',
    docsUrl: 'https://platform.stability.ai',
    models: [
      { id: 'sd3.5-large', name: 'SD 3.5 Large', description: 'Ultra haute qualité' },
      { id: 'sd3.5-medium', name: 'SD 3.5 Medium', description: 'Rapport qualité/vitesse' },
      { id: 'sdxl-1.0', name: 'SDXL 1.0', description: 'Classique, versatile' },
    ],
  },
  {
    id: 'ideogram',
    name: 'Ideogram',
    category: ['image'],
    color: '#e11d48',
    description: 'Texte dans les images',
    envKey: 'IDEOGRAM_API_KEY',
    docsUrl: 'https://ideogram.ai',
    models: [
      { id: 'ideogram-v2', name: 'Ideogram V2', description: 'Meilleur rendu texte' },
      { id: 'ideogram-v2-turbo', name: 'V2 Turbo', description: 'Rapide' },
    ],
  },
  {
    id: 'leonardo',
    name: 'Leonardo AI',
    category: ['image'],
    color: '#f59e0b',
    description: 'Art, game assets, portraits',
    envKey: 'LEONARDO_API_KEY',
    docsUrl: 'https://docs.leonardo.ai',
    models: [
      { id: 'phoenix', name: 'Phoenix', description: 'Modèle phare' },
      { id: 'lightning-xl', name: 'Lightning XL', description: 'Ultra rapide' },
      { id: 'vision-xl', name: 'Vision XL', description: 'Photoréaliste' },
    ],
  },
  {
    id: 'runway',
    name: 'Runway ML',
    category: ['image', 'video'],
    color: '#06b6d4',
    description: 'Image & vidéo IA',
    envKey: 'RUNWAY_API_KEY',
    docsUrl: 'https://runwayml.com',
    models: [
      { id: 'gen3a_turbo', name: 'Gen-3 Alpha Turbo', description: 'Image to video' },
      { id: 'gen3a', name: 'Gen-3 Alpha', description: 'Haute qualité' },
    ],
  },
  {
    id: 'krea',
    name: 'Krea AI',
    category: ['image'],
    color: '#f97316',
    description: 'Génération créative temps réel',
    envKey: 'KREA_API_KEY',
    docsUrl: 'https://krea.ai',
    models: [
      { id: 'krea-flux-pro', name: 'Flux Pro (Krea)', description: 'Via Krea' },
      { id: 'krea-sdxl', name: 'SDXL (Krea)', description: 'Via Krea' },
    ],
  },
  {
    id: 'getimg',
    name: 'Getimg.ai',
    category: ['image'],
    color: '#8b5cf6',
    description: 'Suite complète génération image',
    envKey: 'GETIMG_API_KEY',
    docsUrl: 'https://getimg.ai',
    models: [
      { id: 'flux-schnell', name: 'Flux Schnell', description: 'Rapide' },
      { id: 'flux-pro', name: 'Flux Pro', description: 'Haute qualité' },
      { id: 'stable-diffusion-xl-v1-0', name: 'SDXL', description: 'Classique' },
    ],
  },
  {
    id: 'scenario',
    name: 'Scenario',
    category: ['image'],
    color: '#059669',
    description: 'Game assets & cohérence stylée',
    envKey: 'SCENARIO_API_KEY',
    docsUrl: 'https://scenario.com',
    models: [
      { id: 'scenario-xl', name: 'Scenario XL', description: 'Assets de jeu' },
    ],
  },
  {
    id: 'flux',
    name: 'Flux (HF/Replicate)',
    category: ['image'],
    color: '#dc2626',
    description: 'Flux 1.1 Pro via Replicate',
    envKey: 'REPLICATE_API_KEY',
    docsUrl: 'https://replicate.com',
    models: [
      { id: 'black-forest-labs/flux-1.1-pro', name: 'Flux 1.1 Pro', description: 'Photoréaliste ultra' },
      { id: 'black-forest-labs/flux-schnell', name: 'Flux Schnell', description: '4 steps, rapide' },
      { id: 'black-forest-labs/flux-dev', name: 'Flux Dev', description: 'Open-source' },
    ],
  },
]

export const VIDEO_PROVIDERS: Provider[] = [
  {
    id: 'runway-video',
    name: 'Runway',
    category: ['video'],
    color: '#06b6d4',
    description: 'Gen-3 Alpha, text/image to video',
    envKey: 'RUNWAY_API_KEY',
    docsUrl: 'https://runwayml.com',
    models: [
      { id: 'gen3a_turbo', name: 'Gen-3 Alpha Turbo', description: '5s ou 10s' },
      { id: 'gen3a', name: 'Gen-3 Alpha', description: 'Haute qualité, 5s ou 10s' },
    ],
  },
  {
    id: 'pika',
    name: 'Pika Labs',
    category: ['video'],
    color: '#a855f7',
    description: 'Pika 2.0, animation créative',
    envKey: 'PIKA_API_KEY',
    docsUrl: 'https://pika.art',
    models: [
      { id: 'pika-2.0', name: 'Pika 2.0', description: 'Dernière version' },
      { id: 'pika-1.5', name: 'Pika 1.5', description: 'Stable' },
    ],
  },
]

export const AUDIO_PROVIDERS: Provider[] = [
  {
    id: 'elevenlabs',
    name: 'ElevenLabs',
    category: ['audio'],
    color: '#f59e0b',
    description: 'TTS ultra-réaliste, clonage voix',
    envKey: 'ELEVENLABS_API_KEY',
    docsUrl: 'https://elevenlabs.io',
    models: [
      { id: 'eleven_multilingual_v2', name: 'Multilingual V2', description: '29 langues' },
      { id: 'eleven_turbo_v2_5', name: 'Turbo V2.5', description: 'Faible latence' },
      { id: 'eleven_flash_v2_5', name: 'Flash V2.5', description: 'Ultra rapide' },
    ],
  },
  {
    id: 'openai-audio',
    name: 'OpenAI TTS',
    category: ['audio'],
    color: '#10a37f',
    description: 'TTS-1, TTS-1 HD',
    envKey: 'OPENAI_API_KEY',
    docsUrl: 'https://platform.openai.com',
    models: [
      { id: 'tts-1-hd', name: 'TTS-1 HD', description: 'Haute qualité' },
      { id: 'tts-1', name: 'TTS-1', description: 'Standard, rapide' },
    ],
  },
]

export const SEARCH_PROVIDERS: Provider[] = [
  {
    id: 'serpapi',
    name: 'SerpAPI',
    category: ['search'],
    color: '#16a34a',
    description: 'Google, Bing, YouTube Search',
    envKey: 'SERPAPI_KEY',
    docsUrl: 'https://serpapi.com',
    models: [
      { id: 'google', name: 'Google Search', description: 'Résultats Google' },
      { id: 'bing', name: 'Bing Search', description: 'Résultats Bing' },
      { id: 'youtube', name: 'YouTube Search', description: 'Vidéos YouTube' },
    ],
  },
  {
    id: 'perplexity-search',
    name: 'Perplexity Search',
    category: ['search'],
    color: '#20b2aa',
    description: 'Recherche avec IA intégrée',
    envKey: 'PERPLEXITY_API_KEY',
    docsUrl: 'https://docs.perplexity.ai',
    models: [
      { id: 'sonar-pro', name: 'Sonar Pro', description: 'Recherche approfondie' },
      { id: 'sonar', name: 'Sonar', description: 'Rapide' },
    ],
  },
]

export const ALL_PROVIDERS = [
  ...TEXT_PROVIDERS,
  ...IMAGE_PROVIDERS,
  ...VIDEO_PROVIDERS,
  ...AUDIO_PROVIDERS,
  ...SEARCH_PROVIDERS,
]

export function getProvider(id: string): Provider | undefined {
  return ALL_PROVIDERS.find(p => p.id === id)
}
