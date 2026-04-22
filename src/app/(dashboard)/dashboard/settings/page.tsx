import { getSession } from '@/lib/session'
import { getBusinessConfig } from '@/lib/dynamodb'
import SettingsClient from '@/components/dashboard/SettingsClient'

export const metadata = { title: 'Settings — VoiceOps AI' }

export default async function SettingsPage() {
  const session = await getSession()
  const config = await getBusinessConfig(session!.userId)
  return <SettingsClient config={config ?? null} />
}
