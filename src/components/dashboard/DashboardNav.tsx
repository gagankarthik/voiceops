'use client'

import { Mic, LayoutDashboard, Phone, Users, Calendar, Settings, LogOut, BookOpen } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { href: '/dashboard/calls', label: 'Call Logs', icon: Phone },
  { href: '/dashboard/customers', label: 'Customers', icon: Users },
  { href: '/dashboard/calendar', label: 'Calendar', icon: Calendar },
  { href: '/dashboard/knowledge', label: 'Knowledge', icon: BookOpen },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
]

export default function DashboardNav({ businessName, twilioNumber }: { businessName?: string; twilioNumber?: string }) {
  const path = usePathname()
  const router = useRouter()

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/')
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-56 border-r border-zinc-100 bg-white flex flex-col shadow-sm">
      <div className="px-5 h-16 border-b border-zinc-100 flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-zinc-900 flex items-center justify-center">
            <Mic size={10} className="text-white" />
          </div>
          <span className="text-xs font-semibold text-zinc-900 truncate">{businessName ?? 'VoiceOps'}</span>
        </div>
        {twilioNumber && (
          <p className="text-[10px] text-zinc-400 font-mono mt-0.5 ml-7">{twilioNumber}</p>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path === href || (href !== '/dashboard' && path.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? 'bg-zinc-900 text-white'
                  : 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50'
              }`}
            >
              <Icon size={15} />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="px-3 pb-5">
        <button
          onClick={logout}
          className="flex items-center gap-3 px-3 py-2 w-full rounded-lg text-sm text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
        >
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </aside>
  )
}
