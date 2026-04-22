import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { listVoices } from '@/lib/elevenlabs'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const voices = await listVoices()
    return NextResponse.json(voices)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to load voices'
    console.error('[ElevenLabs voices]', message)
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
