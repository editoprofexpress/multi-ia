import { NextResponse } from 'next/server'
import { getAvailableProviders } from '@/lib/server/keys'

export async function GET() {
  const available = getAvailableProviders()
  return NextResponse.json({ providers: available })
}
