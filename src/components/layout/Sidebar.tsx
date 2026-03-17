'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  MessageSquare,
  Image,
  Video,
  Music,
  Search,
  Settings,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/chat', icon: MessageSquare, label: 'Chat', description: '11 providers' },
  { href: '/image', icon: Image, label: 'Images', description: '9 providers' },
  { href: '/video', icon: Video, label: 'Vidéo', description: '2 providers' },
  { href: '/audio', icon: Music, label: 'Audio', description: '2 providers' },
  { href: '/search', icon: Search, label: 'Recherche', description: '2 providers' },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-[220px] flex-shrink-0 bg-[#0d0d0d] border-r border-white/5 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-4 py-5 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">AI Hub</p>
            <p className="text-[10px] text-gray-500">25+ providers</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label, description }) => {
          const active = pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group',
                active
                  ? 'bg-white/10 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              )}
            >
              <Icon className={cn('w-4 h-4 flex-shrink-0', active && 'text-violet-400')} />
              <div className="min-w-0">
                <p className="text-sm font-medium leading-none">{label}</p>
                <p className="text-[10px] text-gray-600 mt-0.5">{description}</p>
              </div>
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-400" />
              )}
            </Link>
          )
        })}
      </nav>

      {/* Settings */}
      <div className="px-2 py-4 border-t border-white/5">
        <Link
          href="/settings"
          className={cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all',
            pathname.startsWith('/settings')
              ? 'bg-white/10 text-white'
              : 'text-gray-400 hover:text-white hover:bg-white/5'
          )}
        >
          <Settings className="w-4 h-4" />
          <div>
            <p className="text-sm font-medium">Paramètres</p>
            <p className="text-[10px] text-gray-600">Clés API</p>
          </div>
        </Link>
      </div>
    </aside>
  )
}
