import { useState } from 'react'
import { createPortal } from 'react-dom'
import { Maximize2, Pause, Play, RotateCcw, SkipForward, X } from 'lucide-react'
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
  const [isModalOpen, setIsModalOpen] = useState(false)

  const mainControls = (
    <>
      <div className="flex items-center gap-3 mb-6">
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

      <div className="flex flex-col gap-3 mb-6">
        <label className="flex justify-between items-center text-[0.8rem] font-semibold text-text-secondary tracking-wide">
          <span>Preset Skenario Lalu Lintas</span>
        </label>
        <div className="grid grid-cols-2 gap-2.5">
          {scenarioOptions.map(([value]) => {
            const isActive = config.scenario === value
            let btnColors = ''
            if (isActive) {
              if (value === 'morning') btnColors = 'border-accent-cyan/25 bg-[#1c222b] text-accent-cyan shadow-neu-inset ring-1 ring-accent-cyan/20'
              else if (value === 'classChange') btnColors = 'border-accent-amber/25 bg-[#1c222b] text-accent-amber shadow-neu-inset ring-1 ring-accent-amber/20'
              else if (value === 'leaving') btnColors = 'border-accent-coral/25 bg-[#1c222b] text-accent-coral shadow-neu-inset ring-1 ring-accent-coral/20'
              else btnColors = 'border-accent-indigo/25 bg-[#1c222b] text-accent-indigo shadow-neu-inset ring-1 ring-accent-indigo/20'
            } else {
              btnColors = 'border-[#323c4c]/25 bg-[#252c38] text-text-secondary shadow-neu-flat hover:shadow-neu-flat-hover hover:border-[#323c4c]/40 hover:text-text-primary active:shadow-neu-inset active:scale-[0.98]'
            }

            return (
              <button
                key={value}
                type="button"
                className={`py-3 px-2 text-center text-[0.8rem] font-bold border rounded-xl transition-all duration-200 cursor-pointer ${btnColors}`}
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

      <div className="flex flex-col gap-3 mb-4">
        <label className="flex justify-between items-center text-[0.8rem] font-semibold text-text-secondary tracking-wide">Strategi Dispatcher</label>
        <div className="relative after:content-[''] after:absolute after:right-4 after:top-1/2 after:w-2 after:h-2 after:border-r-[1.5px] after:border-b-[1.5px] after:border-text-muted/60 after:-translate-y-[65%] after:rotate-45 after:pointer-events-none">
          <select
            className="w-full min-h-[46px] border border-[#323c4c]/35 rounded-xl px-4 pr-10 text-text-primary bg-[#1c222b] shadow-neu-inset focus:outline-none focus:border-accent-cyan/50 text-[0.9rem] font-medium appearance-none cursor-pointer transition-all duration-200 hover:border-[#323c4c]/60"
            value={config.dispatchStrategy}
            onChange={(e) => onConfigChange({ dispatchStrategy: e.target.value as DispatchStrategy })}
          >
            {dispatchOptions.map(([value, label]) => (
              <option key={value} value={value} className="bg-[#1c222b] text-text-primary py-1">{label}</option>
            ))}
          </select>
        </div>
      </div>
    </>
  )

  const parameterControls = (
    <>
      <div className="flex flex-col gap-3">
        <GliderField
          label="Arrival rate"
          value={config.arrivalRate}
          min={1}
          max={30}
          unit="org/menit"
          onChange={(arrivalRate) => onConfigChange({ arrivalRate })}
        />
        <GliderField
          label="Durasi simulasi"
          value={config.durationMinutes}
          min={5}
          max={60}
          step={5}
          unit="menit"
          onChange={(durationMinutes) => onConfigChange({ durationMinutes })}
        />
        <GliderField
          label="Kecepatan (Speed)"
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

        <details className="mt-3 border-t border-[#323c4c]/20 pt-4 group">
          <summary className="text-text-muted cursor-pointer text-[0.75rem] font-bold tracking-widest uppercase select-none outline-none transition-colors duration-200 hover:text-text-secondary list-none flex items-center gap-2">
            <span className="transition-transform duration-200 group-open:rotate-90">▸</span> Advanced Settings
          </summary>
          <div className="mt-5 flex flex-col gap-3 [animation:slideDownGlass_0.2s_ease-out]">
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
            <div className="flex flex-col gap-2">
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
      </div>
    </>
  )

  return (
    <>
      <div className="flex items-start justify-between gap-4 mb-4.5">
        <div>
          <p className="m-0 mb-1 text-[0.68rem] font-[650] tracking-wider uppercase text-[#b6c7e0]/58">Simulation Control</p>
          <h2 className="m-0 font-claude-serif text-[1.24rem] font-[650] text-text-primary tracking-normal">Parameter Simulasi</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-3 py-1.5 rounded-lg text-[0.68rem] font-extrabold tracking-wider uppercase border whitespace-nowrap shadow-neu-inset transition-all duration-300 ${
            mode === 'running'
              ? 'border-accent-emerald/20 bg-[#1c222b] text-accent-emerald'
              : mode === 'paused'
              ? 'border-accent-amber/20 bg-[#1c222b] text-accent-amber'
              : 'border-[#323c4c]/20 bg-[#1c222b] text-text-muted'
          }`}>{mode}</span>
          <button
            onClick={() => setIsModalOpen(true)}
            className="p-1.5 rounded-lg border border-[#323c4c]/40 bg-[#1c222b] text-text-secondary hover:text-accent-cyan hover:bg-[#323c4c]/40 transition-colors shadow-neu-flat cursor-pointer h-[32px] w-[32px] flex items-center justify-center"
            title="Perbesar Kontrol"
          >
            <Maximize2 size={16} />
          </button>
        </div>
      </div>

      <div className="flex flex-col">
        {mainControls}
        {parameterControls}
      </div>

      {isModalOpen && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 md:p-12 bg-black/60 backdrop-blur-sm animate-[fadeInGlass_0.2s_ease-out]">
          <div className="relative w-full max-w-4xl flex flex-col bg-[#252c38] rounded-2xl border border-[#323c4c]/40 shadow-2xl overflow-hidden max-h-full">
            <div className="flex items-center justify-between p-5 md:px-8 border-b border-[#323c4c]/40 bg-[#1c222b] shrink-0">
              <div>
                <p className="m-0 mb-1 text-[0.75rem] font-[650] tracking-wider uppercase text-accent-cyan/80">Simulation Control</p>
                <h2 className="m-0 font-claude-serif text-[1.4rem] leading-none font-[650] text-text-primary tracking-normal">Parameter Simulasi</h2>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-4 py-2 rounded-xl text-[0.75rem] font-extrabold tracking-wider uppercase border whitespace-nowrap shadow-neu-inset ${
                  mode === 'running'
                    ? 'border-accent-emerald/20 bg-[#1c222b] text-accent-emerald'
                    : mode === 'paused'
                    ? 'border-accent-amber/20 bg-[#1c222b] text-accent-amber'
                    : 'border-[#323c4c]/20 bg-[#1c222b] text-text-muted'
                }`}>{mode}</span>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2.5 rounded-xl bg-[#252c38] border border-[#323c4c]/30 text-text-secondary hover:text-accent-coral hover:bg-[#323c4c]/40 hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-neu-flat"
                  title="Tutup"
                >
                  <X size={22} />
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-0 p-5 md:p-8 bg-[#252c38] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 lg:gap-x-14 gap-y-8 items-start">
                <div className="flex flex-col">
                  {mainControls}
                </div>
                <div className="flex flex-col">
                  {parameterControls}
                </div>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
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
    <div className="flex flex-col gap-2 mb-2">
      <label className="flex justify-between items-center text-[0.8rem] font-semibold text-text-secondary tracking-wide">
        <span>{label}</span>
        <strong className="font-extrabold text-text-primary">
          {value} <span className="font-medium text-text-muted text-[0.7rem]">{unit}</span>
        </strong>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-accent-cyan cursor-pointer h-1.5 bg-[#1c222b] rounded-lg appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-accent-cyan [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(34,211,238,0.5)]"
      />
    </div>
  )
}
