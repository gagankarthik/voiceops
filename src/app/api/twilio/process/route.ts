import { NextRequest, NextResponse } from 'next/server'
import { twiml } from '@/lib/twilio'
import {
  getBusinessConfig, listKnowledge, getConvHistory, appendConvTurn,
  putCall, upsertCustomer, putAppointment,
} from '@/lib/dynamodb'
import { buildSystemPrompt } from '@/lib/knowledge'
import { chat, extractCallData } from '@/lib/openai'
import { randomUUID } from 'crypto'

export async function POST(req: NextRequest) {
  const params = req.nextUrl.searchParams
  const uid = params.get('uid') ?? ''
  const callSid = params.get('sid') ?? ''
  const seq = parseInt(params.get('seq') ?? '0', 10)

  const form = await req.formData()
  const speech = (form.get('SpeechResult') as string) ?? ''
  const callerPhone = (form.get('From') as string) ?? 'Unknown'

  // build AI context
  const [business, knowledge, history] = await Promise.all([
    getBusinessConfig(uid),
    listKnowledge(uid),
    getConvHistory(callSid),
  ])

  const systemPrompt = business ? buildSystemPrompt(business, knowledge) : undefined
  const messages = history.map(t => ({ role: t.role, content: t.content }))

  // get AI reply
  const reply = await chat(messages, speech, systemPrompt)

  // store both turns
  await Promise.all([
    appendConvTurn({ callSid, userId: uid, role: 'user', content: speech, seq: seq * 2, ts: new Date().toISOString() }),
    appendConvTurn({ callSid, userId: uid, role: 'assistant', content: reply, seq: seq * 2 + 1, ts: new Date().toISOString() }),
  ])

  // detect call end keywords
  const isEnding = /thank you|goodbye|bye|that's all|no thank you/i.test(speech)

  if (isEnding || seq >= 20) {
    // save call record + update CRM
    const fullTranscript = [...messages, { role: 'user', content: speech }, { role: 'assistant', content: reply }]
      .map(m => `${m.role === 'user' ? 'Caller' : 'AI'}: ${m.content}`)
      .join('\n')

    const extracted = await extractCallData(fullTranscript)
    const callId = randomUUID()
    const now = new Date().toISOString()

    await Promise.all([
      putCall({
        callId, userId: uid, phone: callerPhone,
        transcript: fullTranscript,
        summary: extracted.summary ?? '',
        duration: seq * 30,
        status: 'completed',
        timestamp: now,
      }),
      upsertCustomer({
        phone: callerPhone,
        userId: uid,
        name: extracted.name ?? undefined,
        callCount: 1,
        lastSeen: now,
      }),
      extracted.appointment ? putAppointment({
        apptId: randomUUID(),
        userId: uid,
        customerPhone: callerPhone,
        customerName: extracted.name ?? 'Unknown',
        date: extracted.appointment.date ?? now.slice(0, 10),
        time: extracted.appointment.time ?? '10:00',
        status: 'scheduled',
        createdAt: now,
      }) : Promise.resolve(),
    ])

    const vr = twiml()
    vr.say({ voice: 'Polly.Joanna' }, reply)
    vr.say({ voice: 'Polly.Joanna' }, 'Have a great day. Goodbye!')
    vr.hangup()
    return new NextResponse(vr.toString(), { headers: { 'Content-Type': 'text/xml' } })
  }

  // check if ElevenLabs is configured — use it; else fallback to Polly
  const useEL = !!business?.elevenLabsVoiceId && !!process.env.ELEVENLABS_API_KEY
  const vr = twiml()

  if (useEL) {
    const base = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
    const ttsUrl = `${base}/api/twilio/tts?v=${encodeURIComponent(business!.elevenLabsVoiceId!)}&t=${encodeURIComponent(reply)}`
    vr.play(ttsUrl)
  } else {
    vr.say({ voice: 'Polly.Joanna' }, reply)
  }

  const nextGather = vr.gather({
    input: ['speech'],
    action: `/api/twilio/process?uid=${uid}&sid=${callSid}&seq=${seq + 1}`,
    method: 'POST',
    speechTimeout: 'auto',
  })
  nextGather.say({ voice: 'Polly.Joanna' }, '')

  return new NextResponse(vr.toString(), { headers: { 'Content-Type': 'text/xml' } })
}
