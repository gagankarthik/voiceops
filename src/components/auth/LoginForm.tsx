'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthCard from './AuthCard'

export default function LoginForm() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) {
      if (data.error?.includes('verify')) router.push(`/verify?email=${encodeURIComponent(form.email)}`)
      return setError(data.error)
    }
    router.push('/dashboard')
  }

  return (
    <AuthCard title="Welcome back" sub="Sign in to your VoiceOps dashboard.">
      <form onSubmit={submit} className="space-y-4">
        {[
          { label: 'Email', key: 'email', type: 'email', placeholder: 'you@clinic.com' },
          { label: 'Password', key: 'password', type: 'password', placeholder: '••••••••' },
        ].map(({ label, key, type, placeholder }) => (
          <div key={key}>
            <label className="block text-xs text-zinc-500 mb-1.5">{label}</label>
            <input
              type={type}
              placeholder={placeholder}
              value={form[key as keyof typeof form]}
              onChange={set(key)}
              required
              className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
            />
          </div>
        ))}

        {error && <p className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? 'Signing in…' : 'Sign in'}
        </button>

        <p className="text-xs text-center text-zinc-500">
          No account?{' '}
          <a href="/signup" className="text-zinc-900 font-medium hover:underline">Create one free</a>
        </p>
      </form>
    </AuthCard>
  )
}
