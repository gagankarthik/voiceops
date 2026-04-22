'use client'

import { useState } from 'react'
import { BookOpen, Plus, X, ChevronDown, Loader2 } from 'lucide-react'
import type { KnowledgeEntry } from '@/lib/dynamodb'

const TYPE_STYLES: Record<string, string> = {
  faq: 'bg-blue-50 text-blue-700 border-blue-100',
  policy: 'bg-purple-50 text-purple-700 border-purple-100',
  service: 'bg-teal-50 text-teal-700 border-teal-100',
  general: 'bg-zinc-50 text-zinc-500 border-zinc-100',
}

export default function KnowledgeClient({ initialEntries }: { initialEntries: KnowledgeEntry[] }) {
  const [entries, setEntries] = useState(initialEntries)
  const [showForm, setShowForm] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [form, setForm] = useState({ title: '', content: '', type: 'faq' })

  async function add() {
    if (!form.title || !form.content) return
    setSaving(true)
    const res = await fetch('/api/knowledge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    const data = await res.json()
    if (res.ok) {
      setEntries(e => [...e, data])
      setForm({ title: '', content: '', type: 'faq' })
      setShowForm(false)
    }
    setSaving(false)
  }

  async function remove(id: string) {
    setDeleting(id)
    await fetch('/api/knowledge', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ knowledgeId: id }),
    })
    setEntries(e => e.filter(x => x.knowledgeId !== id))
    setDeleting(null)
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">Knowledge Base</h1>
          <p className="text-sm text-zinc-500 mt-1">Everything your AI knows about your business.</p>
        </div>
        <button onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 transition-colors shadow-sm">
          <Plus size={14} /> Add knowledge
        </button>
      </div>

      {showForm && (
        <div className="mb-6 p-5 rounded-xl border border-zinc-200 bg-white shadow-sm space-y-3">
          <h3 className="text-sm font-semibold text-zinc-900">New entry</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs text-zinc-500 mb-1.5">Title *</label>
              <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. What is your cancellation policy?"
                className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 mb-1.5">Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 focus:outline-none focus:border-zinc-400">
                {['faq', 'policy', 'service', 'general'].map(t => (
                  <option key={t} value={t} className="capitalize">{t}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 mb-1.5">Content *</label>
            <textarea value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              placeholder="We require 24 hours notice for cancellations…"
              rows={4}
              className="w-full bg-white border border-zinc-200 rounded-lg px-3 py-2.5 text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-400 transition-colors resize-none" />
          </div>
          <div className="flex gap-2">
            <button onClick={add} disabled={saving || !form.title || !form.content}
              className="px-4 py-2 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-700 disabled:opacity-50 transition-colors">
              {saving ? 'Saving…' : 'Add'}
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg border border-zinc-200 text-zinc-500 text-sm hover:bg-zinc-50 transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {entries.length === 0 ? (
        <div className="flex flex-col items-center py-16 gap-3 rounded-xl border border-zinc-100 bg-white shadow-sm">
          <div className="w-12 h-12 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center">
            <BookOpen size={20} className="text-zinc-400" />
          </div>
          <p className="text-sm text-zinc-400">No knowledge entries yet. Add FAQs, policies, and service info.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {entries.map(e => (
            <div key={e.knowledgeId} className="rounded-xl border border-zinc-100 bg-white shadow-sm overflow-hidden">
              <div
                onClick={() => setExpanded(x => x === e.knowledgeId ? null : e.knowledgeId)}
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-zinc-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${TYPE_STYLES[e.type] ?? TYPE_STYLES.general}`}>
                    {e.type}
                  </span>
                  <span className="text-sm font-medium text-zinc-900">{e.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={ev => { ev.stopPropagation(); remove(e.knowledgeId) }}
                    disabled={deleting === e.knowledgeId}
                    className="text-zinc-400 hover:text-red-500 transition-colors">
                    {deleting === e.knowledgeId ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
                  </button>
                  <ChevronDown size={14} className={`text-zinc-400 transition-transform ${expanded === e.knowledgeId ? 'rotate-180' : ''}`} />
                </div>
              </div>
              {expanded === e.knowledgeId && (
                <div className="px-5 pb-4 pt-4 text-sm text-zinc-600 leading-relaxed border-t border-zinc-100 whitespace-pre-wrap">
                  {e.content}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
