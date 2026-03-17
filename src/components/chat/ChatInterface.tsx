'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, ChevronDown, Check, Sparkles } from 'lucide-react'
import { useChatStore } from '@/stores/chat'
import { useProvidersStore } from '@/stores/settings'
import { MessageItem } from './MessageItem'
import { TEXT_PROVIDERS, Provider } from '@/lib/providers/registry'
import { ProviderBadge } from '@/components/ProviderBadge'
import { getMockTextResponse, streamMockText } from '@/lib/mock/responses'
import { cn } from '@/lib/utils'

function ModelPicker({
  selectedProvider,
  selectedModel,
  onProviderChange,
  onModelChange,
}: {
  selectedProvider: string
  selectedModel: string
  onProviderChange: (id: string) => void
  onModelChange: (id: string) => void
}) {
  const [open, setOpen] = useState(false)
  const { isAvailable, loaded } = useProvidersStore()
  const provider = TEXT_PROVIDERS.find(p => p.id === selectedProvider) ?? TEXT_PROVIDERS[0]
  const model = provider.models.find(m => m.id === selectedModel) ?? provider.models[0]

  const handleSelect = (p: Provider, m?: string) => {
    onProviderChange(p.id)
    onModelChange(m || p.models[0].id)
    if (m) setOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2.5 bg-white/5 hover:bg-white/8 border border-white/10 rounded-xl px-3.5 py-2.5 transition-all"
      >
        <ProviderBadge provider={provider} size="sm" />
        <div className="text-left">
          <p className="text-sm font-medium text-white leading-none">{provider.name}</p>
          <p className="text-[11px] text-gray-400 mt-0.5">{model.name}</p>
        </div>
        <ChevronDown className={cn('w-4 h-4 text-gray-400 transition-transform ml-1', open && 'rotate-180')} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-2 w-80 bg-[#141418] border border-white/10 rounded-2xl shadow-2xl z-20 overflow-hidden">
            <div className="p-2 border-b border-white/5">
              <p className="text-[10px] text-gray-500 uppercase tracking-wider px-2 py-1">Choisir une IA</p>
            </div>
            <div className="max-h-[420px] overflow-y-auto p-1.5">
              {TEXT_PROVIDERS.map(p => {
                const isSelected = p.id === selectedProvider
                const available = loaded && isAvailable(p.id)
                return (
                  <div key={p.id}>
                    <button
                      onClick={() => handleSelect(p)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all',
                        isSelected ? 'bg-violet-600/15' : 'hover:bg-white/5'
                      )}
                    >
                      <ProviderBadge provider={p} size="sm" />
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-white">{p.name}</p>
                          {!available && loaded && (
                            <span className="text-[9px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full">demo</span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 truncate">{p.description}</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-violet-400 flex-shrink-0" />}
                    </button>

                    {/* Model sub-list */}
                    {isSelected && (
                      <div className="ml-9 mr-2 mb-1 mt-0.5 space-y-0.5">
                        {p.models.map(m => (
                          <button
                            key={m.id}
                            onClick={() => handleSelect(p, m.id)}
                            className={cn(
                              'w-full flex items-center justify-between px-3 py-1.5 rounded-lg text-left transition-all',
                              m.id === selectedModel
                                ? 'bg-violet-500/10 text-violet-300'
                                : 'hover:bg-white/5 text-gray-400 hover:text-gray-200'
                            )}
                          >
                            <span className="text-xs">{m.name}</span>
                            {m.id === selectedModel && <Check className="w-3 h-3 text-violet-400" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const SUGGESTIONS = [
  'Explique-moi le machine learning simplement',
  'Ecris un poeme sur la technologie',
  'Quelles sont les tendances IA en 2025 ?',
  'Aide-moi a rediger un email professionnel',
]

export function ChatInterface() {
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const {
    activeConversationId,
    selectedProvider,
    selectedModel,
    isLoading,
    systemPrompt,
    createConversation,
    addMessage,
    updateMessage,
    setMessageStreaming,
    setSelectedProvider,
    setSelectedModel,
    setLoading,
    getActiveConversation,
  } = useChatStore()

  const { isAvailable, fetchProviders, loaded } = useProvidersStore()
  const activeConversation = getActiveConversation()

  // Only show this chat interface if active conversation is chat category or no conversation
  const showChat = !activeConversation || activeConversation.category === 'chat'

  useEffect(() => {
    if (!loaded) fetchProviders()
  }, [loaded, fetchProviders])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConversation?.messages])

  const handleSend = async (text?: string) => {
    const userContent = (text || input).trim()
    if (!userContent || isLoading) return

    let convId = activeConversationId
    if (!convId || !showChat) {
      convId = createConversation('chat')
    }

    setInput('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    addMessage(convId, {
      role: 'user',
      content: userContent,
      providerId: selectedProvider,
      modelId: selectedModel,
    })

    const assistantId = addMessage(convId, {
      role: 'assistant',
      content: '',
      providerId: selectedProvider,
      modelId: selectedModel,
      isStreaming: true,
    })

    setLoading(true)

    try {
      const providerReady = isAvailable(selectedProvider)

      if (!providerReady) {
        const mockResponse = getMockTextResponse(selectedProvider)
        let accumulated = ''
        for await (const chunk of streamMockText(mockResponse)) {
          accumulated += chunk
          updateMessage(convId, assistantId, accumulated)
        }
      } else {
        // Get all previous messages from the active conversation
        const conv = useChatStore.getState().conversations.find(c => c.id === convId)
        const allMessages = (conv?.messages || [])
          .filter(m => !m.isStreaming && m.content && m.role !== 'system')
          .map(m => ({ role: m.role, content: m.content }))

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider: selectedProvider,
            model: selectedModel,
            messages: [
              ...(systemPrompt ? [{ role: 'system', content: systemPrompt }] : []),
              ...allMessages,
            ],
          }),
        })

        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }))
          throw new Error(err.error || `Erreur ${res.status}`)
        }

        const contentType = res.headers.get('content-type') || ''
        if (contentType.includes('text/event-stream')) {
          const reader = res.body?.getReader()
          const decoder = new TextDecoder()
          let accumulated = ''

          if (reader) {
            while (true) {
              const { done, value } = await reader.read()
              if (done) break
              const chunk = decoder.decode(value, { stream: true })
              for (const line of chunk.split('\n')) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6)
                  if (data === '[DONE]') continue
                  try {
                    const json = JSON.parse(data)
                    const content = json.choices?.[0]?.delta?.content ?? ''
                    accumulated += content
                    updateMessage(convId, assistantId, accumulated)
                  } catch { /* skip */ }
                }
              }
            }
          }
        } else {
          const data = await res.json()
          updateMessage(convId, assistantId, data.content || JSON.stringify(data))
        }
      }
    } catch (err) {
      updateMessage(convId, assistantId, `Erreur : ${err instanceof Error ? err.message : 'Inconnue'}`)
    } finally {
      setMessageStreaming(convId, assistantId, false)
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    e.target.style.height = 'auto'
    e.target.style.height = Math.min(e.target.scrollHeight, 200) + 'px'
  }

  const hasMessages = showChat && activeConversation && activeConversation.messages.length > 0

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-white/5 bg-[#0d0d0d]/80 backdrop-blur-sm">
        <div className="md:ml-0 ml-12">
          <ModelPicker
            selectedProvider={selectedProvider}
            selectedModel={selectedModel}
            onProviderChange={setSelectedProvider}
            onModelChange={setSelectedModel}
          />
        </div>
      </div>

      {/* Messages or Welcome */}
      <div className="flex-1 overflow-y-auto">
        {!hasMessages ? (
          /* Welcome screen */
          <div className="h-full flex flex-col items-center justify-center px-6 pb-20">
            <div className="w-16 h-16 bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-white/10 rounded-2xl flex items-center justify-center mb-6">
              <Sparkles className="w-7 h-7 text-violet-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Bonjour !</h1>
            <p className="text-sm text-gray-500 max-w-md text-center mb-8">
              Choisissez une IA ci-dessus et posez votre question.
              Vous pouvez changer d'IA a tout moment.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg w-full">
              {SUGGESTIONS.map(s => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  className="text-left text-sm text-gray-400 bg-white/5 hover:bg-white/8 border border-white/5 hover:border-violet-500/20 rounded-xl px-4 py-3 transition-all"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Messages */
          <div className="max-w-3xl mx-auto px-4 md:px-6 py-6 space-y-6">
            {activeConversation!.messages.map(msg => (
              <MessageItem key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-white/5 bg-[#0d0d0d]">
        <div className="max-w-3xl mx-auto px-4 md:px-6 py-4">
          <div className="flex items-end gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-violet-500/40 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Posez votre question..."
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 resize-none focus:outline-none min-h-[24px] max-h-[200px]"
              rows={1}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center transition-all flex-shrink-0',
                input.trim() && !isLoading
                  ? 'bg-violet-600 hover:bg-violet-500 text-white'
                  : 'bg-white/5 text-gray-600 cursor-not-allowed'
              )}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
