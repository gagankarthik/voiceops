'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Building2, Clock, Phone, Mic2, BookOpen, CheckCircle2, ChevronRight, ChevronLeft, Plus, X, Loader2 } from 'lucide-react'

interface FormState {
  type: string
  name: string
  phone: string
  address: string
  hours: Record<string, { open: string; close: string; closed: boolean }>
  services: string[]
  tone: 'professional' | 'friendly' | 'casual'
  language: string
  elevenLabsVoiceId: string
  elevenLabsVoiceName: string
  twilioNumber: string
}

const BUSINESS_TYPES = [
  { id: 'clinic', label: 'Medical Clinic', emoji: '🏥' },
  { id: 'dental', label: 'Dental Office', emoji: '🦷' },
  { id: 'salon', label: 'Hair Salon', emoji: '💈' },
  { id: 'spa', label: 'Spa / Wellness', emoji: '🧖' },
  { id: 'restaurant', label: 'Restaurant', emoji: '🍽️' },
  { id: 'law', label: 'Law Office', emoji: '⚖️' },
  { id: 'consulting', label: 'Consulting', emoji: '💼' },
  { id: 'other', label: 'Other', emoji: '🏢' },
]

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
const DEFAULT_HOURS = Object.fromEntries(
  DAYS.map(d => [d, { open: '09:00', close: '17:00', closed: d === 'sunday' }])
)

const STEPS = [
  { icon: Building2, label: 'Business type' },
  { icon: Clock, label: 'Hours & details' },
  { icon: Mic2, label: 'Voice & tone' },
  { icon: Phone, label: 'Phone number' },
  { icon: BookOpen, label: 'Knowledge' },
  { icon: CheckCircle2, label: 'Done' },
]

const inputClass = 'w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors'

