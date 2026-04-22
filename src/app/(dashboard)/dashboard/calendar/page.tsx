import { getSession } from '@/lib/session'
import { listAppointments } from '@/lib/dynamodb'
import CalendarClient from '@/components/dashboard/CalendarClient'

export const metadata = { title: 'Calendar — VoiceOps AI' }

export default async function CalendarPage() {
  const session = await getSession()
  const appts = await listAppointments(session!.userId)
  return <CalendarClient initialAppts={appts} />
}
