import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { getBusinessConfig } from '@/lib/dynamodb'
import OnboardingWizard from '@/components/onboarding/OnboardingWizard'

export const metadata = { title: 'Setup — VoiceOps AI' }

export default async function OnboardingPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const business = await getBusinessConfig(session.userId)
  if (business?.onboardingComplete) redirect('/dashboard')

  return <OnboardingWizard />
}
