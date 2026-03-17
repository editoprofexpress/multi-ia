'use client'

import { Message } from '@/stores/chat'
import { getProvider } from '@/lib/providers/registry'
import { User } from 'lucide-react'

interface MessageItemProps {
  message: Message
}

function parseMarkdown(text: string): string {
  return text
    .replace(/```(\w*)\n?([\s\S]*?)```/g, '<pre class="bg-black/40 border border-white/10 rounded-lg p-3 my-2 overflow-x-auto text-sm font-mono text-green-300"><code class="language-$1">$2</code></pre>')
    .replace(/`([^`]+)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-sm font-mono text-cyan-300">$1</code>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="font-semibold text-white">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em class="italic text-gray-200">$1</em>')
    .replace(/^## (.+)$/gm, '<h2 class="text-base font-bold text-white mt-3 mb-1">$1</h2>')
    .replace(/^# (.+)$/gm, '<h1 class="text-lg font-bold text-white mt-3 mb-1">$1</h1>')
    .replace(/^- (.+)$/gm, '<li class="ml-4 list-disc text-gray-200">$1</li>')
    .replace(/^(\d+)\. (.+)$/gm, '<li class="ml-4 list-decimal text-gray-200">$2</li>')
    .replace(/\n\n/g, '</p><p class="mb-2">')
    .replace(/\n/g, '<br/>')
}

export function MessageItem({ message }: MessageItemProps) {
  const isUser = message.role === 'user'
  const provider = message.providerId ? getProvider(message.providerId) : null

  if (isUser) {
    return (
      <div className="flex gap-3 justify-end">
        <div className="max-w-[80%]">
          <div className="bg-violet-600/20 border border-violet-500/15 rounded-2xl rounded-tr-md px-4 py-3">
            <p className="text-sm text-gray-100 whitespace-pre-wrap leading-relaxed">{message.content}</p>
          </div>
        </div>
        <div className="w-7 h-7 bg-violet-600/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
          <User className="w-3.5 h-3.5 text-violet-300" />
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 text-[9px] font-bold text-white"
        style={{ backgroundColor: provider?.color || '#6366f1' }}
      >
        {provider?.name?.slice(0, 2).toUpperCase() || 'IA'}
      </div>
      <div className="flex-1 min-w-0">
        {provider && (
          <p className="text-[11px] text-gray-500 mb-1 font-medium">
            {provider.name}
            {message.modelId && (
              <span className="text-gray-600 font-normal"> · {message.modelId.split('/').pop()?.split('-').slice(0, 3).join('-')}</span>
            )}
          </p>
        )}
        <div className="text-sm text-gray-200 leading-relaxed">
          {message.isStreaming && message.content === '' ? (
            <div className="flex gap-1.5 items-center py-2">
              <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-2 h-2 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          ) : (
            <div
              dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }}
              className="[&>p]:mb-2 [&>ul]:my-1 [&>ol]:my-1"
            />
          )}
          {message.isStreaming && message.content !== '' && (
            <span className="inline-block w-0.5 h-4 bg-violet-400 animate-pulse ml-0.5 align-middle" />
          )}
        </div>
      </div>
    </div>
  )
}
