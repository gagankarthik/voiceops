import { jwtVerify, createRemoteJWKSet } from 'jose'
import { cookies } from 'next/headers'

const POOL_ID = process.env.COGNITO_USER_POOL_ID!
const REGION = process.env.AWS_REGION!
const JWKS_URL = `https://cognito-idp.${REGION}.amazonaws.com/${POOL_ID}/.well-known/jwks.json`

const JWKS = createRemoteJWKSet(new URL(JWKS_URL))

export const ACCESS_TOKEN_COOKIE = 'vo_access'
export const REFRESH_TOKEN_COOKIE = 'vo_refresh'

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, JWKS, {
    issuer: `https://cognito-idp.${REGION}.amazonaws.com/${POOL_ID}`,
  })
  return payload
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value
  if (!token) return null
  try {
    const payload = await verifyToken(token)
    return { userId: payload.sub as string, email: payload.email as string }
  } catch {
    return null
  }
}

export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge,
  }
}
