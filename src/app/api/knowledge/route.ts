import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { listKnowledge, putKnowledge, deleteKnowledge } from '@/lib/dynamodb'
import { randomUUID } from 'crypto'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await listKnowledge(session.userId))
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { title, content, type } = await req.json()
  if (!title || !content) return NextResponse.json({ error: 'title and content required' }, { status: 400 })

  const entry = {
    knowledgeId: randomUUID(),
    userId: session.userId,
    title,
    content,
    type: type ?? 'general',
    createdAt: new Date().toISOString(),
  }
  await putKnowledge(entry)
  return NextResponse.json(entry, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { knowledgeId } = await req.json()
  if (!knowledgeId) return NextResponse.json({ error: 'knowledgeId required' }, { status: 400 })

  await deleteKnowledge(session.userId, knowledgeId)
  return NextResponse.json({ ok: true })
}
