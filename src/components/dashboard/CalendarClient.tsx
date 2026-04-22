'use client'

import { useState } from 'react'
import { Calendar, Plus, X, Loader2 } from 'lucide-react'
import type { Appointment } from '@/lib/dynamodb'

const STATUS_STYLES: Record<string, string> = {
  scheduled: 'bg-blue-50 text-blue-700 border-blue-100',
  confirmed: 'bg-teal-50 text-teal-700 border-teal-100',
  cancelled: 'bg-red-50 text-red-600 border-red-100',
}

export default function CalendarClient({ initialAppts }: { initialAppts: Appointment[] }) {
  const [appts, setAppts] = useState(initialAppts)
  const [showForm, setShowForm] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [form, setForm] = useState({ customerName: '', customerPhone: '', date: '', time: '' })
  const [saving, setSaving] = useState(false)

  const today = new Date().toISOString().slice(0, 10)
  const upcoming = appts.filter(a => a.date >= today).sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))
  const past = appts.filter(a => a.date < today).sort((a, b) => b.date.localeCompare(a.date))

  async function add() {
    if (!form.date || !form.time) return
    setSaving(true)
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) {
      setAppts(a => [...a, data])
      setShowForm(false)
      setForm({ customerName: '', customerPhone: '', date: '', time: '' })
    }
    setSaving(false)
  }

  async function remove(appt: Appointment) {
    setDeleting(appt.apptId)
    await fetch('/api/appointments', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apptId: appt.apptId, date: appt.date }),
    })
    setAppts(a => a.filter(x => x.apptId !== appt.apptId))
    setDeleting(null)
  }

  function ApptRow({ a }: { a: Appointment }) {
    return (
      <div className="flex items-center justify-between px-5 py-4 hover:bg-zinc-50 transition-colors">
        <div className="flex items-center gap-4">
          <div className="text-center w-12">
            <p className="text-xs text-zinc-400">{new Date(a.date + 'T00:00').toLocaleDateString('en', { month: 'short' })}</p>
            <p className="text-lg font-bold text-zinc-900 leading-none">{new Date(a.date + 'T00:00').getDate()}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-zinc-900">{a.customerName || 'Unknown'}</p>
            <p className="text-xs text-zinc-400">{a.time} · {a.customerPhone}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${STATUS_STYLES[a.status] ?? 'bg-zinc-50 text-zinc-500 border-zinc-100'}`}>
            {a.status}
          </span>
          <button onClick={() => remove(a)} disabled={deleting === a.apptId}
            className="text-zinc-400 hover:text-red-500 transition-colors">
            {deleting === a.apptId ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Calendar</h1>
          <p className="text-sm text-zinc-500 mt-1">Appointments booked by your AI receptionist.</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition-colors shadow-sm">
          <Plus size={14} /> Add appointment
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-5 rounded-xl border border-zinc-200 bg-white shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-900 mb-4">New appointment</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Customer name', key: 'customerName', type: 'text', placeholder: 'Jane Smith' },
              { label: 'Phone', key: 'customerPhone', type: 'tel', placeholder: '+1 555 000 0000' },
              { label: 'Date', key: 'date', type: 'date', placeholder: '' },
              { label: 'Time', key: 'time', type: 'time', placeholder: '' },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-xs text-zinc-500 mb-1.5">{f.label}</label>
                <input type={f.type} placeholder={f.placeholder}
                  value={form[f.key as keyof typeof form]}
                  onChange={e => setForm(v => ({ ...v, [f.key]: e.target.value }))}
                  className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors" />
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={add} disabled={saving || !form.date || !form.time}
              className="px-4 py-2 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 transition-colors">
              {saving ? 'Saving…' : 'Save'}
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg border border-zinc-200 text-zinc-500 text-sm hover:bg-zinc-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="space-y-5">
        <div className="rounded-xl border border-zinc-100 bg-white shadow-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-zinc-100 flex items-center gap-2">
            <Calendar size={14} className="text-zinc-500" />
            <span className="text-sm font-semibold text-zinc-900">Upcoming ({upcoming.length})</span>
          </div>
          {upcoming.length === 0 ? (
            <p className="px-5 py-8 text-sm text-zinc-400 text-center">No upcoming appointments.</p>
          ) : (
            <div className="divide-y divide-zinc-100">{upcoming.map(a => <ApptRow key={a.apptId} a={a} />)}</div>
          )}
        </div>

        {past.length > 0 && (
          <div className="rounded-xl border border-zinc-100 bg-white shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-zinc-100">
              <span className="text-sm font-semibold text-zinc-400">Past ({past.length})</span>
            </div>
            <div className="divide-y divide-zinc-100 opacity-60">
              {past.slice(0, 10).map(a => <ApptRow key={a.apptId} a={a} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
