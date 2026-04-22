'use client'

import { useState, useRef } from 'react'
import { Loader2, Check, Phone, Mic, Settings, Search, Play, Square, CheckCircle2, X, type LucideIcon } from 'lucide-react'
import type { BusinessConfig } from '@/lib/dynamodb'

type Tab = 'general' | 'phone' | 'voice'

const inputClass =
  'w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors'

// ─── General Tab ──────────────────────────────────────────────────────────────

function GeneralTab({ config }: { config: BusinessConfig | null }) {
  const [form, setForm] = useState({
    name: config?.name ?? '',
    phone: config?.phone ?? '',
    address: config?.address ?? '',
    tone: config?.tone ?? 'friendly',
    language: config?.language ?? 'English',
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
      body: JSON.stringify({
        ...config,
        ...form,
      }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="space-y-6">
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

      <button onClick={save} disabled={saving}
        className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 transition-colors">
        {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : null}
        {saved ? 'Saved!' : saving ? 'Saving…' : 'Save changes'}
      </button>
    </div>
  )
}

// ─── Phone Numbers Tab ────────────────────────────────────────────────────────

function PhoneTab({ config }: { config: BusinessConfig | null }) {
  const [areaCode, setAreaCode] = useState('')
  const [results, setResults] = useState<{ phoneNumber: string; friendlyName: string }[]>([])
  const [searching, setSearching] = useState(false)
  const [provisioning, setProvisioning] = useState<string | null>(null)
  const [assigned, setAssigned] = useState(config?.twilioNumber ?? '')
  const [error, setError] = useState('')
  const [manualNumber, setManualNumber] = useState('')
  const [savingManual, setSavingManual] = useState(false)

  async function search() {
    if (!areaCode.trim()) return
    setSearching(true)
    setError('')
    try {
      const res = await fetch(`/api/twilio/provision?areaCode=${areaCode.trim()}`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Search failed')
      setResults(Array.isArray(data) ? data : [])
      if ((Array.isArray(data) ? data : []).length === 0) setError('No numbers found for that area code.')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Search failed')
    }
    setSearching(false)
  }

  async function provision(phoneNumber: string) {
    setProvisioning(phoneNumber)
    setError('')
    try {
      const res = await fetch('/api/twilio/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Provisioning failed')
      setAssigned(data.phoneNumber)
      setResults([])
      setAreaCode('')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Provisioning failed')
    }
    setProvisioning(null)
  }

  async function saveManual() {
    if (!manualNumber.trim()) return
    setSavingManual(true)
    setError('')
    try {
      const res = await fetch('/api/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...config, twilioNumber: manualNumber.trim() }),
      })
      if (!res.ok) throw new Error('Failed to save')
      setAssigned(manualNumber.trim())
      setManualNumber('')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed')
    }
    setSavingManual(false)
  }

  return (
    <div className="space-y-6">
      {/* Current number */}
      <section className="p-6 rounded-xl border border-zinc-100 bg-white shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900 mb-4">Assigned number</h2>
        {assigned ? (
          <div className="flex items-center justify-between p-4 rounded-lg border border-teal-100 bg-teal-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center">
                <Phone size={16} className="text-teal-600" />
              </div>
              <div>
                <p className="text-base font-mono font-semibold text-zinc-900">{assigned}</p>
                <p className="text-xs text-teal-600 mt-0.5">Active — your AI receptionist answers on this number</p>
              </div>
            </div>
            <span className="text-xs px-2 py-1 rounded-full bg-teal-100 text-teal-700 border border-teal-200 font-medium">Active</span>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 rounded-lg border border-zinc-100 bg-zinc-50">
            <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center">
              <Phone size={16} className="text-zinc-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-700">No number assigned</p>
              <p className="text-xs text-zinc-400 mt-0.5">Search below to get a Twilio number</p>
            </div>
          </div>
        )}
      </section>

      {/* Search new number */}
      <section className="p-6 rounded-xl border border-zinc-100 bg-white shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">Get a new number</h2>
          <p className="text-xs text-zinc-400 mt-1">Search available US numbers by area code and provision one instantly.</p>
        </div>

        <div className="flex gap-2">
          <input
            value={areaCode}
            onChange={e => setAreaCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
            onKeyDown={e => e.key === 'Enter' && search()}
            placeholder="Area code — e.g. 512"
            maxLength={3}
            className={inputClass}
          />
          <button onClick={search} disabled={searching || !areaCode.trim()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 transition-colors whitespace-nowrap">
            {searching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
            {searching ? 'Searching…' : 'Search'}
          </button>
        </div>

        {error && (
          <div className="flex items-center justify-between text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            <span>{error}</span>
            <button onClick={() => setError('')}><X size={12} /></button>
          </div>
        )}

        {results.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs text-zinc-400">{results.length} number{results.length !== 1 ? 's' : ''} available</p>
            {results.map(n => (
              <div key={n.phoneNumber} className="flex items-center justify-between p-3.5 rounded-lg border border-zinc-100 bg-zinc-50 hover:bg-zinc-100 transition-colors">
                <div>
                  <p className="text-sm font-mono font-semibold text-zinc-900">{n.phoneNumber}</p>
                  <p className="text-xs text-zinc-400 mt-0.5">{n.friendlyName}</p>
                </div>
                <button
                  onClick={() => provision(n.phoneNumber)}
                  disabled={provisioning === n.phoneNumber}
                  className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-zinc-900 text-white font-medium hover:bg-zinc-700 transition-colors disabled:opacity-50"
                >
                  {provisioning === n.phoneNumber ? <Loader2 size={11} className="animate-spin" /> : <Check size={11} />}
                  {provisioning === n.phoneNumber ? 'Provisioning…' : 'Select'}
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Manual entry */}
      <section className="p-6 rounded-xl border border-zinc-100 bg-white shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">Use existing Twilio number</h2>
          <p className="text-xs text-zinc-400 mt-1">Already have a Twilio number? Enter it directly.</p>
        </div>
        <div className="flex gap-2">
          <input
            value={manualNumber}
            onChange={e => setManualNumber(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && saveManual()}
            placeholder="+15551234567"
            className={inputClass}
          />
          <button onClick={saveManual} disabled={savingManual || !manualNumber.trim()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 transition-colors whitespace-nowrap">
            {savingManual ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
            {savingManual ? 'Saving…' : 'Save'}
          </button>
        </div>
      </section>
    </div>
  )
}

// ─── Voice Tab (ElevenLabs) ───────────────────────────────────────────────────

interface ElevenVoice {
  voice_id: string
  name: string
  category: string
  preview_url: string | null
}

function VoiceTab({ config }: { config: BusinessConfig | null }) {
  const [voices, setVoices] = useState<ElevenVoice[]>([])
  const [loading, setLoading] = useState(false)
  const [loadError, setLoadError] = useState('')
  const [selectedId, setSelectedId] = useState(config?.elevenLabsVoiceId ?? '')
  const [selectedName, setSelectedName] = useState(config?.elevenLabsVoiceName ?? '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [playingId, setPlayingId] = useState<string | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [filter, setFilter] = useState('')

  async function loadVoices() {
    setLoading(true)
    setLoadError('')
    try {
      const res = await fetch('/api/elevenlabs/voices')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Failed to load voices')
      setVoices(Array.isArray(data) ? data : [])
    } catch (e: unknown) {
      setLoadError(e instanceof Error ? e.message : 'Failed to load voices')
    }
    setLoading(false)
  }

  function togglePreview(voice: ElevenVoice) {
    if (!voice.preview_url) return
    if (playingId === voice.voice_id) {
      audioRef.current?.pause()
      audioRef.current = null
      setPlayingId(null)
      return
    }
    audioRef.current?.pause()
    const audio = new Audio(voice.preview_url)
    audioRef.current = audio
    setPlayingId(voice.voice_id)
    audio.play()
    audio.onended = () => setPlayingId(null)
  }

  async function saveVoice() {
    if (!selectedId) return
    setSaving(true)
    await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...config,
        elevenLabsVoiceId: selectedId,
        elevenLabsVoiceName: selectedName,
      }),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const CATEGORY_STYLE: Record<string, string> = {
    premade: 'bg-blue-50 text-blue-700 border-blue-100',
    professional: 'bg-purple-50 text-purple-700 border-purple-100',
    cloned: 'bg-amber-50 text-amber-700 border-amber-100',
    generated: 'bg-teal-50 text-teal-700 border-teal-100',
  }

  const filtered = voices.filter(v =>
    !filter || v.name.toLowerCase().includes(filter.toLowerCase()) || v.category.toLowerCase().includes(filter.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Current voice */}
      <section className="p-6 rounded-xl border border-zinc-100 bg-white shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900 mb-4">Active voice</h2>
        {selectedId ? (
          <div className="flex items-center justify-between p-4 rounded-lg border border-zinc-200 bg-zinc-50">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-zinc-900 flex items-center justify-center">
                <Mic size={15} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-900">{selectedName || selectedId}</p>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">{selectedId}</p>
              </div>
            </div>
            <button onClick={saveVoice} disabled={saving}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-zinc-900 text-white font-medium hover:bg-zinc-700 disabled:opacity-50 transition-colors">
              {saving ? <Loader2 size={11} className="animate-spin" /> : saved ? <Check size={11} /> : null}
              {saved ? 'Saved!' : saving ? 'Saving…' : 'Save voice'}
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-4 rounded-lg border border-zinc-100 bg-zinc-50">
            <div className="w-9 h-9 rounded-full bg-zinc-100 flex items-center justify-center">
              <Mic size={15} className="text-zinc-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-600">No voice selected</p>
              <p className="text-xs text-zinc-400 mt-0.5">Load voices below to pick one</p>
            </div>
          </div>
        )}
      </section>

      {/* Voice library */}
      <section className="p-6 rounded-xl border border-zinc-100 bg-white shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-zinc-900">ElevenLabs voice library</h2>
            <p className="text-xs text-zinc-400 mt-0.5">Preview and select a voice for your AI receptionist.</p>
          </div>
          <button onClick={loadVoices} disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-zinc-200 text-zinc-700 text-xs font-medium hover:bg-zinc-50 disabled:opacity-50 transition-colors">
            {loading ? <Loader2 size={12} className="animate-spin" /> : null}
            {loading ? 'Loading…' : voices.length > 0 ? 'Refresh' : 'Load voices'}
          </button>
        </div>

        {loadError && (
          <div className="flex items-center justify-between text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
            <span>{loadError}</span>
            <button onClick={() => setLoadError('')}><X size={12} /></button>
          </div>
        )}

        {voices.length > 0 && (
          <input
            value={filter}
            onChange={e => setFilter(e.target.value)}
            placeholder="Filter voices by name or category…"
            className={inputClass}
          />
        )}

        {voices.length === 0 && !loading && !loadError && (
          <div className="text-center py-10 text-zinc-400 text-sm">
            Click "Load voices" to fetch available ElevenLabs voices.
          </div>
        )}

        {filtered.length > 0 && (
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {filtered.map(v => {
              const isSelected = selectedId === v.voice_id
              return (
                <div
                  key={v.voice_id}
                  onClick={() => { setSelectedId(v.voice_id); setSelectedName(v.name) }}
                  className={`flex items-center justify-between p-3.5 rounded-lg border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-zinc-900 bg-zinc-50 shadow-sm'
                      : 'border-zinc-100 hover:border-zinc-200 hover:bg-zinc-50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {isSelected ? (
                      <CheckCircle2 size={16} className="text-zinc-900 flex-shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded-full border-2 border-zinc-200 flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-900 truncate">{v.name}</p>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded border capitalize ${CATEGORY_STYLE[v.category] ?? 'bg-zinc-50 text-zinc-500 border-zinc-100'}`}>
                        {v.category}
                      </span>
                    </div>
                  </div>
                  {v.preview_url && (
                    <button
                      onClick={e => { e.stopPropagation(); togglePreview(v) }}
                      className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg border font-medium transition-colors flex-shrink-0 ml-3 ${
                        playingId === v.voice_id
                          ? 'bg-zinc-900 text-white border-zinc-900'
                          : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                      }`}
                    >
                      {playingId === v.voice_id ? <Square size={11} /> : <Play size={11} />}
                      {playingId === v.voice_id ? 'Stop' : 'Preview'}
                    </button>
                  )}
                </div>
              )
            })}
          </div>
        )}

        {voices.length > 0 && filtered.length === 0 && (
          <p className="text-center text-sm text-zinc-400 py-6">No voices match your filter.</p>
        )}
      </section>

      {selectedId && (
        <button onClick={saveVoice} disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 transition-colors">
          {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <Check size={14} /> : null}
          {saved ? 'Voice saved!' : saving ? 'Saving…' : 'Save selected voice'}
        </button>
      )}
    </div>
  )
}

// ─── Shell ────────────────────────────────────────────────────────────────────

const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'phone', label: 'Phone Numbers', icon: Phone },
  { id: 'voice', label: 'Voice', icon: Mic },
]

export default function SettingsClient({ config }: { config: BusinessConfig | null }) {
  const [tab, setTab] = useState<Tab>('general')

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Settings</h1>
        <p className="text-sm text-zinc-500 mt-1">Manage your AI receptionist configuration.</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-zinc-100 rounded-xl mb-6 w-fit">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? 'bg-white text-zinc-900 shadow-sm'
                : 'text-zinc-500 hover:text-zinc-700'
            }`}
          >
            <t.icon size={14} />
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'general' && <GeneralTab config={config} />}
      {tab === 'phone' && <PhoneTab config={config} />}
      {tab === 'voice' && <VoiceTab config={config} />}
    </div>
  )
}
