import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { getBusinessConfig } from '@/lib/dynamodb'
import { makeOutboundCall } from '@/lib/twilio'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let phone: string
  try {
    const body = await req.json()
    phone = body.phone
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!phone?.trim()) {
    return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
  }

  const business = await getBusinessConfig(session.userId)
  if (!business?.twilioNumber) {
    return NextResponse.json(
      { error: 'No Twilio number configured. Complete onboarding first.' },
      { status: 400 }
    )
  }

  const host = req.headers.get('host') ?? 'localhost:3000'
  const protocol = host.startsWith('localhost') ? 'http' : 'https'
  const baseUrl = `${protocol}://${host}`

  try {
    const call = await makeOutboundCall(
      phone.trim(),
      business.twilioNumber,
      `${baseUrl}/api/twilio/incoming?uid=${session.userId}`
    )
    return NextResponse.json({ callSid: call.sid, status: call.status })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to initiate call'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
