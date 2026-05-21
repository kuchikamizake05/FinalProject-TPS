import { useCallback, useEffect, useMemo, useState } from 'react'
import { DEFAULT_CONFIG } from '../simulation/constants'
import { createInitialState, stepSimulation } from '../simulation/engine'
import type { SimulationConfig, SimulationState } from '../simulation/types'

export function useSimulation() {
  const [config, setConfig] = useState<SimulationConfig>(DEFAULT_CONFIG)
  const [state, setState] = useState<SimulationState>(() => createInitialState(DEFAULT_CONFIG))
  const durationSeconds = useMemo(() => config.durationMinutes * 60, [config.durationMinutes])

  const reset = useCallback((nextConfig = config) => {
    setState(createInitialState(nextConfig))
  }, [config])

  const updateConfig = useCallback(
    (patch: Partial<SimulationConfig>) => {
      setConfig((current) => {
        const next = { ...current, ...patch }
        setState(createInitialState(next))
        return next
      })
    },
    [],
  )

  const start = useCallback(() => {
    setState((current) => ({ ...current, mode: 'running' }))
  }, [])

  const pause = useCallback(() => {
    setState((current) => ({ ...current, mode: current.mode === 'running' ? 'paused' : current.mode }))
  }, [])

  const singleStep = useCallback(() => {
    setState((current) => stepSimulation({ ...current, mode: current.mode === 'idle' ? 'paused' : current.mode }, config))
  }, [config])

  useEffect(() => {
    if (state.mode !== 'running') return

    const interval = window.setInterval(() => {
      setState((current) => stepSimulation(current, config))
    }, Math.max(16, 1000 / config.speed))

    return () => window.clearInterval(interval)
  }, [config, state.mode])

  return {
    config,
    state,
    durationSeconds,
    updateConfig,
    start,
    pause,
    reset,
    singleStep,
  }
}
