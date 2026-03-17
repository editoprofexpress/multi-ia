'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Plus, Trash2, Settings2 } from 'lucide-react'
import { useChatStore } from '@/stores/chat'
import { useProvidersStore } from '@/stores/settings'
import { MessageItem } from './MessageItem'
import { ProviderSelector } from './ProviderSelector'
import { getMockTextResponse, streamMockText } from '@/lib/mock/responses'
import { cn } from '@/lib/utils'

export function ChatInterface() {
  const [input, setInput] = useState('')
  const [showSystemPrompt, setShowSystemPrompt] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const {
    conversations,
    activeConversationId,
    selectedProvider,
    selectedModel,
    isLoading,
    systemPrompt,
    createConversation,
    setActiveConversation,
    addMessage,
    updateMessage,
    setMessageStreaming,
    setSelectedProvider,
    setSelectedModel,
    setLoading,
    setSystemPrompt,
    deleteConversation,
    getActiveConversation,
  } = useChatStore()

  const { isAvailable, fetchProviders, loaded } = useProvidersStore()
  const activeConversation = getActiveConversation()

  useEffect(() => {
    if (!loaded) fetchProviders()
  }, [loaded, fetchProviders])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConversation?.messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    let convId = activeConversationId
    if (!convId) {
      convId = createConversation()
    }

    const userContent = input.trim()
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
        // Demo mode — provider not configured server-side
        const mockResponse = getMockTextResponse(selectedProvider)
        let accumulated = ''
        for await (const chunk of streamMockText(mockResponse)) {
          accumulated += chunk
          updateMessage(convId, assistantId, accumulated)
        }
      } else {
        // Real API call via our server proxy
        const allMessages = (activeConversation?.messages || [])
          .filter(m => !m.isStreaming && m.content)
          .map(m => ({ role: m.role, content: m.content }))
        allMessages.push({ role: 'user', content: userContent })

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

        // Check if streaming response
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
              const lines = chunk.split('\n')
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const data = line.slice(6)
                  if (data === '[DONE]') continue
                  try {
                    const json = JSON.parse(data)
                    const content = json.choices?.[0]?.delta?.content ?? ''
                    accumulated += content
                    updateMessage(convId, assistantId, accumulated)
                  } catch { /* skip malformed chunks */ }
                }
              }
            }
          }
        } else {
          // Non-streaming JSON response
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

  const providerActive = isAvailable(selectedProvider)

  return (
    <div className="flex h-screen">
      {/* Conversations sidebar */}
      <div className="w-52 flex-shrink-0 bg-[#111] border-r border-white/5 flex flex-col">
        <div className="p-3 border-b border-white/5">
          <button
            onClick={() => { createConversation() }}
            className="w-full flex items-center gap-2 bg-violet-600/20 hover:bg-violet-600/30 border border-violet-500/20 text-violet-300 rounded-lg px-3 py-2 text-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            Nouveau chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {conversations.length === 0 && (
            <p className="text-xs text-gray-600 text-center mt-4 px-2">Commencez une conversation</p>
          )}
          {conversations.map(conv => (
            <div
              key={conv.id}
              className={cn(
                'group flex items-center gap-2 px-2 py-2 rounded-lg cursor-pointer transition-all',
                conv.id === activeConversationId
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:bg-white/5 hover:text-white'
              )}
              onClick={() => setActiveConversation(conv.id)}
            >
              <span className="flex-1 text-xs truncate">{conv.title}</span>
              <button
                onClick={e => { e.stopPropagation(); deleteConversation(conv.id) }}
                className="opacity-0 group-hover:opacity-100 p-0.5 hover:text-red-400 transition-all"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main chat */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-[#0d0d0d]">
          <ProviderSelector
            selectedProvider={selectedProvider}
            selectedModel={selectedModel}
            onProviderChange={setSelectedProvider}
            onModelChange={setSelectedModel}
          />
          <div className="flex items-center gap-2">
            {!providerActive && loaded && (
              <span className="text-[10px] text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded-lg">
                Demo
              </span>
            )}
            <button
              onClick={() => setShowSystemPrompt(!showSystemPrompt)}
              className={cn(
                'flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all',
                showSystemPrompt
                  ? 'bg-white/10 border-white/20 text-white'
                  : 'border-white/10 text-gray-500 hover:text-white hover:border-white/20'
              )}
            >
              <Settings2 className="w-3.5 h-3.5" />
              Systeme
            </button>
          </div>
        </div>

        {/* System prompt */}
        {showSystemPrompt && (
          <div className="px-4 py-2 border-b border-white/5 bg-black/20">
            <textarea
              value={systemPrompt}
              onChange={e => setSystemPrompt(e.target.value)}
              placeholder="Prompt systeme (ex : Tu es un expert en Python. Reponds toujours en francais.)"
              className="w-full bg-transparent text-xs text-gray-300 placeholder-gray-600 resize-none focus:outline-none"
              rows={2}
            />
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {!activeConversation || activeConversation.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-violet-500/20 to-cyan-500/20 border border-white/10 rounded-2xl flex items-center justify-center mb-4">
                <span className="text-2xl">&#10022;</span>
              </div>
              <h2 className="text-lg font-semibold text-white mb-1">Que voulez-vous faire ?</h2>
              <p className="text-sm text-gray-500 max-w-sm">
                Selectionnez un provider ci-dessus et commencez a ecrire.
              </p>
              <div className="grid grid-cols-2 gap-2 mt-6 max-w-md">
                {[
                  'Explique le machine learning simplement',
                  'Ecris un composant React en TypeScript',
                  'Resume les actualites IA du moment',
                  'Traduis ce texte en anglais',
                ].map(suggestion => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="text-left text-xs text-gray-400 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg px-3 py-2.5 transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            activeConversation.messages.map(msg => (
              <MessageItem key={msg.id} message={msg} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-4 border-t border-white/5 bg-[#0d0d0d]">
          <div className="flex items-end gap-3 bg-white/5 border border-white/10 rounded-2xl px-4 py-3 focus-within:border-violet-500/50 transition-all">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder="Ecrivez votre message... (Entree pour envoyer, Maj+Entree pour sauter une ligne)"
              className="flex-1 bg-transparent text-sm text-white placeholder-gray-600 resize-none focus:outline-none min-h-[24px] max-h-[200px]"
              rows={1}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="w-8 h-8 bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg flex items-center justify-center transition-all flex-shrink-0"
            >
              <Send className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
