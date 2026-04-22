import { getSession } from '@/lib/session'
import { listCustomers } from '@/lib/dynamodb'
import { Users } from 'lucide-react'

export const metadata = { title: 'Customers — VoiceOps AI' }

export default async function CustomersPage() {
  const session = await getSession()
  const customers = await listCustomers(session!.userId)

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900">Customers</h1>
        <p className="text-sm text-zinc-500 mt-1">Every caller your AI has spoken with, automatically captured.</p>
      </div>

      <div className="rounded-xl border border-zinc-100 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-zinc-100 grid grid-cols-4 gap-4 text-xs text-zinc-400 uppercase tracking-wider">
          <span>Name</span><span>Phone</span><span>Total calls</span><span>Last seen</span>
        </div>

        {customers.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3">
            <div className="w-12 h-12 rounded-full bg-zinc-50 border border-zinc-100 flex items-center justify-center">
              <Users size={20} className="text-zinc-400" />
            </div>
            <p className="text-sm text-zinc-400">No customers yet. They'll appear here after their first call.</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {customers.map(c => (
              <div key={c.phone} className="px-5 py-4 grid grid-cols-4 gap-4 items-center hover:bg-zinc-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-semibold text-zinc-600">
                    {(c.name ?? '?')[0].toUpperCase()}
                  </div>
                  <span className="text-sm text-zinc-900">{c.name ?? 'Unknown'}</span>
                </div>
                <span className="text-sm font-mono text-zinc-600">{c.phone}</span>
                <span className="text-sm text-zinc-600">{c.callCount}</span>
                <span className="text-xs text-zinc-400">{new Date(c.lastSeen).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
