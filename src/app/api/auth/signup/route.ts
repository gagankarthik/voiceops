import { NextRequest, NextResponse } from 'next/server'
import { signUp } from '@/lib/cognito'

export async function POST(req: NextRequest) {
  const { email, password, name } = await req.json()

  if (!email || !password || !name) {
    return NextResponse.json({ error: 'All fields required' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
  }

  try {
    await signUp(email, password, name)
    return NextResponse.json({ ok: true, message: 'Check your email for the verification code.' })
  } catch (err: any) {
    const msg = err?.name === 'UsernameExistsException'
      ? 'An account with this email already exists.'
      : err?.message ?? 'Signup failed'
    return NextResponse.json({ error: msg }, { status: 400 })
  }
}
