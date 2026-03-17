import type { Metadata } from 'next'
import './globals.css'
import { Sidebar } from '@/components/layout/Sidebar'

export const metadata: Metadata = {
  title: 'AI Hub — 25+ providers en un seul endroit',
  description: 'Interface unifiée pour tous vos providers IA : chat, images, vidéo, audio, recherche.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="fr">
      <body className="antialiased bg-[#0d0d0d] text-white">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 min-w-0 overflow-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
