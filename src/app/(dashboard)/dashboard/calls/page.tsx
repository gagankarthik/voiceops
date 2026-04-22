import { getSession } from '@/lib/session'
import { listCalls, getBusinessConfig } from '@/lib/dynamodb'
import CallsClient from '@/components/dashboard/CallsClient'

export const metadata = { title: 'Call Logs — VoiceOps AI' }

export default async function CallsPage() {
  const session = await getSession()
  const [calls, business] = await Promise.all([
    listCalls(session!.userId, 50),
    getBusinessConfig(session!.userId),
  ])
  return <CallsClient calls={calls} twilioNumber={business?.twilioNumber} />
}
