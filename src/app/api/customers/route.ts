import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { listCustomers, deleteCustomer } from '@/lib/dynamodb'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await listCustomers(session.userId))
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { phone } = await req.json()
  if (!phone) return NextResponse.json({ error: 'phone required' }, { status: 400 })

  await deleteCustomer(session.userId, phone)
  return NextResponse.json({ ok: true })
}
