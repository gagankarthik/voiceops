import { NextRequest, NextResponse } from 'next/server'
import { twiml } from '@/lib/twilio'
import { getBusinessConfig } from '@/lib/dynamodb'

// Twilio looks up which userId owns this number via query param set during provisioning
// URL: /api/twilio/incoming?uid=<userId>
export async function POST(req: NextRequest) {
  const uid = req.nextUrl.searchParams.get('uid') ?? ''
  const form = await req.formData()
  const callSid = form.get('CallSid') as string

  const business = uid ? await getBusinessConfig(uid) : null
  const businessName = business?.name ?? 'our office'

  const vr = twiml()
  const gather = vr.gather({
    input: ['speech'],
    action: `/api/twilio/process?uid=${uid}&sid=${callSid}&seq=0`,
    method: 'POST',
    speechTimeout: 'auto',
    language: business?.language === 'Spanish' ? 'es-US' : 'en-US',
  })
  gather.say(
    { voice: 'Polly.Joanna' },
    `Hello, thank you for calling ${businessName}. How can I help you today?`
  )
  // Fallback if no speech detected
  vr.redirect(`/api/twilio/incoming?uid=${uid}`)

  return new NextResponse(vr.toString(), {
    headers: { 'Content-Type': 'text/xml' },
  })
}
