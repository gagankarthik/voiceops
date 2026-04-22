import { NextRequest, NextResponse } from 'next/server'
import { signIn, getUser } from '@/lib/cognito'
import { putUser } from '@/lib/dynamodb'
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, cookieOptions } from '@/lib/session'

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()
  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password required' }, { status: 400 })
  }

  try {
    const tokens = await signIn(email, password)
    if (!tokens?.AccessToken || !tokens?.RefreshToken) {
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 })
    }

    // fetch user profile from Cognito
    const cognitoUser = await getUser(tokens.AccessToken)
    const attrs = Object.fromEntries(
      (cognitoUser.UserAttributes ?? []).map(a => [a.Name, a.Value])
    )
    const userId = cognitoUser.Username!

    // ensure user record exists in DynamoDB (idempotent)
    try {
      await putUser({
        userId,
        email: attrs.email ?? email,
        name: attrs.name ?? '',
        createdAt: new Date().toISOString(),
      })
    } catch {
      // ConditionalCheckFailedException = already exists, fine
    }

    const res = NextResponse.json({ ok: true, userId, email: attrs.email ?? email })
    res.cookies.set(ACCESS_TOKEN_COOKIE, tokens.AccessToken, cookieOptions(3600))
    res.cookies.set(REFRESH_TOKEN_COOKIE, tokens.RefreshToken, cookieOptions(30 * 24 * 3600))
    return res
  } catch (err: any) {
    const msg =
      err?.name === 'NotAuthorizedException' ? 'Incorrect email or password.' :
      err?.name === 'UserNotConfirmedException' ? 'Please verify your email first.' :
      err?.message ?? 'Login failed'
    return NextResponse.json({ error: msg }, { status: 401 })
  }
}
