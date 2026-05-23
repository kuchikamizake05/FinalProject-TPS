import { Activity, Clock3, Users, Waves } from 'lucide-react'
import type { Metrics } from '../../simulation/types'

interface MetricsPanelProps {
  metrics: Metrics
  time: number
  durationSeconds: number
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  return `${minutes}:${String(rest).padStart(2, '0')}`
}

function formatSeconds(value: number) {
  return `${Math.round(value)}s`
}

export function MetricsPanel({ metrics, time, durationSeconds }: MetricsPanelProps) {
  const progress = Math.min(100, (time / durationSeconds) * 100)

  return (
    <>
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="m-0 mb-1 text-[0.68rem] font-[650] tracking-wider uppercase text-accent-cyan/80">Live Metrics</p>
          <h2 className="m-0 font-claude-serif text-[1.12rem] font-[650] text-text-primary tracking-tight">Statistik Simulasi</h2>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3 min-h-0 max-md:grid-cols-2 max-sm:grid-cols-1">
        <MetricCard
          icon={<Clock3 size={16} />}
          label="Avg Wait Time"
          value={formatSeconds(metrics.avgWaitTime)}
          color="c-emerald"
          badge="Optimal"
        />
        <MetricCard
          icon={<Waves size={16} />}
          label="Max Wait Time"
          value={formatSeconds(metrics.maxWaitTime)}
          color="c-amber"
          badge="Limit"
        />
        <MetricCard
          icon={<Users size={16} />}
          label="Total Served"
          value={String(metrics.servedCount)}
          color="c-indigo"
          badge="Done"
        />
        <MetricCard
          icon={<Activity size={16} />}
          label="Active Queue"
          value={String(metrics.remainingQueue)}
          color="c-cyan"
          badge="Live"
        />
      </div>

      {/* Progress bar — spans full width */}
      <div className="col-span-full border border-[#323c4c]/20 rounded-2xl bg-[#252c38] px-4 py-3 flex items-center gap-4 mt-3 max-sm:flex-col max-sm:items-start max-sm:gap-2.5 shadow-neu-flat hover:shadow-neu-flat-hover transition-all duration-300">
        <span className="text-[0.68rem] font-bold text-text-muted uppercase tracking-widest whitespace-nowrap">Runtime</span>
        <strong className="text-[0.98rem] font-extrabold text-text-primary whitespace-nowrap tracking-tight bg-clip-text bg-gradient-to-r from-white via-[#f0f6ff] to-[#b4c8e6]">
          {formatTime(time)} <span className="text-text-muted font-normal">/</span> {formatTime(durationSeconds)}
        </strong>
        <div className="relative flex-1 w-full h-3.5 rounded-full bg-[#1c222b] overflow-hidden shadow-neu-inset border border-[#323c4c]/10">
          <div 
            className="h-full rounded-full bg-gradient-to-r from-accent-cyan via-accent-blue to-accent-indigo transition-[width] duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] relative"
            style={{ width: `${progress}%` }}
          >
            {/* Pulsing overlay inside the progress bar */}
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_0%,rgba(255,255,255,0.25)_50%,transparent_100%)] bg-[length:200%_100%] animate-[pulse_1.8s_infinite]" />
          </div>
        </div>
      </div>
    </>
  )
}

interface MetricCardProps {
  icon: React.ReactNode
  label: string
  value: string
  color: 'c-emerald' | 'c-amber' | 'c-indigo' | 'c-cyan'
  badge: string
}

function MetricCard({ icon, label, value, color, badge }: MetricCardProps) {
  const isEmerald = color === 'c-emerald'
  const isAmber = color === 'c-amber'
  const isIndigo = color === 'c-indigo'

  const indicatorGradient = isEmerald
    ? 'from-accent-emerald to-transparent'
    : isAmber
    ? 'from-accent-amber to-transparent'
    : isIndigo
    ? 'from-accent-indigo to-transparent'
    : 'from-accent-cyan to-transparent'

  const glowShadow = isEmerald
    ? 'hover:border-accent-emerald/30'
    : isAmber
    ? 'hover:border-accent-amber/30'
    : isIndigo
    ? 'hover:border-accent-indigo/30'
    : 'hover:border-accent-cyan/30'

  const iconClass = isEmerald
    ? 'text-accent-emerald'
    : isAmber
    ? 'text-accent-amber'
    : isIndigo
    ? 'text-accent-indigo'
    : 'text-accent-cyan'

  const badgeClass = isEmerald
    ? 'bg-accent-emerald/15 text-accent-emerald'
    : isAmber
    ? 'bg-accent-amber/15 text-accent-amber'
    : isIndigo
    ? 'bg-accent-indigo/15 text-accent-indigo'
    : 'bg-accent-cyan/16 text-accent-cyan'

  return (
    <article className={`group relative border border-[#323c4c]/20 rounded-2xl bg-[#252c38] min-h-0 p-3.5 pl-4.5 flex items-center gap-3.5 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.99] active:translate-y-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden shadow-neu-flat hover:shadow-neu-flat-hover ${glowShadow}`}>
      {/* Dynamic left indicator line with smooth transition */}
      <div className={`absolute left-0 top-0 w-[3px] group-hover:w-[4px] h-full opacity-50 group-hover:opacity-100 bg-gradient-to-b ${indicatorGradient} transition-all duration-300`} />

      <div className="flex items-center gap-2">
        <div className={`grid w-[36px] h-[36px] place-items-center rounded-xl bg-[#1c222b] shadow-neu-inset place-content-center transition-transform duration-300 group-hover:scale-105 border border-[#323c4c]/10 ${iconClass}`}>{icon}</div>
        <span className={`hidden text-[0.6rem] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full ${badgeClass}`}>{badge}</span>
      </div>
      <div className="min-w-0 flex-1">
        <span className="block overflow-hidden text-[0.62rem] font-bold text-text-muted uppercase tracking-widest text-ellipsis whitespace-nowrap">{label}</span>
        <strong className="block mt-0.5 text-[1.28rem] font-black text-text-primary leading-none tracking-tight">{value}</strong>
      </div>
    </article>
  )
}

