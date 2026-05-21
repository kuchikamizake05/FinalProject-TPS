import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react'
import { DISPATCH_LABELS, SCENARIO_LABELS } from '../../simulation/constants'
import type { DispatchStrategy, Scenario, SimulationConfig, SimulationMode } from '../../simulation/types'

interface ControlPanelProps {
  config: SimulationConfig
  mode: SimulationMode
  onConfigChange: (patch: Partial<SimulationConfig>) => void
  onStart: () => void
  onPause: () => void
  onReset: () => void
  onStep: () => void
}

const scenarioOptions = Object.entries(SCENARIO_LABELS) as Array<[Scenario, string]>
const dispatchOptions = Object.entries(DISPATCH_LABELS) as Array<[DispatchStrategy, string]>

export function ControlPanel({
  config,
  mode,
  onConfigChange,
  onStart,
  onPause,
  onReset,
  onStep,
}: ControlPanelProps) {
  const isRunning = mode === 'running'

  return (
    <>
      <div className="glass-panel-header">
        <div>
          <p className="glass-eyebrow">Simulation Control</p>
          <h2 className="glass-panel-title">Parameter Simulasi</h2>
        </div>
        <span className={`glass-status-badge ${mode}`}>{mode}</span>
      </div>

      <div className="glass-button-row">
        <button
          className={`glass-btn-primary ${isRunning ? 'running' : ''}`}
          type="button"
          onClick={isRunning ? onPause : onStart}
        >
          {isRunning ? <Pause size={16} /> : <Play size={16} />}
          <span>{isRunning ? 'Pause' : 'Start'}</span>
        </button>
        <button className="glass-btn-icon" type="button" onClick={onStep} title="Step 1 detik">
          <SkipForward size={16} />
        </button>
        <button className="glass-btn-icon" type="button" onClick={onReset} title="Reset">
          <RotateCcw size={16} />
        </button>
      </div>

      <div className="glass-field">
        <label className="glass-field-label">Skenario Gedung</label>
        <div className="glass-select-wrap">
          <select value={config.scenario} onChange={(e) => onConfigChange({ scenario: e.target.value as Scenario })}>
            {scenarioOptions.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass-field">
        <label className="glass-field-label">Strategi Dispatcher</label>
        <div className="glass-select-wrap">
          <select
            value={config.dispatchStrategy}
            onChange={(e) => onConfigChange({ dispatchStrategy: e.target.value as DispatchStrategy })}
          >
            {dispatchOptions.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      <GliderField
        label="Arrival rate"
        value={config.arrivalRate}
        min={1}
        max={30}
        unit="org/menit"
        onChange={(arrivalRate) => onConfigChange({ arrivalRate })}
      />
      <GliderField
        label="Durasi"
        value={config.durationMinutes}
        min={5}
        max={60}
        step={5}
        unit="menit"
        onChange={(durationMinutes) => onConfigChange({ durationMinutes })}
      />
      <GliderField
        label="Speed demo"
        value={config.speed}
        min={1}
        max={30}
        unit="x"
        onChange={(speed) => onConfigChange({ speed })}
      />
      <GliderField
        label="Kapasitas lift"
        value={config.elevatorCapacity}
        min={8}
        max={14}
        unit="orang"
        onChange={(elevatorCapacity) => onConfigChange({ elevatorCapacity })}
      />

      <details className="glass-advanced">
        <summary className="glass-advanced-summary">▸ Advanced Settings</summary>
        <div className="glass-advanced-content">
          <GliderField
            label="Waktu per lantai"
            value={config.secondsPerFloor}
            min={8}
            max={20}
            unit="detik"
            onChange={(secondsPerFloor) => onConfigChange({ secondsPerFloor })}
          />
          <GliderField
            label="Board/alight"
            value={config.boardingSecondsPerPerson}
            min={3}
            max={12}
            unit="detik/org"
            onChange={(boardingSecondsPerPerson) => onConfigChange({ boardingSecondsPerPerson })}
          />
          <div className="glass-field">
            <label className="glass-field-label">Random seed</label>
            <input
              className="glass-input-number"
              type="number"
              value={config.randomSeed}
              onChange={(e) => onConfigChange({ randomSeed: Number(e.target.value) || 1 })}
            />
          </div>
        </div>
      </details>
    </>
  )
}

interface GliderFieldProps {
  label: string
  value: number
  min: number
  max: number
  unit: string
  step?: number
  onChange: (value: number) => void
}

function GliderField({ label, value, min, max, unit, step = 1, onChange }: GliderFieldProps) {
  return (
    <div className="glass-field glass-slider-field">
      <label className="glass-field-label">
        <span>{label}</span>
        <strong className="glass-field-value">
          {value} <span className="glass-field-unit">{unit}</span>
        </strong>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  )
}
