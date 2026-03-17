import { NextRequest, NextResponse } from 'next/server'
import { getApiKey } from '@/lib/server/keys'

interface VideoRequest {
  provider: string
  model: string
  prompt: string
  duration?: number
  ratio?: string
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as VideoRequest
  const { provider, model, prompt, duration = 5, ratio = '16:9' } = body

  const apiKey = getApiKey(provider)
  if (!apiKey) {
    return NextResponse.json(
      { error: `Provider "${provider}" non configuré.` },
      { status: 503 }
    )
  }

  try {
    const { url, init } = buildRequest(provider, model, prompt, duration, ratio, apiKey)
    const response = await fetch(url, init)

    if (!response.ok) {
      const errText = await response.text()
      return NextResponse.json(
        { error: `Erreur API ${provider}: ${response.status} — ${errText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (err) {
    return NextResponse.json(
      { error: `Erreur réseau: ${err instanceof Error ? err.message : 'Inconnue'}` },
      { status: 502 }
    )
  }
}

function buildRequest(
  provider: string,
  model: string,
  prompt: string,
  duration: number,
  _ratio: string,
  apiKey: string
): { url: string; init: RequestInit } {
  switch (provider) {
    case 'runway-video':
      return {
        url: 'https://api.dev.runwayml.com/v1/image_to_video',
        init: {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'X-Runway-Version': '2024-11-06',
          },
          body: JSON.stringify({ model, promptText: prompt, duration }),
        },
      }

    case 'pika':
      return {
        url: 'https://api.pika.art/v1/generate',
        init: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ prompt, model }),
        },
      }

    default:
      return {
        url: 'https://api.dev.runwayml.com/v1/image_to_video',
        init: {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'X-Runway-Version': '2024-11-06',
          },
          body: JSON.stringify({ model, promptText: prompt, duration }),
        },
      }
  }
}
