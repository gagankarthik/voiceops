import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/session'
import { putBusinessConfig, getBusinessConfig } from '@/lib/dynamodb'

export async function POST(req: NextRequest) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const existing = await getBusinessConfig(session.userId)

  await putBusinessConfig({
    userId: session.userId,
    type: body.type ?? existing?.type ?? '',
    name: body.name ?? existing?.name ?? '',
    phone: body.phone ?? existing?.phone,
    address: body.address ?? existing?.address,
    hours: body.hours ?? existing?.hours ?? {},
    services: body.services ?? existing?.services ?? [],
    tone: body.tone ?? existing?.tone ?? 'friendly',
    language: body.language ?? existing?.language ?? 'English',
    twilioNumber: body.twilioNumber ?? existing?.twilioNumber,
    twilioSid: body.twilioSid ?? existing?.twilioSid,
    elevenLabsVoiceId: body.elevenLabsVoiceId ?? existing?.elevenLabsVoiceId,
    elevenLabsVoiceName: body.elevenLabsVoiceName ?? existing?.elevenLabsVoiceName,
    onboardingComplete: body.onboardingComplete ?? existing?.onboardingComplete ?? false,
    updatedAt: new Date().toISOString(),
  })

  return NextResponse.json({ ok: true })
}

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const config = await getBusinessConfig(session.userId)
  return NextResponse.json(config ?? null)
}
