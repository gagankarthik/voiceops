'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import AuthCard from './AuthCard'

export default function VerifyForm() {
  const router = useRouter()
  const params = useSearchParams()
  const email = params.get('email') ?? ''
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [resent, setResent] = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) return setError(data.error)
    router.push('/login?verified=1')
  }

  async function resend() {
    await fetch('/api/auth/verify', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setResent(true)
    setTimeout(() => setResent(false), 4000)
  }

  return (
    <AuthCard
      title="Check your email"
      sub={`We sent a 6-digit code to ${email || 'your email'}.`}
    >
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5">Verification code</label>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            placeholder="123456"
            value={code}
            onChange={e => setCode(e.target.value.replace(/\D/g, ''))}
            required
            className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 font-mono tracking-widest focus:outline-none focus:border-zinc-400 transition-colors"
          />
        </div>

        {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}
        {resent && <p className="text-xs text-teal-600">Code resent — check your inbox.</p>}

        <button
          type="submit"
          disabled={loading || code.length < 6}
          className="w-full py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Verifying…' : 'Verify email'}
        </button>

        <p className="text-xs text-center text-zinc-500">
          Didn't get it?{' '}
          <button type="button" onClick={resend} className="text-zinc-900 font-medium hover:underline">
            Resend code
          </button>
        </p>
      </form>
    </AuthCard>
  )
}
