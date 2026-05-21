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
      <div className="glass-panel-header" style={{ marginBottom: 16 }}>
        <div>
          <p className="glass-eyebrow">Live Metrics</p>
          <h2 className="glass-panel-title">Statistik Simulasi</h2>
        </div>
      </div>

      <div className="metrics-grid-glass">
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
      <div className="progress-glass">
        <span className="progress-label-glass">Runtime</span>
        <strong className="progress-time-glass">
          {formatTime(time)} <span className="progress-sep-glass">/</span> {formatTime(durationSeconds)}
        </strong>
        <div className="progress-bar-wrap-glass">
          <div className="progress-bar-fill-glass" style={{ width: `${progress}%` }} />
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
  return (
    <article className={`metric-card-glass ${color}`}>
      <div className="metric-top-glass">
        <div className={`metric-icon-glass ${color}`}>{icon}</div>
        <span className={`metric-badge-glass ${color}`}>{badge}</span>
      </div>
      <div>
        <span className="metric-label-glass">{label}</span>
        <strong className="metric-value-glass">{value}</strong>
      </div>
    </article>
  )
}
