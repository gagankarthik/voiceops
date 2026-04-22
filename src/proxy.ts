import { NextRequest, NextResponse } from 'next/server'
import { ACCESS_TOKEN_COOKIE, verifyToken } from '@/lib/session'

const PUBLIC_PREFIXES = ['/', '/login', '/signup', '/verify', '/api/auth', '/api/twilio']

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl

  const isPublic = PUBLIC_PREFIXES.some(p =>
    pathname === p || (p !== '/' && pathname.startsWith(p))
  )
  if (isPublic) return NextResponse.next()

  const token = req.cookies.get(ACCESS_TOKEN_COOKIE)?.value
  if (!token) return NextResponse.redirect(new URL('/login', req.url))

  try {
    await verifyToken(token)
    return NextResponse.next()
  } catch {
    const res = NextResponse.redirect(new URL('/login', req.url))
    res.cookies.delete(ACCESS_TOKEN_COOKIE)
    return res
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/onboarding',
    '/api/calls/:path*',
    '/api/ai/:path*',
    '/api/knowledge/:path*',
    '/api/customers/:path*',
    '/api/appointments/:path*',
    '/api/onboarding',
  ],
}
