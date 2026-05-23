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
      <div className="flex items-start justify-between gap-4 mb-4.5">
        <div>
          <p className="m-0 mb-1 text-[0.68rem] font-[650] tracking-wider uppercase text-[#b6c7e0]/58">Simulation Control</p>
          <h2 className="m-0 font-claude-serif text-[1.24rem] font-[650] text-text-primary tracking-normal">Parameter Simulasi</h2>
        </div>
        <span className={`px-3 py-1.5 rounded-lg text-[0.68rem] font-extrabold tracking-wider uppercase border whitespace-nowrap shadow-neu-inset transition-all duration-300 ${
          mode === 'running'
            ? 'border-accent-emerald/20 bg-[#1c222b] text-accent-emerald'
            : mode === 'paused'
            ? 'border-accent-amber/20 bg-[#1c222b] text-accent-amber'
            : 'border-[#323c4c]/20 bg-[#1c222b] text-text-muted'
        }`}>{mode}</span>
      </div>
      <div className="flex items-center gap-3 mb-5">
        <button
          className={`group flex-1 inline-flex items-center justify-center gap-2.5 min-h-[44px] rounded-xl font-black text-[0.88rem] tracking-wider uppercase border cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] focus:outline-none active:scale-[0.97] ${
            isRunning
              ? 'border-accent-coral/25 bg-[#1c222b] text-accent-coral shadow-neu-inset'
              : 'border-accent-emerald/25 bg-[#252c38] text-accent-emerald shadow-neu-flat hover:shadow-neu-flat-hover hover:border-accent-emerald/40'
          }`}
          type="button"
          onClick={isRunning ? onPause : onStart}
        >
          {isRunning ? (
            <Pause size={16} className="group-hover:scale-110 transition-transform duration-200" />
          ) : (
            <Play size={16} className="group-hover:scale-110 group-hover:translate-x-0.5 transition-transform duration-200" />
          )}
          <span>{isRunning ? 'Pause' : 'Start'}</span>
        </button>
        
        <button
          className="group w-[44px] h-[44px] shrink-0 inline-flex items-center justify-center rounded-xl border border-[#323c4c]/25 bg-[#252c38] text-text-secondary cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-accent-cyan/35 hover:text-accent-cyan hover:scale-[1.02] shadow-neu-flat hover:shadow-neu-flat-hover active:shadow-neu-inset active:scale-95 focus:outline-none"
          type="button"
          onClick={onStep}
          title="Step 1 detik"
        >
          <SkipForward size={16} className="group-hover:scale-110 group-hover:translate-x-0.5 transition-transform duration-200" />
        </button>

        <button
          className="group w-[44px] h-[44px] shrink-0 inline-flex items-center justify-center rounded-xl border border-[#323c4c]/25 bg-[#252c38] text-text-secondary cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-accent-coral/35 hover:text-accent-coral hover:scale-[1.02] shadow-neu-flat hover:shadow-neu-flat-hover active:shadow-neu-inset active:scale-95 focus:outline-none"
          type="button"
          onClick={onReset}
          title="Reset"
        >
          <RotateCcw size={16} className="group-hover:rotate-[-45deg] group-hover:scale-110 transition-transform duration-300" />
        </button>
      </div>

      <div className="flex flex-col gap-2 mb-4.5">
        <label className="flex justify-between items-center text-[0.76rem] font-semibold text-text-secondary tracking-wide">
          <span>Preset Skenario Lalu Lintas</span>
        </label>
        <div className="grid grid-cols-2 gap-2">
          {scenarioOptions.map(([value]) => {
            const isActive = config.scenario === value
            let btnColors = ''
            if (isActive) {
              if (value === 'morning') btnColors = 'border-accent-cyan/25 bg-[#1c222b] text-accent-cyan shadow-neu-inset'
              else if (value === 'classChange') btnColors = 'border-accent-amber/25 bg-[#1c222b] text-accent-amber shadow-neu-inset'
              else if (value === 'leaving') btnColors = 'border-accent-coral/25 bg-[#1c222b] text-accent-coral shadow-neu-inset'
              else btnColors = 'border-accent-indigo/25 bg-[#1c222b] text-accent-indigo shadow-neu-inset'
            } else {
              btnColors = 'border-[#323c4c]/25 bg-[#252c38] text-text-secondary shadow-neu-flat hover:shadow-neu-flat-hover hover:border-[#323c4c]/40 hover:text-text-primary active:shadow-neu-inset active:scale-[0.98]'
            }

            return (
              <button
                key={value}
                type="button"
                className={`py-2.5 px-2 text-center text-xs font-bold border rounded-xl transition-all duration-200 cursor-pointer ${btnColors}`}
                onClick={() => onConfigChange({ scenario: value })}
              >
                {value === 'morning'
                  ? 'Jam Masuk'
                  : value === 'classChange'
                  ? 'Jam Makan Siang'
                  : value === 'leaving'
                  ? 'Jam Pulang'
                  : 'Normal'}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex flex-col gap-2 mb-3.5">
        <label className="flex justify-between items-center text-[0.76rem] font-semibold text-text-secondary tracking-wide">Strategi Dispatcher</label>
        <div className="relative after:content-[''] after:absolute after:right-3.5 after:top-1/2 after:w-1.5 after:h-1.5 after:border-r-[1.5px] after:border-b-[1.5px] after:border-text-muted/60 after:-translate-y-[65%] after:rotate-45 after:pointer-events-none">
          <select
            className="w-full min-h-[42px] border border-[#323c4c]/35 rounded-xl px-3.5 pr-9 text-text-primary bg-[#1c222b] shadow-neu-inset focus:outline-none focus:border-accent-cyan/50 text-[0.86rem] font-medium appearance-none cursor-pointer transition-all duration-200"
            value={config.dispatchStrategy}
            onChange={(e) => onConfigChange({ dispatchStrategy: e.target.value as DispatchStrategy })}
          >
            {dispatchOptions.map(([value, label]) => (
              <option key={value} value={value} className="bg-[#1c222b] text-text-primary">{label}</option>
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

      <details className="mt-2.5 border-t border-[#323c4c]/20 pt-3">
        <summary className="text-text-muted cursor-pointer text-[0.72rem] font-bold tracking-widest uppercase select-none outline-none transition-colors duration-200 hover:text-text-secondary list-none flex items-center gap-1.5">▸ Advanced Settings</summary>
        <div className="mt-4 [animation:slideDownGlass_0.2s_ease-out]">
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
          <div className="flex flex-col gap-2 mb-3.5">
            <label className="flex justify-between items-center text-[0.76rem] font-semibold text-text-secondary tracking-wide">Random seed</label>
            <input
              className="w-full min-h-[42px] border border-[#323c4c]/35 rounded-xl px-3.5 text-text-primary bg-[#1c222b] shadow-neu-inset focus:outline-none focus:border-accent-cyan/50 text-[0.86rem] font-medium transition-all duration-200"
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
    <div className="flex flex-col gap-2 mb-2.5">
      <label className="flex justify-between items-center text-[0.76rem] font-semibold text-text-secondary tracking-wide">
        <span>{label}</span>
        <strong className="font-extrabold text-text-primary">
          {value} <span className="font-medium text-text-muted text-[0.68rem]">{unit}</span>
        </strong>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-accent-cyan"
      />
    </div>
  )
}
