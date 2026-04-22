import { NextRequest, NextResponse } from 'next/server'
import { signOut } from '@/lib/cognito'
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from '@/lib/session'
import { cookies } from 'next/headers'

export async function POST(_req: NextRequest) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value

  if (accessToken) {
    try { await signOut(accessToken) } catch { /* expired token is fine */ }
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.delete(ACCESS_TOKEN_COOKIE)
  res.cookies.delete(REFRESH_TOKEN_COOKIE)
  return res
}
