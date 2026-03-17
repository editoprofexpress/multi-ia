import { NextRequest, NextResponse } from 'next/server'
import { getApiKey } from '@/lib/server/keys'

interface AudioRequest {
  provider: string
  model: string
  text: string
  voice?: string
  speed?: number
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as AudioRequest
  const { provider, model, text, voice, speed = 1.0 } = body

  const apiKey = getApiKey(provider)
  if (!apiKey) {
    return NextResponse.json(
      { error: `Provider "${provider}" non configuré.` },
      { status: 503 }
    )
  }

  try {
    const { url, init } = buildRequest(provider, model, text, voice, speed, apiKey)
    const response = await fetch(url, init)

    if (!response.ok) {
      const errText = await response.text()
      return NextResponse.json(
        { error: `Erreur API ${provider}: ${response.status} — ${errText}` },
        { status: response.status }
      )
    }

    // Audio responses are binary — pass through
    const audioBuffer = await response.arrayBuffer()
    const contentType = response.headers.get('content-type') || 'audio/mpeg'

    return new Response(audioBuffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="audio.mp3"`,
      },
    })
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
  text: string,
  voice: string | undefined,
  speed: number,
  apiKey: string
): { url: string; init: RequestInit } {
  switch (provider) {
    case 'elevenlabs':
      return {
        url: `https://api.elevenlabs.io/v1/text-to-speech/${voice || '21m00Tcm4TlvDq8ikWAM'}`,
        init: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'xi-api-key': apiKey },
          body: JSON.stringify({
            text,
            model_id: model,
            voice_settings: { stability: 0.5, similarity_boost: 0.5 },
          }),
        },
      }

    case 'openai-audio':
      return {
        url: 'https://api.openai.com/v1/audio/speech',
        init: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model,
            input: text,
            voice: voice || 'alloy',
            speed,
          }),
        },
      }

    default:
      return {
        url: 'https://api.openai.com/v1/audio/speech',
        init: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ model, input: text, voice: voice || 'alloy', speed }),
        },
      }
  }
}
