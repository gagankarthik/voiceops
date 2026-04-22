import OpenAI from 'openai'

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! })

const SYSTEM_PROMPT = `You are a friendly, professional AI receptionist for a medical clinic.

Rules:
- Keep every response under 2 sentences
- Use natural fillers: "Got it", "Sure", "Of course"
- Be warm and conversational, never robotic
- For booking: ask one question at a time (name → date → time)
- If unsure: ask for clarification rather than guessing
- Always confirm bookings before finalizing

Tone: calm, human, empathetic.`

export interface Message {
  role: 'user' | 'assistant'
  content: string
}

export async function chat(history: Message[], userMessage: string, systemPrompt?: string) {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt ?? SYSTEM_PROMPT },
      ...history,
      { role: 'user', content: userMessage },
    ],
    max_tokens: 150,
    temperature: 0.7,
  })
  return res.choices[0].message.content ?? ''
}

export async function extractCallData(transcript: string) {
  const res = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'Extract structured data from the call transcript. Return JSON only.',
      },
      {
        role: 'user',
        content: `Transcript:\n${transcript}\n\nReturn JSON: { name, phone, reason, appointment: { date, time } | null, summary }`,
      },
    ],
    response_format: { type: 'json_object' },
    max_tokens: 200,
  })
  try {
    return JSON.parse(res.choices[0].message.content ?? '{}')
  } catch {
    return {}
  }
}
