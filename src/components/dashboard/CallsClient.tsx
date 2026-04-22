'use client'

import { useState } from 'react'
import { Phone, PhoneCall, Loader2, X } from 'lucide-react'
import type { CallRecord } from '@/lib/dynamodb'

export default function CallsClient({
  calls: initialCalls,
  twilioNumber,
}: {
  calls: CallRecord[]
  twilioNumber?: string
}) {
  const [calls] = useState(initialCalls)
  const [showForm, setShowForm] = useState(false)
  const [phone, setPhone] = useState('')
  const [calling, setCalling] = useState(false)
  const [banner, setBanner] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  async function makeCall() {
    if (!phone.trim()) return
    setCalling(true)
    setBanner(null)
    try {
      const res = await fetch('/api/twilio/outbound', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phone.trim() }),
      })
      const data = await res.json()
      if (res.ok) {
        setBanner({ type: 'success', message: `Call initiated to ${phone.trim()} — status: ${data.status}` })
        setPhone('')
        setShowForm(false)
      } else {
        setBanner({ type: 'error', message: data.error ?? 'Failed to initiate call' })
      }
    } catch {
      setBanner({ type: 'error', message: 'Network error. Please try again.' })
    }
    setCalling(false)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Call Logs</h1>
          <p className="text-sm text-zinc-500 mt-1">Every conversation your AI receptionist has handled.</p>
        </div>
        <button
          onClick={() => { setShowForm(v => !v); setBanner(null) }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition-colors shadow-sm"
        >
          <PhoneCall size={14} /> Make a Call
        </button>
      </div>

      {/* Banner */}
      {banner && (
        <div className={`mb-4 px-4 py-3 rounded-lg flex items-center justify-between text-sm border ${
          banner.type === 'success'
            ? 'bg-teal-50 text-teal-700 border-teal-100'
            : 'bg-red-50 text-red-600 border-red-100'
        }`}>
          <span>{banner.message}</span>
          <button onClick={() => setBanner(null)} className="ml-3 opacity-60 hover:opacity-100 flex-shrink-0">
            <X size={13} />
          </button>
        </div>
      )}

      {/* Outbound call form */}
      {showForm && (
        <div className="mb-6 p-5 rounded-xl border border-zinc-200 bg-white shadow-sm">
          <h3 className="text-sm font-semibold text-zinc-900 mb-1">
            Initiate outbound call
          </h3>
          {twilioNumber && (
            <p className="text-xs text-zinc-400 mb-4">Calling from {twilioNumber}</p>
          )}
          <div className="flex gap-3">
            <input
              type="tel"
              placeholder="+15551234567"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && makeCall()}
              className="flex-1 bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors"
            />
            <button
              onClick={makeCall}
              disabled={calling || !phone.trim()}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 transition-colors"
            >
              {calling ? <Loader2 size={13} className="animate-spin" /> : <Phone size={13} />}
              {calling ? 'Calling…' : 'Call'}
            </button>
            <button
              onClick={() => { setShowForm(false); setPhone('') }}
              className="px-4 py-2 rounded-lg border border-zinc-200 text-zinc-500 text-sm hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
          </div>
          <p className="mt-2 text-xs text-zinc-400">
            Use E.164 format, e.g. +15551234567. The AI receptionist handles the conversation.
          </p>
        </div>
      )}

      {/* Call logs table */}
      <div className="rounded-xl border border-zinc-100 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-100 grid grid-cols-5 gap-4 text-xs text-zinc-400 uppercase tracking-wider">
          <span>Caller</span><span>Summary</span><span>Duration</span><span>Status</span><span>Time</span>
        </div>

        {calls.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <div className="w-12 h-12 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center">
              <Phone size={20} className="text-zinc-400" />
            </div>
            <p className="text-sm text-zinc-400">No calls recorded yet. Your AI receptionist is ready.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {calls.map(call => (
              <details key={call.callId} className="group px-5 py-4 cursor-pointer hover:bg-zinc-50 transition-colors">
                <summary className="grid grid-cols-5 gap-4 items-center list-none">
                  <span className="text-sm font-mono text-zinc-800">{call.phone}</span>
                  <span className="text-sm text-zinc-600 truncate">{call.summary || '—'}</span>
                  <span className="text-sm text-zinc-600">{Math.round(call.duration / 60)}m {call.duration % 60}s</span>
                  <span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${
                      call.status === 'completed'
                        ? 'bg-teal-50 text-teal-700 border-teal-100'
                        : 'bg-zinc-50 text-zinc-500 border-zinc-100'
                    }`}>
                      {call.status}
                    </span>
                  </span>
                  <span className="text-xs text-zinc-400">{new Date(call.timestamp).toLocaleString()}</span>
                </summary>
                <div className="mt-4 p-4 rounded-lg bg-zinc-50 border border-zinc-100 font-mono text-xs text-zinc-600 whitespace-pre-wrap leading-relaxed">
                  {call.transcript || 'No transcript available.'}
                </div>
              </details>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
