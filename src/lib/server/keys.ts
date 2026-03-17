// Server-side only — maps provider IDs to their environment variable keys
// and resolves the actual API key from process.env

const PROVIDER_TO_ENV: Record<string, string> = {
  // Text
  openai: 'OPENAI_API_KEY',
  anthropic: 'ANTHROPIC_API_KEY',
  google: 'GOOGLE_API_KEY',
  mistral: 'MISTRAL_API_KEY',
  xai: 'XAI_API_KEY',
  deepseek: 'DEEPSEEK_API_KEY',
  cohere: 'COHERE_API_KEY',
  perplexity: 'PERPLEXITY_API_KEY',
  openrouter: 'OPENROUTER_API_KEY',
  together: 'TOGETHER_API_KEY',
  replicate: 'REPLICATE_API_KEY',
  // Image (some share keys with text providers)
  'openai-image': 'OPENAI_API_KEY',
  stability: 'STABILITY_API_KEY',
  ideogram: 'IDEOGRAM_API_KEY',
  leonardo: 'LEONARDO_API_KEY',
  runway: 'RUNWAY_API_KEY',
  krea: 'KREA_API_KEY',
  getimg: 'GETIMG_API_KEY',
  scenario: 'SCENARIO_API_KEY',
  flux: 'REPLICATE_API_KEY',
  // Video
  'runway-video': 'RUNWAY_API_KEY',
  pika: 'PIKA_API_KEY',
  // Audio
  elevenlabs: 'ELEVENLABS_API_KEY',
  'openai-audio': 'OPENAI_API_KEY',
  // Search
  serpapi: 'SERPAPI_KEY',
  'perplexity-search': 'PERPLEXITY_API_KEY',
}

export function getApiKey(providerId: string): string | undefined {
  const envVar = PROVIDER_TO_ENV[providerId]
  if (!envVar) return undefined
  return process.env[envVar]
}

export function getAvailableProviders(): string[] {
  return Object.entries(PROVIDER_TO_ENV)
    .filter(([, envVar]) => !!process.env[envVar])
    .map(([providerId]) => providerId)
}

export function isProviderAvailable(providerId: string): boolean {
  return !!getApiKey(providerId)
}
