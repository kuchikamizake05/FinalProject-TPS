import { useEffect, useRef, useState } from 'react'
import { Building2, Maximize2, Minimize2 } from 'lucide-react'
import { ChartsPanel } from './components/dashboard/ChartsPanel'
import { MetricsPanel } from './components/dashboard/MetricsPanel'
import { ControlPanel } from './components/controls/ControlPanel'
import { BuildingScene } from './components/scene/BuildingScene'
import { SCENARIO_LABELS } from './simulation/constants'
import { useSimulation } from './hooks/useSimulation'

function App() {
  const { config, state, durationSeconds, updateConfig, start, pause, reset, singleStep } = useSimulation()
  const appShellRef = useRef<HTMLDivElement>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    const syncFullscreenState = () => {
      setIsFullscreen(document.fullscreenElement === appShellRef.current)
    }

    document.addEventListener('fullscreenchange', syncFullscreenState)
    return () => document.removeEventListener('fullscreenchange', syncFullscreenState)
  }, [])

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await appShellRef.current?.requestFullscreen()
      return
    }

    await document.exitFullscreen()
  }

  return (
    <div className="relative z-10 w-full h-screen min-h-[640px] flex flex-col overflow-hidden font-ui text-text-primary max-xl:h-auto max-xl:min-h-screen max-xl:overflow-visible bg-[#252c38]" ref={appShellRef}>

      {/* ─── NAVBAR ─── */}
      <nav className="sticky top-0 z-[100] flex items-center justify-between gap-4 px-6 max-md:px-4 h-[64px] bg-[#252c38] border-b border-[#323c4c]/30 shadow-neu-flat transition-all duration-300 rounded-b-2xl">
        <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-cyan/15 to-transparent" />
        
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="grid w-[40px] h-[40px] border border-[#323c4c]/30 rounded-xl bg-[#252c38] shadow-neu-flat shrink-0 place-content-center hover:scale-105 transition-all duration-200 hover:shadow-neu-inset">
            <Building2 size={20} className="text-accent-cyan animate-pulse" />
          </div>
          <div className="flex flex-col gap-px min-w-0">
            <span className="overflow-hidden max-w-[360px] text-[0.62rem] font-bold tracking-widest uppercase text-accent-cyan/80 text-ellipsis whitespace-nowrap">SGLC Elevator Stochastic Simulation</span>
            <span className="font-claude-serif text-[1.12rem] font-bold text-text-primary tracking-tight leading-none whitespace-nowrap">Simulasi Lift SGLC</span>
          </div>
        </div>

        <div className="max-md:hidden inline-flex items-center justify-center gap-2.5 ml-auto px-4 py-2 border border-[#323c4c]/40 rounded-xl bg-[#1c222b] text-text-secondary text-[0.7rem] font-bold tracking-wider uppercase shadow-neu-inset hover:bg-[#1c222b]/80 transition-colors duration-200">
          <span className="text-text-muted">Scenario:</span>
          <strong className="text-accent-cyan font-extrabold tracking-normal normal-case">{SCENARIO_LABELS[config.scenario]}</strong>
        </div>

        <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-[#323c4c]/40 bg-[#1c222b] text-accent-emerald text-[0.74rem] font-bold min-w-[108px] capitalize shadow-neu-inset">
          <div className="w-[7.5px] h-[7.5px] rounded-full bg-accent-emerald animate-ping" />
          <span>
            {state.mode === 'running' ? 'Running' : state.mode === 'paused' ? 'Paused' : 'Ready'}
          </span>
        </div>

        <button
          className="inline-flex items-center justify-center w-[40px] h-[40px] shrink-0 border border-[#323c4c]/30 rounded-xl bg-[#252c38] text-text-secondary cursor-pointer transition-all duration-200 hover:text-accent-cyan hover:scale-[1.05] active:scale-95 shadow-neu-flat hover:shadow-neu-inset"
          type="button"
          onClick={toggleFullscreen}
          title={isFullscreen ? 'Keluar fullscreen' : 'Fullscreen'}
          aria-label={isFullscreen ? 'Keluar fullscreen' : 'Fullscreen'}
        >
          {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
        </button>
      </nav>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 min-h-0 grid grid-rows-[minmax(0,1fr)_clamp(206px,26vh,246px)] gap-6 px-6 py-5 pb-4.5 max-xl:block max-xl:px-6 max-xl:py-5 max-md:p-4 animate-[fadeInGlass_0.6s_cubic-bezier(0.16,1,0.3,1)] bg-[#252c38]">

        {/* TOP ROW: Scene (left) ↔ Control Panel (right) */}
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(370px,402px)] gap-6 items-stretch min-h-0 max-xl:grid-cols-1 max-xl:mb-5 max-xl:gap-4">
          {/* 3D Scene — DO NOT TOUCH internals */}
          <div className="border border-[#323c4c]/40 rounded-2xl overflow-hidden bg-[#1c222b] shadow-neu-inset h-full min-h-0 relative max-xl:h-[580px] max-xl:min-h-[440px]">
            <BuildingScene elevators={state.elevators} waitingQueues={state.waitingQueues} />
          </div>

          {/* Control Panel */}
          <div className="relative bg-[#252c38] border border-[#323c4c]/20 rounded-2xl p-5 flex flex-col h-full min-h-0 overflow-y-auto custom-scrollbar max-xl:h-auto max-xl:min-h-0 max-xl:max-h-none shadow-neu-flat hover:shadow-neu-flat-hover hover:border-[#323c4c]/40 transition-all duration-300">
            <ControlPanel
              config={config}
              mode={state.mode}
              onConfigChange={updateConfig}
              onStart={start}
              onPause={pause}
              onReset={() => reset()}
              onStep={singleStep}
            />
          </div>
        </div>

        {/* BOTTOM ROW: Metrics (left) ↔ Chart (right) */}
        <div className="grid grid-cols-[minmax(0,1fr)_minmax(370px,402px)] gap-6 items-stretch min-h-0 max-xl:grid-cols-1 max-xl:gap-4">
          {/* Metrics Panel */}
          <div className="relative bg-[#252c38] border border-[#323c4c]/20 rounded-2xl p-5 grid grid-rows-[auto_minmax(0,1fr)_auto] min-h-0 shadow-neu-flat hover:shadow-neu-flat-hover hover:border-[#323c4c]/40 transition-all duration-300">
            <MetricsPanel metrics={state.metrics} time={state.time} durationSeconds={durationSeconds} />
          </div>

          {/* Charts Panel */}
          <div className="relative bg-[#252c38] border border-[#323c4c]/20 rounded-2xl p-5 flex flex-col min-h-0 shadow-neu-flat hover:shadow-neu-flat-hover hover:border-[#323c4c]/40 transition-all duration-300">
            <ChartsPanel trends={state.trends} />
          </div>
        </div>

      </main>

    </div>
  )
}

export default App

