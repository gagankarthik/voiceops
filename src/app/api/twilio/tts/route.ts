import { NextRequest, NextResponse } from 'next/server'
import { textToSpeech } from '@/lib/elevenlabs'

// Twilio fetches this URL to play ElevenLabs audio
// GET /api/twilio/tts?v=<voiceId>&t=<text>
export async function GET(req: NextRequest) {
  const voiceId = req.nextUrl.searchParams.get('v') ?? ''
  const text = req.nextUrl.searchParams.get('t') ?? ''

  if (!voiceId || !text) {
    return new NextResponse('Missing params', { status: 400 })
  }

  try {
    const stream = await textToSpeech(text, voiceId)
    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err: any) {
    return new NextResponse(err.message, { status: 500 })
  }
}
