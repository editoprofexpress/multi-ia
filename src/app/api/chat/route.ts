import { NextRequest, NextResponse } from 'next/server'
import { getApiKey } from '@/lib/server/keys'

interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

interface ChatRequest {
  provider: string
  model: string
  messages: ChatMessage[]
  temperature?: number
  max_tokens?: number
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as ChatRequest
  const { provider, model, messages, temperature = 0.7, max_tokens = 2048 } = body

  const apiKey = getApiKey(provider)
  if (!apiKey) {
    return NextResponse.json(
      { error: `Provider "${provider}" non configuré. Contactez l'administrateur.` },
      { status: 503 }
    )
  }

  try {
    const { url, init } = buildRequest(provider, model, messages, apiKey, temperature, max_tokens)
    const response = await fetch(url, init)

    if (!response.ok) {
      const errText = await response.text()
      return NextResponse.json(
        { error: `Erreur API ${provider}: ${response.status} — ${errText}` },
        { status: response.status }
      )
    }

    // Stream pass-through for providers that support it
    if (response.headers.get('content-type')?.includes('text/event-stream')) {
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          Connection: 'keep-alive',
        },
      })
    }

    // Non-streaming: parse and normalize response
    const data = await response.json()
    const content = extractContent(provider, data)
    return NextResponse.json({ content })
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
  messages: ChatMessage[],
  apiKey: string,
  temperature: number,
  maxTokens: number
): { url: string; init: RequestInit } {
  switch (provider) {
    case 'openai':
      return {
        url: 'https://api.openai.com/v1/chat/completions',
        init: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model, messages, temperature, max_tokens: maxTokens, stream: true,
          }),
        },
      }

    case 'anthropic': {
      const systemMsg = messages.find(m => m.role === 'system')
      const nonSystemMsgs = messages.filter(m => m.role !== 'system')
      return {
        url: 'https://api.anthropic.com/v1/messages',
        init: {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model,
            max_tokens: maxTokens,
            messages: nonSystemMsgs,
            ...(systemMsg ? { system: systemMsg.content } : {}),
            temperature,
          }),
        },
      }
    }

    case 'google':
      return {
        url: `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        init: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: messages
              .filter(m => m.role !== 'system')
              .map(m => ({
                role: m.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: m.content }],
              })),
            generationConfig: { temperature, maxOutputTokens: maxTokens },
          }),
        },
      }

    case 'mistral':
      return {
        url: 'https://api.mistral.ai/v1/chat/completions',
        init: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens, stream: true }),
        },
      }

    case 'xai':
      return {
        url: 'https://api.x.ai/v1/chat/completions',
        init: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens, stream: true }),
        },
      }

    case 'deepseek':
      return {
        url: 'https://api.deepseek.com/chat/completions',
        init: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens, stream: true }),
        },
      }

    case 'cohere':
      return {
        url: 'https://api.cohere.com/v2/chat',
        init: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens }),
        },
      }

    case 'perplexity':
      return {
        url: 'https://api.perplexity.ai/chat/completions',
        init: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens }),
        },
      }

    case 'openrouter':
      return {
        url: 'https://openrouter.ai/api/v1/chat/completions',
        init: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens, stream: true }),
        },
      }

    case 'together':
      return {
        url: 'https://api.together.xyz/v1/chat/completions',
        init: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens, stream: true }),
        },
      }

    case 'replicate':
      return {
        url: 'https://api.replicate.com/v1/predictions',
        init: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({
            model,
            input: {
              prompt: messages.filter(m => m.role === 'user').pop()?.content || '',
              temperature,
              max_tokens: maxTokens,
            },
          }),
        },
      }

    default:
      return {
        url: 'https://api.openai.com/v1/chat/completions',
        init: {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
          body: JSON.stringify({ model, messages, temperature, max_tokens: maxTokens }),
        },
      }
  }
}

function extractContent(provider: string, data: Record<string, unknown>): string {
  switch (provider) {
    case 'anthropic': {
      const content = data.content as Array<{ text?: string }> | undefined
      return content?.[0]?.text || JSON.stringify(data)
    }
    case 'google': {
      const candidates = data.candidates as Array<{
        content?: { parts?: Array<{ text?: string }> }
      }> | undefined
      return candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(data)
    }
    case 'cohere': {
      const msg = data.message as { content?: Array<{ text?: string }> } | undefined
      return msg?.content?.[0]?.text || (data as { text?: string }).text || JSON.stringify(data)
    }
    case 'replicate': {
      const output = data.output
      if (Array.isArray(output)) return output.join('')
      if (typeof output === 'string') return output
      return JSON.stringify(data)
    }
    default: {
      const choices = data.choices as Array<{
        message?: { content?: string }
      }> | undefined
      return choices?.[0]?.message?.content || JSON.stringify(data)
    }
  }
}
