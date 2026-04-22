import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { chat, Message } from '@/lib/openai'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { history, message }: { history: Message[]; message: string } = await req.json()
  if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 })

  const reply = await chat(history ?? [], message)
  return NextResponse.json({ reply })
}
