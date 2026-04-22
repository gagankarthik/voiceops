import { BusinessConfig, KnowledgeEntry } from './dynamodb'

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

function formatHours(hours: BusinessConfig['hours']): string {
  return DAYS
    .map(d => {
      const h = hours?.[d]
      if (!h || h.closed) return `${d}: closed`
      return `${d}: ${h.open} – ${h.close}`
    })
    .join(', ')
}

export function buildSystemPrompt(
  business: BusinessConfig,
  knowledge: KnowledgeEntry[]
): string {
  const knowledgeText = knowledge.length
    ? knowledge.map(k => `[${k.type.toUpperCase()}] ${k.title}:\n${k.content}`).join('\n\n')
    : 'No additional knowledge loaded.'

  const toneMap = {
    professional: 'formal, precise, and respectful',
    friendly: 'warm, approachable, and conversational',
    casual: 'relaxed, natural, and informal',
  }

  return `You are an AI receptionist for ${business.name}, a ${business.type}.

TONE: Be ${toneMap[business.tone] ?? 'friendly'}. Keep every response under 2 sentences.
LANGUAGE: ${business.language ?? 'English'}.

BUSINESS DETAILS:
- Name: ${business.name}
- Type: ${business.type}
- Address: ${business.address ?? 'not provided'}
- Phone: ${business.phone ?? 'not provided'}
- Hours: ${formatHours(business.hours)}
- Services: ${business.services?.join(', ') || 'General services'}

KNOWLEDGE BASE:
${knowledgeText}

RULES:
1. Never make up information not in the knowledge base — say "Let me check on that for you"
2. For booking requests: collect name → preferred date → preferred time (one question at a time)
3. Always confirm details before finalizing any appointment
4. If the caller is angry or distressed, stay calm and empathetic
5. At call end, summarize what was resolved or scheduled

CRITICAL: Do NOT roleplay as a human. If asked directly if you are AI, confirm honestly.`
}
