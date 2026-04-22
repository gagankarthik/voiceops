import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { listAppointments, putAppointment, deleteAppointment } from '@/lib/dynamodb'
import { randomUUID } from 'crypto'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return NextResponse.json(await listAppointments(session.userId))
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const appt = {
    apptId: randomUUID(),
    userId: session.userId,
    customerPhone: body.customerPhone ?? '',
    customerName: body.customerName ?? '',
    date: body.date,
    time: body.time,
    status: 'scheduled' as const,
    createdAt: new Date().toISOString(),
  }
  await putAppointment(appt)
  return NextResponse.json(appt, { status: 201 })
}

export async function DELETE(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { apptId, date } = await req.json()
  if (!apptId || !date) return NextResponse.json({ error: 'apptId and date required' }, { status: 400 })

  await deleteAppointment(session.userId, date, apptId)
  return NextResponse.json({ ok: true })
}
