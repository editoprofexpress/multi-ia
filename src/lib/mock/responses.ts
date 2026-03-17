// Mock responses for demo mode (provider not configured on the server)

export const MOCK_TEXT_RESPONSES: Record<string, string[]> = {
  default: [
    "Bonjour ! Je suis en mode demo. Voici un apercu de ce que cette IA pourra faire une fois activee.\n\nL'interface supporte le **markdown**, les `blocs de code`, les listes, et plus encore :\n\n```python\ndef hello_world():\n    print(\"Hello from AI Hub!\")\n    return True\n```\n\nUne fois le service actif, vous beneficierez de reponses completes et en temps reel.",
    "Voici une reponse simulee avec du contenu riche :\n\n## Fonctionnalites disponibles\n\n- **Chat** multi-providers avec streaming\n- **Images** : DALL-E, Stable Diffusion, Flux...\n- **Video** : Runway, Pika Labs\n- **Audio** : ElevenLabs, OpenAI TTS\n- **Recherche** : SerpAPI, Perplexity\n\nToutes ces fonctionnalites seront accessibles dans la version complete !",
    "En mode demo, toutes les fonctionnalites sont simulees.\n\nDans la version complete, chaque provider sera operationnel avec des reponses en temps reel, du streaming, et un historique complet de vos conversations.\n\nN'hesitez pas a explorer toutes les sections de l'application !",
  ],
  openai: [
    "Je suis GPT-4o en mode demo. Dans la version complete, je pourrai vous aider avec le raisonnement avance, la vision, la generation de code, et bien plus encore.",
  ],
  anthropic: [
    "Je suis Claude en mode demo. Dans la version complete, je serai disponible pour des taches complexes d'analyse, de redaction et de programmation.",
  ],
  deepseek: [
    "Je suis DeepSeek en mode demo. DeepSeek R1 est particulierement fort en raisonnement mathematique et en code.",
  ],
}

export const MOCK_IMAGE_URLS = [
  'https://placehold.co/1024x1024/1a1a2e/ffffff?text=Image+IA+Demo',
  'https://placehold.co/1024x1024/16213e/4fc3f7?text=Generation+IA',
  'https://placehold.co/1024x1024/0f3460/e94560?text=Image+generee',
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
