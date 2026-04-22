import { Mic } from 'lucide-react'

export default function AuthCard({ title, sub, children }: {
  title: string
  sub: string
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-7 h-7 rounded-lg bg-zinc-900 flex items-center justify-center">
            <Mic size={13} className="text-white" />
          </div>
          <span className="text-zinc-900 font-semibold tracking-tight">VoiceOps</span>
          <span className="text-zinc-400 font-mono text-xs">AI</span>
        </div>
        <div className="rounded-2xl border border-zinc-100 bg-white shadow-sm p-8">
          <h1 className="text-xl font-bold text-zinc-900 mb-1">{title}</h1>
          <p className="text-sm text-zinc-500 mb-6">{sub}</p>
          {children}
        </div>
      </div>
    </div>
  )
}
