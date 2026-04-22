const BASE = 'https://api.elevenlabs.io/v1'
const KEY = () => process.env.ELEVENLABS_API_KEY!

export interface ElevenLabsVoice {
  voice_id: string
  name: string
  category: string
  preview_url: string | null
}

export async function listVoices(): Promise<ElevenLabsVoice[]> {
  const res = await fetch(`${BASE}/voices`, {
    headers: { 'xi-api-key': KEY() },
    cache: 'no-store',
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`ElevenLabs ${res.status}: ${body || res.statusText}`)
  }
  const data = await res.json()
  if (!Array.isArray(data.voices)) {
    throw new Error('Unexpected ElevenLabs response shape')
  }
  return data.voices.map((v: Record<string, unknown>) => ({
    voice_id: v.voice_id as string,
    name: v.name as string,
    category: (v.category as string) ?? 'premade',
    preview_url: (v.preview_url as string | null) ?? null,
  }))
}

export async function textToSpeech(text: string, voiceId: string): Promise<ReadableStream<Uint8Array>> {
  const res = await fetch(`${BASE}/text-to-speech/${voiceId}/stream`, {
    method: 'POST',
    headers: {
      'xi-api-key': KEY(),
      'Content-Type': 'application/json',
      Accept: 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: 'eleven_turbo_v2',
      voice_settings: { stability: 0.5, similarity_boost: 0.75 },
    }),
  })
  if (!res.ok) throw new Error(`ElevenLabs TTS failed: ${res.status}`)
  return res.body!
}
