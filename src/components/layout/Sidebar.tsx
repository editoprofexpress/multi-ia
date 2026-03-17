'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  MessageSquare,
  Image,
  Video,
  Music,
  Search,
  Zap,
  Plus,
  Trash2,
  Menu,
  X,
} from 'lucide-react'
import { useState } from 'react'
import { useChatStore, ConversationCategory } from '@/stores/chat'
import { getProvider } from '@/lib/providers/registry'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/chat', icon: MessageSquare, label: 'Chat', category: 'chat' as ConversationCategory },
  { href: '/image', icon: Image, label: 'Images', category: 'image' as ConversationCategory },
  { href: '/video', icon: Video, label: 'Video', category: 'video' as ConversationCategory },
  { href: '/audio', icon: Music, label: 'Audio', category: 'audio' as ConversationCategory },
  { href: '/search', icon: Search, label: 'Recherche', category: 'search' as ConversationCategory },
]

function formatRelativeDate(date: Date): string {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return "A l'instant"
  if (minutes < 60) return `${minutes}min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}j`
  return new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })
}

export function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const {
    conversations,
    activeConversationId,
    setActiveConversation,
    createConversation,
    deleteConversation,
    getConversationsByCategory,
  } = useChatStore()

  // Find active category from pathname
  const activeCategory = NAV_ITEMS.find(item => pathname.startsWith(item.href))?.category || 'chat'
  const categoryConversations = getConversationsByCategory(activeCategory)

  const handleNewConversation = () => {
    createConversation(activeCategory)
  }

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="px-4 py-4 border-b border-white/5">
        <Link href="/chat" className="flex items-center gap-2.5" onClick={() => setMobileOpen(false)}>
          <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-violet-500/20">
            <Zap className="w-4.5 h-4.5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white tracking-tight">AI Hub</p>
            <p className="text-[10px] text-gray-500 -mt-0.5">by +DE</p>
          </div>
        </Link>
      </div>

      {/* Category navigation */}
      <div className="px-3 pt-3 pb-2">
        <div className="flex gap-1 bg-white/5 rounded-xl p-1">
          {NAV_ITEMS.map(({ href, icon: Icon, label, category }) => {
            const active = pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex-1 flex flex-col items-center gap-0.5 py-2 rounded-lg transition-all text-center',
                  active
                    ? 'bg-violet-600/80 text-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                )}
                title={label}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[9px] font-medium leading-none">{label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      {/* New conversation button */}
      <div className="px-3 py-2">
        <button
          onClick={handleNewConversation}
          className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-violet-500/30 text-gray-300 hover:text-white rounded-xl px-3 py-2.5 text-sm font-medium transition-all"
        >
          <Plus className="w-4 h-4" />
          Nouveau
        </button>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {categoryConversations.length === 0 ? (
          <div className="text-center py-8 px-4">
            <p className="text-xs text-gray-600">Aucune conversation</p>
            <p className="text-[10px] text-gray-700 mt-1">
              Cliquez sur Nouveau pour commencer
            </p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {categoryConversations.map(conv => {
              const provider = getProvider(conv.providerId)
              const isActive = conv.id === activeConversationId
              return (
                <div
                  key={conv.id}
                  className={cn(
                    'group flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-all',
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'
                  )}
                  onClick={() => setActiveConversation(conv.id)}
                >
                  {/* Provider color dot */}
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: provider?.color || '#6366f1' }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs truncate leading-tight">{conv.title}</p>
                    <p className="text-[10px] text-gray-600 mt-0.5">
                      {provider?.name || 'IA'} · {formatRelativeDate(conv.updatedAt)}
                    </p>
                  </div>
                  <button
                    onClick={e => { e.stopPropagation(); deleteConversation(conv.id) }}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-all rounded"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/5">
        <p className="text-[10px] text-gray-700 text-center">
          Propulse par +DE · {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
        </p>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="md:hidden fixed top-3 left-3 z-50 w-10 h-10 bg-[#111] border border-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 bg-black/60 z-30" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'w-[240px] flex-shrink-0 bg-[#0a0a0f] border-r border-white/5 flex flex-col h-screen sticky top-0',
        'md:relative md:translate-x-0',
        'max-md:fixed max-md:z-40 max-md:transition-transform max-md:duration-300',
        mobileOpen ? 'max-md:translate-x-0' : 'max-md:-translate-x-full'
      )}>
        {sidebarContent}
      </aside>
    </>
  )
}
