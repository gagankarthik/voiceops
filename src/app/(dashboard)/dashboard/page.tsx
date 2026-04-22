import { getSession } from '@/lib/session'
import { listCalls, listAppointments, getUser } from '@/lib/dynamodb'
import { Phone, Calendar, Users, TrendingUp } from 'lucide-react'

export const metadata = { title: 'Dashboard — VoiceOps AI' }

export default async function DashboardPage() {
  const session = await getSession()
  const [calls, appts, user] = await Promise.all([
    listCalls(session!.userId, 5),
    listAppointments(session!.userId),
    getUser(session!.userId),
  ])

  const today = new Date().toISOString().slice(0, 10)
  const todayCalls = calls.filter(c => c.timestamp.startsWith(today)).length
  const upcomingAppts = appts.filter(a => a.date >= today).length

  const stats = [
    { label: 'Calls today', value: todayCalls, icon: Phone, color: 'text-teal-600' },
    { label: 'Total calls', value: calls.length, icon: TrendingUp, color: 'text-zinc-600' },
    { label: 'Upcoming appts', value: upcomingAppts, icon: Calendar, color: 'text-blue-600' },
    { label: 'Customers', value: '—', icon: Users, color: 'text-purple-600' },
  ]

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900">
          Good morning{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
        </h1>
        <p className="text-sm text-zinc-500 mt-1">Here's what's happening with your AI receptionist.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="p-5 rounded-xl border border-zinc-100 bg-white shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-zinc-500">{s.label}</p>
              <s.icon size={14} className={s.color} />
            </div>
            <p className="text-2xl font-bold text-zinc-900">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Recent calls */}
      <div className="rounded-xl border border-zinc-100 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">Recent Calls</h2>
          <a href="/dashboard/calls" className="text-xs text-zinc-500 hover:text-zinc-900 transition-colors">View all →</a>
        </div>
        {calls.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-zinc-400">
            No calls yet. Your AI receptionist is ready to answer.
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {calls.map(call => (
              <div key={call.callId} className="px-5 py-4 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                <div>
                  <p className="text-sm text-zinc-900">{call.phone}</p>
                  <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">{call.summary || call.transcript?.slice(0, 60)}</p>
                </div>
                <div className="text-right">
                  <span className={`text-xs px-2 py-0.5 rounded-full border ${
                    call.status === 'completed'
                      ? 'bg-teal-50 text-teal-700 border-teal-100'
                      : 'bg-zinc-50 text-zinc-500 border-zinc-100'
                  }`}>
                    {call.status}
                  </span>
                  <p className="text-xs text-zinc-400 mt-1">{new Date(call.timestamp).toLocaleTimeString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
