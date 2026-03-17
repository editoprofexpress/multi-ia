'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

// Settings page no longer needed for end users — redirect to chat
export default function SettingsPage() {
  const router = useRouter()
  useEffect(() => { router.replace('/chat') }, [router])
  return null
}