function StepBusinessType({ form, set }: { form: FormState; set: (k: keyof FormState, v: unknown) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-zinc-900">What kind of business are you?</h2>
        <p className="text-sm text-zinc-500 mt-1">We'll tailor your AI receptionist's language and workflows.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {BUSINESS_TYPES.map(b => (
          <button
            key={b.id}
            onClick={() => set('type', b.id)}
            className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
              form.type === b.id
                ? 'border-zinc-900 bg-zinc-900 text-white'
                : 'border-zinc-100 bg-white text-zinc-600 hover:border-zinc-200 hover:text-zinc-900'
            }`}
          >
            <span className="text-2xl">{b.emoji}</span>
            <span className="text-sm font-medium">{b.label}</span>
          </button>
        ))}
      </div>
      <div className="space-y-3 pt-2">
        <label className="block text-xs text-zinc-500">Business name *</label>
        <input
          value={form.name}
          onChange={e => set('name', e.target.value)}
          placeholder="e.g. Harmony Dental Care"
          className={inputClass}
        />
      </div>
    </div>
  )
}

function StepDetails({ form, set }: { form: FormState; set: (k: keyof FormState, v: unknown) => void }) {
  const [svcInput, setSvcInput] = useState('')

  function addService() {
    const v = svcInput.trim()
    if (!v || form.services.includes(v)) return
    set('services', [...form.services, v])
    setSvcInput('')
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-zinc-900">Business details</h2>
        <p className="text-sm text-zinc-500 mt-1">This helps the AI answer questions accurately.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Business phone', key: 'phone', placeholder: '+1 (555) 000-0000' },
          { label: 'Address', key: 'address', placeholder: '123 Main St, Austin TX' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-xs text-zinc-500 mb-1.5">{f.label}</label>
            <input
              value={form[f.key as keyof FormState] as string}
              onChange={e => set(f.key as keyof FormState, e.target.value)}
              placeholder={f.placeholder}
              className={inputClass}
            />
          </div>
        ))}
      </div>

      <div>
        <label className="block text-xs text-zinc-500 mb-2">Business hours</label>
        <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
          {DAYS.map(d => {
            const h = form.hours[d] ?? { open: '09:00', close: '17:00', closed: false }
            return (
              <div key={d} className="flex items-center gap-3">
                <span className="text-xs text-zinc-500 w-20 capitalize">{d}</span>
                <label className="flex items-center gap-1.5 text-xs text-zinc-500">
                  <input
                    type="checkbox"
                    checked={h.closed}
                    onChange={e => set('hours', { ...form.hours, [d]: { ...h, closed: e.target.checked } })}
                    className="accent-zinc-900"
                  />
                  Closed
                </label>
                {!h.closed && (
                  <>
                    <input type="time" value={h.open} onChange={e => set('hours', { ...form.hours, [d]: { ...h, open: e.target.value } })}
                      className="bg-white border border-zinc-200 rounded px-2 py-1 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400" />
                    <span className="text-zinc-400 text-xs">–</span>
                    <input type="time" value={h.close} onChange={e => set('hours', { ...form.hours, [d]: { ...h, close: e.target.value } })}
                      className="bg-white border border-zinc-200 rounded px-2 py-1 text-xs text-zinc-900 focus:outline-none focus:border-zinc-400" />
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div>
        <label className="block text-xs text-zinc-500 mb-2">Services offered</label>
        <div className="flex gap-2 mb-2">
          <input
            value={svcInput}
            onChange={e => setSvcInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addService())}
            placeholder="e.g. Teeth cleaning"
            className={inputClass}
          />
          <button onClick={addService} className="px-3 py-2 rounded-lg bg-zinc-100 text-zinc-600 hover:bg-zinc-200 transition-colors">
            <Plus size={15} />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.services.map(s => (
            <span key={s} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 border border-zinc-200 text-xs text-zinc-600">
              {s}
              <button onClick={() => set('services', form.services.filter(x => x !== s))}><X size={10} /></button>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

function StepVoice({ form, set }: { form: FormState; set: (k: keyof FormState, v: unknown) => void }) {
  const [voices, setVoices] = useState<{ voice_id: string; name: string; preview_url: string | null }[]>([])
  const [loading, setLoading] = useState(false)
  const [previewing, setPreviewing] = useState<string | null>(null)

  async function loadVoices() {
    setLoading(true)
    const res = await fetch('/api/elevenlabs/voices')
    const data = await res.json()
    setVoices(data)
    setLoading(false)
  }

  function preview(url: string | null, id: string) {
    if (!url) return
    if (previewing === id) { setPreviewing(null); return }
    const audio = new Audio(url)
    audio.play()
    setPreviewing(id)
    audio.onended = () => setPreviewing(null)
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-zinc-900">Voice & tone</h2>
        <p className="text-sm text-zinc-500 mt-1">How should your AI receptionist sound and speak?</p>
      </div>

      <div>
        <label className="block text-xs text-zinc-500 mb-2">Personality tone</label>
        <div className="grid grid-cols-3 gap-3">
          {(['professional', 'friendly', 'casual'] as const).map(t => (
            <button
              key={t}
              onClick={() => set('tone', t)}
              className={`p-3 rounded-xl border text-sm font-medium capitalize transition-all ${
                form.tone === t
                  ? 'border-zinc-900 bg-zinc-900 text-white'
                  : 'border-zinc-100 text-zinc-500 hover:border-zinc-200 hover:text-zinc-900'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-xs text-zinc-500 mb-2">Language</label>
        <select
          value={form.language}
          onChange={e => set('language', e.target.value)}
          className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-400"
        >
          {['English', 'Spanish', 'French', 'German', 'Portuguese'].map(l => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-zinc-500">ElevenLabs voice (optional)</label>
          {voices.length === 0 && (
            <button onClick={loadVoices} disabled={loading}
              className="text-xs text-zinc-900 font-medium hover:underline disabled:opacity-50">
              {loading ? 'Loading…' : 'Load voices'}
            </button>
          )}
        </div>
        {voices.length > 0 && (
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
            {voices.map(v => (
              <div
                key={v.voice_id}
                onClick={() => { set('elevenLabsVoiceId', v.voice_id); set('elevenLabsVoiceName', v.name) }}
                className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-all ${
                  form.elevenLabsVoiceId === v.voice_id
                    ? 'border-zinc-900 bg-zinc-50'
                    : 'border-zinc-100 hover:border-zinc-200'
                }`}
              >
                <span className="text-sm text-zinc-800">{v.name}</span>
                {v.preview_url && (
                  <button
                    onClick={e => { e.stopPropagation(); preview(v.preview_url, v.voice_id) }}
                    className="text-xs text-zinc-400 hover:text-zinc-900 px-2 py-0.5 rounded"
                  >
                    {previewing === v.voice_id ? '■ stop' : '▶ preview'}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
        {form.elevenLabsVoiceName && (
          <p className="text-xs text-teal-600 mt-1.5">Selected: {form.elevenLabsVoiceName}</p>
        )}
      </div>
    </div>
  )
}

function StepPhone({ form, set }: { form: FormState; set: (k: keyof FormState, v: unknown) => void }) {
  const [areaCode, setAreaCode] = useState('')
  const [numbers, setNumbers] = useState<{ phoneNumber: string; friendlyName: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [provisioning, setProvisioning] = useState(false)

  async function search() {
    setLoading(true)
    const res = await fetch(`/api/twilio/provision?areaCode=${areaCode}`)
    const data = await res.json()
    setNumbers(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function provision(phoneNumber: string) {
    setProvisioning(true)
    const res = await fetch('/api/twilio/provision', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phoneNumber }),
    })
    const data = await res.json()
    if (res.ok) set('twilioNumber', data.phoneNumber)
    setProvisioning(false)
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-zinc-900">Get a phone number</h2>
        <p className="text-sm text-zinc-500 mt-1">Your AI receptionist will answer calls on this number.</p>
      </div>

      {form.twilioNumber ? (
        <div className="p-4 rounded-xl border border-teal-100 bg-teal-50">
          <p className="text-xs text-teal-600 mb-1">Number provisioned</p>
          <p className="text-xl font-mono font-bold text-zinc-900">{form.twilioNumber}</p>
          <button onClick={() => set('twilioNumber', '')} className="text-xs text-zinc-400 mt-2 hover:text-red-500">Remove</button>
        </div>
      ) : (
        <>
          <div className="flex gap-2">
            <input
              value={areaCode}
              onChange={e => setAreaCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
              placeholder="Area code (e.g. 512)"
              className={inputClass}
            />
            <button onClick={search} disabled={loading}
              className="px-4 py-2.5 rounded-lg bg-zinc-100 text-zinc-700 text-sm font-medium hover:bg-zinc-200 transition-colors disabled:opacity-50">
              {loading ? <Loader2 size={15} className="animate-spin" /> : 'Search'}
            </button>
          </div>

          {numbers.length > 0 && (
            <div className="space-y-2">
              {numbers.map(n => (
                <div key={n.phoneNumber} className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 bg-white">
                  <span className="font-mono text-sm text-zinc-800">{n.phoneNumber}</span>
                  <button
                    onClick={() => provision(n.phoneNumber)}
                    disabled={provisioning}
                    className="text-xs px-3 py-1.5 rounded-lg bg-zinc-900 text-white font-medium hover:bg-zinc-700 transition-colors disabled:opacity-50"
                  >
                    {provisioning ? 'Provisioning…' : 'Select'}
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="pt-2">
            <p className="text-xs text-zinc-400 mb-2">Or enter an existing Twilio number</p>
            <input
              value={form.twilioNumber}
              onChange={e => set('twilioNumber', e.target.value)}
              placeholder="+1 (555) 000-0000"
              className={inputClass}
            />
          </div>
        </>
      )}
    </div>
  )
}

function StepKnowledge() {
  const [entries, setEntries] = useState<{ knowledgeId: string; title: string; type: string }[]>([])
  const [form, setFormState] = useState({ title: '', content: '', type: 'faq' })
  const [loading, setLoading] = useState(false)

  async function add() {
    if (!form.title || !form.content) return
    setLoading(true)
    const res = await fetch('/api/knowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) {
      setEntries(e => [...e, data])
      setFormState({ title: '', content: '', type: 'faq' })
    }
    setLoading(false)
  }

  async function remove(id: string) {
    await fetch('/api/knowledge', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ knowledgeId: id }),
    })
    setEntries(e => e.filter(x => x.knowledgeId !== id))
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-zinc-900">Knowledge base</h2>
        <p className="text-sm text-zinc-500 mt-1">Add FAQs, policies, and service info your AI will know by heart.</p>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Title</label>
            <input value={form.title} onChange={e => setFormState(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Cancellation policy"
              className={inputClass} />
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Type</label>
            <select value={form.type} onChange={e => setFormState(f => ({ ...f, type: e.target.value }))}
              className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-400">
              {['faq', 'policy', 'service', 'general'].map(t => (
                <option key={t} value={t} className="capitalize">{t}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs text-zinc-500 mb-1.5">Content</label>
          <textarea value={form.content} onChange={e => setFormState(f => ({ ...f, content: e.target.value }))}
            placeholder="Type the information your AI should know…"
            rows={4}
            className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors resize-none" />
        </div>
        <button onClick={add} disabled={loading || !form.title || !form.content}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100 text-zinc-700 text-sm font-medium hover:bg-zinc-200 disabled:opacity-50 transition-colors">
          <Plus size={14} /> {loading ? 'Saving…' : 'Add entry'}
        </button>
      </div>

      {entries.length > 0 && (
        <div className="space-y-2">
          {entries.map(e => (
            <div key={e.knowledgeId} className="flex items-center justify-between p-3 rounded-lg border border-zinc-100 bg-white">
              <div>
                <p className="text-sm text-zinc-900">{e.title}</p>
                <p className="text-xs text-zinc-400 capitalize mt-0.5">{e.type}</p>
              </div>
              <button onClick={() => remove(e.knowledgeId)} className="text-zinc-400 hover:text-red-500 transition-colors">
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-zinc-400">You can always add more from the dashboard later.</p>
    </div>
  )
}

function StepDone() {
  return (
    <div className="text-center space-y-5 py-6">
      <div className="w-16 h-16 rounded-full bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto">
        <CheckCircle2 size={32} className="text-teal-600" />
      </div>
      <div>
        <h2 className="text-xl font-bold text-zinc-900">You're all set!</h2>
        <p className="text-sm text-zinc-500 mt-2 max-w-xs mx-auto">
          Your AI receptionist is configured and ready. Heading to your dashboard now…
        </p>
      </div>
    </div>
  )
}

export default function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<FormState>({
    type: '',
    name: '',
    phone: '',
    address: '',
    hours: DEFAULT_HOURS,
    services: [],
    tone: 'friendly',
    language: 'English',
    elevenLabsVoiceId: '',
    elevenLabsVoiceName: '',
    twilioNumber: '',
  })

  function set(k: keyof FormState, v: unknown) {
    setForm(f => ({ ...f, [k]: v }))
  }

  function canAdvance() {
    if (step === 0) return form.type && form.name.trim()
    return true
  }

  async function next() {
    if (step < STEPS.length - 2) {
      setStep(s => s + 1)
      return
    }
    setSaving(true)
    await fetch('/api/onboarding', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, onboardingComplete: true }),
    })
    setStep(STEPS.length - 1)
    setSaving(false)
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  const STEP_COMPONENTS = [
    <StepBusinessType key="type" form={form} set={set} />,
    <StepDetails key="details" form={form} set={set} />,
    <StepVoice key="voice" form={form} set={set} />,
    <StepPhone key="phone" form={form} set={set} />,
    <StepKnowledge key="knowledge" />,
    <StepDone key="done" />,
  ]

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-xl">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                i < step ? 'bg-teal-500' : i === step ? 'bg-zinc-900' : 'bg-zinc-100'
              }`}>
                {i < step ? (
                  <CheckCircle2 size={14} className="text-white" />
                ) : (
                  <s.icon size={13} className={i === step ? 'text-white' : 'text-zinc-400'} />
                )}
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px flex-1 w-6 transition-all ${i < step ? 'bg-teal-500' : 'bg-zinc-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-zinc-100 bg-white shadow-sm p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
            >
              {STEP_COMPONENTS[step]}
            </motion.div>
          </AnimatePresence>

          {step < STEPS.length - 1 && (
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-zinc-100">
              <button
                onClick={() => setStep(s => s - 1)}
                disabled={step === 0}
                className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-900 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={15} /> Back
              </button>
              <button
                onClick={next}
                disabled={!canAdvance() || saving}
                className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg bg-zinc-900 text-white text-sm font-semibold hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                {step === STEPS.length - 2 ? 'Finish setup' : 'Continue'}
                {!saving && <ChevronRight size={15} />}
              </button>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-zinc-400 mt-4">
          Step {step + 1} of {STEPS.length}
        </p>
      </div>
    </div>
  )
}
