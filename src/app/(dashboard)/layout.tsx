import { redirect } from 'next/navigation'
import { getSession } from '@/lib/session'
import { getBusinessConfig } from '@/lib/dynamodb'
import DashboardNav from '@/components/dashboard/DashboardNav'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const business = await getBusinessConfig(session.userId)
  if (!business?.onboardingComplete) redirect('/onboarding')

  return (
    <div className="min-h-screen bg-zinc-50/50 text-zinc-900 flex">
      <DashboardNav businessName={business.name} twilioNumber={business.twilioNumber} />
      <main className="flex-1 ml-56 min-h-screen">{children}</main>
    </div>
  )
}
