import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { listAvailableNumbers, provisionNumber } from '@/lib/twilio'
import { getBusinessConfig, putBusinessConfig } from '@/lib/dynamodb'

// GET  /api/twilio/provision?areaCode=512  → list available numbers
// POST /api/twilio/provision                → provision selected number
export async function GET(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const areaCode = req.nextUrl.searchParams.get('areaCode') ?? undefined
  try {
    const numbers = await listAvailableNumbers(areaCode)
    return NextResponse.json(numbers)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { phoneNumber } = await req.json()
  if (!phoneNumber) return NextResponse.json({ error: 'phoneNumber required' }, { status: 400 })

  const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
  const webhookBase = `${base}?uid=${session.userId}`

  try {
    const provisioned = await provisionNumber(phoneNumber, `${base}/api/twilio/incoming?uid=${session.userId}`)
    const existing = await getBusinessConfig(session.userId)
    if (existing) {
      await putBusinessConfig({
        ...existing,
        twilioNumber: provisioned.phoneNumber,
        twilioSid: provisioned.sid,
        updatedAt: new Date().toISOString(),
      })
    }
    return NextResponse.json(provisioned)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
