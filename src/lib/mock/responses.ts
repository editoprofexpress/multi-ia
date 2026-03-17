// Mock responses for demo mode (no API keys needed)

export const MOCK_TEXT_RESPONSES: Record<string, string[]> = {
  default: [
    "Bonjour ! Je suis en mode démo. Connectez votre clé API dans les **Paramètres** pour activer les vraies réponses.\n\nEn attendant, je peux simuler une conversation complète avec streaming, markdown, et code :\n\n```python\ndef hello_world():\n    print(\"Hello from AI Hub!\")\n    return True\n```\n\nL'interface supporte le **markdown**, les `blocs de code`, les listes, et plus encore.",
    "Voici une réponse simulée avec du contenu riche :\n\n## Fonctionnalités disponibles\n\n- **Chat** multi-providers avec streaming\n- **Images** : DALL-E, Stable Diffusion, Flux...\n- **Vidéo** : Runway, Pika Labs\n- **Audio** : ElevenLabs, OpenAI TTS\n- **Recherche** : SerpAPI, Perplexity\n\nAjoutez vos clés API dans ⚙️ Paramètres pour tout activer !",
    "En mode démo, toutes les fonctionnalités sont simulées.\n\nPour activer ce provider :\n1. Allez dans **Paramètres** (icône ⚙️)\n2. Entrez votre clé API\n3. Revenez ici et relancez votre message\n\nVos clés sont stockées **localement** dans votre navigateur et ne transitent jamais sur un serveur tiers.",
  ],
  openai: [
    "Je suis GPT-4o en mode démo. Avec une vraie clé API, je répondrai avec la puissance complète d'OpenAI : raisonnement avancé, vision, génération de code, et plus encore.",
  ],
  anthropic: [
    "Je suis Claude en mode démo. Avec une vraie clé API Anthropic, je serai disponible pour des tâches complexes d'analyse, de rédaction et de programmation.",
  ],
  deepseek: [
    "Je suis DeepSeek en mode démo. DeepSeek R1 est particulièrement fort en raisonnement mathématique et en code. Ajoutez votre clé API pour en profiter.",
  ],
}

export const MOCK_IMAGE_URLS = [
  'https://placehold.co/1024x1024/1a1a2e/ffffff?text=Image+IA+%E2%80%94+D%C3%A9mo',
  'https://placehold.co/1024x1024/16213e/4fc3f7?text=Ajoutez+votre+cl%C3%A9+API',
  'https://placehold.co/1024x1024/0f3460/e94560?text=Image+g%C3%A9n%C3%A9r%C3%A9e+par+IA',
]

export function getMockTextResponse(providerId: string): string {
  const specific = MOCK_TEXT_RESPONSES[providerId]
  if (specific) {
    return specific[Math.floor(Math.random() * specific.length)]
  }
  const defaults = MOCK_TEXT_RESPONSES.default
  return defaults[Math.floor(Math.random() * defaults.length)]
}

export function getMockImageUrl(): string {
  return MOCK_IMAGE_URLS[Math.floor(Math.random() * MOCK_IMAGE_URLS.length)]
}

export async function* streamMockText(text: string): AsyncGenerator<string> {
  const words = text.split(' ')
  for (const word of words) {
    yield word + ' '
    await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 40))
  }
}
