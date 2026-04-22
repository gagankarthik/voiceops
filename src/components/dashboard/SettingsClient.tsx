'use client'

import { useState } from 'react'
import { Loader2, Check, Phone } from 'lucide-react'
import type { BusinessConfig } from '@/lib/dynamodb'

export default function SettingsClient({ config }: { config: BusinessConfig | null }) {
  const [form, setForm] = useState({
    name: config?.name ?? '',
    phone: config?.phone ?? '',
    address: config?.address ?? '',
    tone: config?.tone ?? 'friendly',
    language: config?.language ?? 'English',
    elevenLabsVoiceId: config?.elevenLabsVoiceId ?? '',
    elevenLabsVoiceName: config?.elevenLabsVoiceName ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }))

  async function save() {
    setSaving(true)
    await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const inputClass = 'w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors'

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Settings</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage your AI receptionist configuration.</p>
      </div>

      <div className="space-y-6">
        {/* Business info */}
        <section className="p-6 rounded-xl border border-zinc-100 bg-white shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-zinc-900">Business info</h2>
          {[
            { label: 'Business name', key: 'name', type: 'text', placeholder: 'Harmony Dental' },
            { label: 'Business phone', key: 'phone', type: 'tel', placeholder: '+1 555 000 0000' },
            { label: 'Address', key: 'address', type: 'text', placeholder: '123 Main St' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-xs text-zinc-500 mb-1.5">{f.label}</label>
              <input type={f.type} placeholder={f.placeholder} value={form[f.key as keyof typeof form]}
                onChange={set(f.key)} className={inputClass} />
            </div>
          ))}
        </section>

        {/* AI personality */}
        <section className="p-6 rounded-xl border border-zinc-100 bg-white shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-zinc-900">AI personality</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Tone</label>
              <select value={form.tone} onChange={set('tone')}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-400">
                {['professional', 'friendly', 'casual'].map(t => (
                  <option key={t} value={t} className="capitalize">{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Language</label>
              <select value={form.language} onChange={set('language')}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-400">
                {['English', 'Spanish', 'French', 'German', 'Portuguese'].map(l => (
                  <option key={l} value={l}>{l}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Integrations */}
        <section className="p-6 rounded-xl border border-zinc-100 bg-white shadow-sm space-y-4">
          <h2 className="text-sm font-semibold text-zinc-900">Integrations</h2>

          <div className="flex items-center justify-between p-4 rounded-lg border border-zinc-100 bg-zinc-50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center">
                <Phone size={14} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900">Twilio number</p>
                <p className="text-xs text-zinc-400">{config?.twilioNumber ?? 'Not configured'}</p>
              </div>
            </div>
            <a href="/onboarding" className="text-xs text-zinc-500 hover:text-zinc-900 font-medium transition-colors">
              {config?.twilioNumber ? 'Change' : 'Configure'}
            </a>
          </div>

          <div className="p-4 rounded-lg border border-zinc-100 bg-zinc-50 space-y-3">
            <p className="text-sm font-medium text-zinc-900">ElevenLabs voice</p>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Voice ID</label>
              <input value={form.elevenLabsVoiceId} onChange={set('elevenLabsVoiceId')}
                placeholder="ElevenLabs voice ID"
                className={inputClass} />
            </div>
            {config?.elevenLabsVoiceName && (
              <p className="text-xs text-teal-600">Active voice: {config.elevenLabsVoiceName}</p>
            )}
          </div>
        </section>

        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 transition-colors">
          {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : null}
          {saved ? 'Saved!' : saving ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}
