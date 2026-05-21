import { Building2 } from 'lucide-react'
import { ChartsPanel } from './components/dashboard/ChartsPanel'
import { MetricsPanel } from './components/dashboard/MetricsPanel'
import { ControlPanel } from './components/controls/ControlPanel'
import { BuildingScene } from './components/scene/BuildingScene'
import { SCENARIO_LABELS } from './simulation/constants'
import { useSimulation } from './hooks/useSimulation'

function App() {
  const { config, state, durationSeconds, updateConfig, start, pause, reset, singleStep } = useSimulation()

  return (
    <div className="app-shell-glass">

      {/* ─── NAVBAR ─── */}
      <nav className="app-navbar-glass">
        <div className="navbar-brand-glass">
          <div className="navbar-logo-glass">
            <Building2 size={20} />
          </div>
          <div className="navbar-title-glass">
            <span className="navbar-tagline-glass">SGLC Elevator Stochastic Simulation</span>
            <span className="navbar-name-glass">Simulasi Lift SGLC</span>
          </div>
        </div>

        <div className="navbar-scenario-glass">
          <span>Scenario</span>
          <strong>{SCENARIO_LABELS[config.scenario]}</strong>
        </div>

        <div className="navbar-status-glass">
          <div className="navbar-status-dot-glass" />
          <span>
            {state.mode === 'running' ? 'Running' : state.mode === 'paused' ? 'Paused' : 'Ready'}
          </span>
        </div>
      </nav>

      {/* ─── MAIN CONTENT ─── */}
      <main className="app-content-glass">

        {/* TOP ROW: Scene (left) ↔ Control Panel (right) */}
        <div className="workspace-top-glass">
          {/* 3D Scene — DO NOT TOUCH internals */}
          <div className="scene-shell-glass">
            <BuildingScene elevators={state.elevators} waitingQueues={state.waitingQueues} />
          </div>

          {/* Control Panel */}
          <div className="glass-panel controls-glass">
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
        <div className="workspace-bottom-glass">
          {/* Metrics Panel */}
          <div className="glass-panel metrics-glass">
            <MetricsPanel metrics={state.metrics} time={state.time} durationSeconds={durationSeconds} />
          </div>

          {/* Charts Panel */}
          <div className="glass-panel chart-glass">
            <ChartsPanel trends={state.trends} />
          </div>
        </div>

      </main>

      <footer className="app-footer-glass">
        <div className="footer-brand-glass">
          <Building2 size={13} />
          <span>Simulasi Lift SGLC</span>
          <div className="footer-dot-glass" />
          <span>TPS Final Project</span>
        </div>

      </footer>

    </div>
  )
}

export default App
