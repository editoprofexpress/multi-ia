import { NextRequest, NextResponse } from 'next/server'
import { getApiKey } from '@/lib/server/keys'

interface SearchRequest {
  provider: string
  model: string
  query: string
  numResults?: number
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as SearchRequest
  const { provider, model, query, numResults = 10 } = body

  const apiKey = getApiKey(provider)
  if (!apiKey) {
    return NextResponse.json(
      { error: `Provider "${provider}" non configuré.` },
      { status: 503 }
    )
  }

  try {
    if (provider === 'serpapi') {
      const url = `https://serpapi.com/search.json?q=${encodeURIComponent(query)}&engine=${model}&api_key=${apiKey}&num=${numResults}`
      const response = await fetch(url)

      if (!response.ok) {
        const errText = await response.text()
        return NextResponse.json(
          { error: `Erreur SerpAPI: ${response.status} — ${errText}` },
          { status: response.status }
        )
      }

      const data = await response.json()
      return NextResponse.json(data)
    }

    if (provider === 'perplexity-search') {
      const response = await fetch('https://api.perplexity.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: query }],
        }),
      })

      if (!response.ok) {
        const errText = await response.text()
        return NextResponse.json(
          { error: `Erreur Perplexity: ${response.status} — ${errText}` },
          { status: response.status }
        )
      }

      const data = await response.json()
      const content =
        (data.choices as Array<{ message?: { content?: string } }>)?.[0]?.message?.content ||
        JSON.stringify(data)
      return NextResponse.json({ content })
    }

    return NextResponse.json({ error: 'Provider de recherche non supporté' }, { status: 400 })
  } catch (err) {
    return NextResponse.json(
      { error: `Erreur réseau: ${err instanceof Error ? err.message : 'Inconnue'}` },
      { status: 502 }
    )
  }
}
