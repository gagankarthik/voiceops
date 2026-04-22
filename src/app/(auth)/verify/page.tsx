import { Suspense } from 'react'
import VerifyForm from '@/components/auth/VerifyForm'

export const metadata = { title: 'Verify Email — VoiceOps AI' }

export default function VerifyPage() {
  return (
    <Suspense>
      <VerifyForm />
    </Suspense>
  )
}
