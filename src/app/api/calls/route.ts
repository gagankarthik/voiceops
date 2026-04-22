import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { listCalls, putCall } from '@/lib/dynamodb'
import { extractCallData } from '@/lib/openai'
import { randomUUID } from 'crypto'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const calls = await listCalls(session.userId)
  return NextResponse.json(calls)
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { phone, transcript, duration } = await req.json()
  if (!transcript) return NextResponse.json({ error: 'Transcript required' }, { status: 400 })

  const extracted = await extractCallData(transcript)

  const call = {
    callId: randomUUID(),
    userId: session.userId,
    phone: phone ?? extracted.phone ?? 'Unknown',
    transcript,
    summary: extracted.summary ?? '',
    duration: duration ?? 0,
    status: 'completed' as const,
    timestamp: new Date().toISOString(),
  }

  await putCall(call)
  return NextResponse.json(call, { status: 201 })
}
