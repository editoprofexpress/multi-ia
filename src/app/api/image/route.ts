import { NextRequest, NextResponse } from 'next/server'
import { getApiKey } from '@/lib/server/keys'

interface ImageRequest {
  provider: string
  model: string
  prompt: string
  negativePrompt?: string
  size?: string
  style?: string
  count?: number
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as ImageRequest
  const { provider, model, prompt, negativePrompt, size = '1024x1024', count = 1 } = body

  const apiKey = getApiKey(provider)
  if (!apiKey) {
    return NextResponse.json(
      { error: `Provider "${provider}" non configuré.` },
      { status: 503 }
    )
  }

  try {
    const { url, init } = buildRequest(provider, model, prompt, negativePrompt, size, count, apiKey)
    const response = await fetch(url, init)

    if (!response.ok) {
      const errText = await response.text()
      return NextResponse.json(
        { error: `Erreur API ${provider}: ${response.status} — ${errText}` },
        { status: response.status }
      )
    }

    const data = await response.json()
    const images = extractImages(provider, data)
    return NextResponse.json({ images })
  } catch (err) {
    return NextResponse.json(
      { error: `Erreur réseau: ${err instanceof Error ? err.message : 'Inconnue'}` },
      { status: 502 }
    )
  }
}

function parseDimensions(size: string): { width: number; height: number } {
  const cleaned = size.replace('×', 'x')
  const [w, h] = cleaned.split('x').map(Number)
  return { width: w || 1024, height: h || 1024 }
}

function buildRequest(
  provider: string,
  model: string,
  prompt: string,
  negativePrompt: string | undefined,
  size: string,
  count: number,
  apiKey: string
): { url: string; init: RequestInit } {
  const { width, height } = parseDimensions(size)

  switch (provider) {
    case 'openai-image':
      return {
        url: 'https://api.openai.com/v1/images/generations',
        init: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model,
            prompt,
            n: count,
            size: `${width}x${height}`,
            quality: 'standard',
          }),
        },
      }

    case 'stability':
      return {
        url: `https://api.stability.ai/v1/generation/${model}/text-to-image`,
        init: {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            Accept: 'application/json',
          },
          body: JSON.stringify({
            text_prompts: [
              { text: prompt, weight: 1 },
              ...(negativePrompt ? [{ text: negativePrompt, weight: -1 }] : []),
            ],
            cfg_scale: 7,
            steps: 30,
            width,
            height,
            samples: count,
          }),
        },
      }

    case 'ideogram':
      return {
        url: 'https://api.ideogram.ai/generate',
        init: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Api-Key': apiKey },
          body: JSON.stringify({
            image_request: { prompt, model, aspect_ratio: 'ASPECT_1_1' },
          }),
        },
      }

    case 'leonardo':
      return {
        url: 'https://cloud.leonardo.ai/api/rest/v1/generations',
        init: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            prompt,
            modelId: model,
            width,
            height,
            num_images: count,
            ...(negativePrompt ? { negative_prompt: negativePrompt } : {}),
          }),
        },
      }

    case 'flux':
    case 'replicate-image':
      return {
        url: 'https://api.replicate.com/v1/predictions',
        init: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model,
            input: { prompt, width, height },
          }),
        },
      }

    case 'krea':
      return {
        url: 'https://api.krea.ai/v1/generate',
        init: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ prompt }),
        },
      }

    case 'getimg':
      return {
        url: 'https://api.getimg.ai/v1/stable-diffusion-xl/text-to-image',
        init: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            prompt,
            model,
            width,
            height,
            output_format: 'png',
            ...(negativePrompt ? { negative_prompt: negativePrompt } : {}),
          }),
        },
      }

    case 'scenario':
      return {
        url: 'https://api.cloud.scenario.com/v1/generate',
        init: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ prompt }),
        },
      }

    default:
      return {
        url: 'https://api.openai.com/v1/images/generations',
        init: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ model, prompt, n: count, size: `${width}x${height}` }),
        },
      }
  }
}

interface ImageResult {
  url?: string
  b64?: string
}

function extractImages(provider: string, data: Record<string, unknown>): ImageResult[] {
  switch (provider) {
    case 'openai-image': {
      const items = data.data as Array<{ url?: string; b64_json?: string }> | undefined
      return (items || []).map(i => (i.url ? { url: i.url } : { b64: i.b64_json }))
    }
    case 'stability': {
      const artifacts = data.artifacts as Array<{ base64?: string }> | undefined
      return (artifacts || []).map(a => ({ b64: a.base64 }))
    }
    case 'ideogram': {
      const items = data.data as Array<{ url?: string }> | undefined
      return (items || []).map(i => ({ url: i.url }))
    }
    case 'leonardo': {
      const job = data.sdGenerationJob as { generationId?: string } | undefined
      return [{ url: `leonardo:pending:${job?.generationId || 'unknown'}` }]
    }
    case 'flux':
    case 'replicate-image': {
      const output = data.output
      if (Array.isArray(output)) return output.map((u: string) => ({ url: u }))
      if (typeof output === 'string') return [{ url: output }]
      const urls = data.urls as { get?: string } | undefined
      return [{ url: urls?.get || '' }]
    }
    case 'getimg': {
      const image = data.image as string | undefined
      return image ? [{ b64: image }] : []
    }
    default:
      return [{ url: JSON.stringify(data) }]
  }
}
