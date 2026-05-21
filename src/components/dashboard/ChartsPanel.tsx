import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { TrendPoint } from '../../simulation/types'

interface ChartsPanelProps {
  trends: TrendPoint[]
}

export function ChartsPanel({ trends }: ChartsPanelProps) {
  const data = trends.length
    ? trends
    : [{ time: 0, avgWait: 0, queue: 0, served: 0, eastUtilization: 0, westUtilization: 0 }]

  return (
    <>
      <div className="glass-panel-header" style={{ marginBottom: 16 }}>
        <div>
          <p className="glass-eyebrow">Analytics Trends</p>
          <h2 className="glass-panel-title">Grafik Metrik</h2>
        </div>
      </div>

      <div className="chart-box-glass">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 8, right: 8, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="gAvgWait" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gQueue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#fbbf24" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#fbbf24" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gServed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#818cf8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#818cf8" stopOpacity={0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              stroke="rgba(255, 255, 255, 0.06)"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              stroke="transparent"
              tickLine={false}
              axisLine={false}
              dy={8}
              tick={{ fontSize: 10, fontWeight: 600, fill: 'rgba(140, 165, 200, 0.5)' }}
            />
            <YAxis
              stroke="transparent"
              tickLine={false}
              axisLine={false}
              dx={-4}
              tick={{ fontSize: 10, fontWeight: 600, fill: 'rgba(140, 165, 200, 0.5)' }}
            />
            <Tooltip
              contentStyle={{
                background: 'rgba(8, 15, 28, 0.9)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '12px',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5)',
                color: '#f0f6ff',
                fontSize: 12,
                fontFamily: 'inherit',
                fontWeight: 600,
                padding: '10px 14px',
              }}
              itemStyle={{ color: '#b4c8e6', fontWeight: 600, fontSize: 11 }}
              labelStyle={{ fontWeight: 800, color: '#f0f6ff', marginBottom: 6, fontSize: 12 }}
              cursor={{ stroke: 'rgba(255,255,255,0.08)', strokeWidth: 1 }}
            />
            <Legend
              verticalAlign="top"
              height={32}
              iconType="circle"
              iconSize={7}
              wrapperStyle={{
                fontSize: 11,
                paddingBottom: 8,
                fontWeight: 600,
                color: 'rgba(140, 165, 200, 0.7)',
              }}
            />
            <Area
              type="monotone"
              dataKey="avgWait"
              name="Avg Wait"
              stroke="#22d3ee"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#gAvgWait)"
              activeDot={{ r: 5, strokeWidth: 0, fill: '#22d3ee', style: { filter: 'drop-shadow(0 0 6px #22d3ee)' } }}
            />
            <Area
              type="monotone"
              dataKey="queue"
              name="Queue"
              stroke="#fbbf24"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#gQueue)"
              activeDot={{ r: 5, strokeWidth: 0, fill: '#fbbf24', style: { filter: 'drop-shadow(0 0 6px #fbbf24)' } }}
            />
            <Area
              type="monotone"
              dataKey="served"
              name="Served"
              stroke="#818cf8"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#gServed)"
              activeDot={{ r: 5, strokeWidth: 0, fill: '#818cf8', style: { filter: 'drop-shadow(0 0 6px #818cf8)' } }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </>
  )
}
