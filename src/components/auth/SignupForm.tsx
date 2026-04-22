'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import AuthCard from './AuthCard'

export default function SignupForm() {
  const router = useRouter()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) return setError(data.error)
    router.push(`/verify?email=${encodeURIComponent(form.email)}`)
  }

  return (
    <AuthCard title="Create your account" sub="Start your free 14-day trial — no card needed.">
      <form onSubmit={submit} className="space-y-4">
        {[
          { label: 'Full name', key: 'name', type: 'text', placeholder: 'Jane Smith' },
          { label: 'Work email', key: 'email', type: 'email', placeholder: 'jane@clinic.com' },
          { label: 'Password', key: 'password', type: 'password', placeholder: '8+ characters' },
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
          {loading ? 'Creating account…' : 'Create account'}
        </button>

        <p className="text-xs text-center text-zinc-500">
          Already have an account?{' '}
          <a href="/login" className="text-zinc-900 font-medium hover:underline">Sign in</a>
        </p>
      </form>
    </AuthCard>
  )
}
