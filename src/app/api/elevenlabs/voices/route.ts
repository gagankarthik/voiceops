import { NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { listVoices } from '@/lib/elevenlabs'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  try {
    const voices = await listVoices()
    return NextResponse.json(voices)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
