import { NextRequest, NextResponse } from 'next/server'
import { confirmSignUp, resendCode } from '@/lib/cognito'

export async function POST(req: NextRequest) {
  const { email, code } = await req.json()
  if (!email || !code) return NextResponse.json({ error: 'Email and code required' }, { status: 400 })

  try {
    await confirmSignUp(email, code)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    const msg = err?.name === 'CodeMismatchException'
      ? 'Invalid code. Please try again.'
      : err?.message ?? 'Verification failed'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}

export async function PUT(req: NextRequest) {
  const { email } = await req.json()
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 })
  try {
    await resendCode(email)
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ error: err?.message ?? 'Failed to resend code' }, { status: 400 })
  }
}
