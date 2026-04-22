import { getSession } from '@/lib/session'
import { listKnowledge } from '@/lib/dynamodb'
import KnowledgeClient from '@/components/dashboard/KnowledgeClient'

export const metadata = { title: 'Knowledge Base — VoiceOps AI' }

export default async function KnowledgePage() {
  const session = await getSession()
  const entries = await listKnowledge(session!.userId)
  return <KnowledgeClient initialEntries={entries} />
}
