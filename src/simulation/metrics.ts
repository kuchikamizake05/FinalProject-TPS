import type { ElevatorBank, Metrics, Passenger, SimulationState } from './types'

export function calculateMetrics(state: SimulationState): Metrics {
  const completed = state.completedPassengers
  const waitTimes = completed.map((passenger) => (passenger.boardingTime ?? passenger.arrivalTime) - passenger.arrivalTime)
  const travelTimes = completed.map((passenger) => (passenger.exitTime ?? passenger.arrivalTime) - (passenger.boardingTime ?? passenger.arrivalTime))
  const allWaitingPassengers = Object.values(state.waitingQueues).flat()
  const remainingQueue = allWaitingPassengers.reduce((sum, passenger) => sum + passenger.groupSize, 0)
  const elapsed = Math.max(1, state.time)

  const queueLengthByFloor: Record<number, number> = {}
  ;(allWaitingPassengers as Passenger[]).forEach((passenger) => {
    queueLengthByFloor[passenger.originFloor] = (queueLengthByFloor[passenger.originFloor] ?? 0) + passenger.groupSize
  })

  const utilizationByElevator = Object.fromEntries(
    state.elevators.map((elevator) => [elevator.id, Math.min(100, (elevator.busyTime / elapsed) * 100)]),
  )

  const utilizationByBank = (['east', 'west'] as ElevatorBank[]).reduce(
    (acc, bank) => {
      const bankElevators = state.elevators.filter((elevator) => elevator.bank === bank)
      const avg =
        bankElevators.reduce((sum, elevator) => sum + (utilizationByElevator[elevator.id] ?? 0), 0) / bankElevators.length
      acc[bank] = avg
      return acc
    },
    {} as Record<ElevatorBank, number>,
  )

  return {
    avgWaitTime: waitTimes.length ? waitTimes.reduce((sum, value) => sum + value, 0) / waitTimes.length : 0,
    maxWaitTime: waitTimes.length ? Math.max(...waitTimes) : 0,
    avgTravelTime: travelTimes.length ? travelTimes.reduce((sum, value) => sum + value, 0) / travelTimes.length : 0,
    servedCount: completed.reduce((sum, passenger) => sum + passenger.groupSize, 0),
    remainingQueue: remainingQueue,
    totalGenerated: Math.max(0, state.nextPassengerId - 1),
    throughputPerMinute: completed.length ? completed.length / Math.max(1, elapsed / 60) : 0,
    utilizationByElevator,
    queueLengthByFloor,
    utilizationByBank,
  }
}

export function appendTrend(state: SimulationState, durationSeconds: number) {
  if (state.time % 30 !== 0 && state.time !== durationSeconds) return state.trends

  return [
    ...state.trends.slice(-59),
    {
      time: Math.round(state.time / 60),
      avgWait: Math.round(state.metrics.avgWaitTime),
      queue: state.metrics.remainingQueue,
      served: state.metrics.servedCount,
      eastUtilization: Math.round(state.metrics.utilizationByBank.east ?? 0),
      westUtilization: Math.round(state.metrics.utilizationByBank.west ?? 0),
    },
  ]
}
