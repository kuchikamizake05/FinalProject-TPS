import { EAST_FLOORS, OVERLAP_FLOOR, WEST_FLOORS } from './constants'
import type { Elevator, ElevatorBank, Passenger, SimulationConfig, SimulationState } from './types'

export function bankServesFloor(bank: ElevatorBank, floor: number) {
  return bank === 'east' ? EAST_FLOORS.includes(floor) : WEST_FLOORS.includes(floor)
}

export function validBanksForTrip(originFloor: number, destinationFloor: number) {
  return (['east', 'west'] as ElevatorBank[]).filter(
    (bank) => bankServesFloor(bank, originFloor) && bankServesFloor(bank, destinationFloor),
  )
}

export function chooseBankForTrip(
  originFloor: number,
  destinationFloor: number,
  waitingQueues: SimulationState['waitingQueues'],
  elevators: Elevator[],
): ElevatorBank | null {
  const validBanks = validBanksForTrip(originFloor, destinationFloor)

  if (validBanks.length === 0) return null
  if (validBanks.length === 1) return validBanks[0]

  if (originFloor === OVERLAP_FLOOR || destinationFloor === OVERLAP_FLOOR) {
    const [first, second] = validBanks
    const firstCount = elevators
      .filter((elevator) => elevator.bank === first)
      .reduce((sum, elevator) => sum + (waitingQueues[elevator.id]?.length ?? 0), 0)
    const secondCount = elevators
      .filter((elevator) => elevator.bank === second)
      .reduce((sum, elevator) => sum + (waitingQueues[elevator.id]?.length ?? 0), 0)
    return firstCount <= secondCount ? first : second
  }

  return validBanks[0]
}

export function chooseElevatorForTrip(
  originFloor: number,
  destinationFloor: number,
  state: SimulationState,
  config: SimulationConfig,
) {
  const assignedBank = chooseBankForTrip(originFloor, destinationFloor, state.waitingQueues, state.elevators)
  if (!assignedBank) return null

  const validElevators = state.elevators.filter(
    (elevator) =>
      elevator.bank === assignedBank &&
      bankServesFloor(elevator.bank, originFloor) &&
      bankServesFloor(elevator.bank, destinationFloor),
  )
  if (!validElevators.length) return null

  if (config.dispatchStrategy === 'roundRobin') {
    const selected = validElevators[state.roundRobinCursor[assignedBank] % validElevators.length]
    return {
      assignedBank,
      assignedElevatorId: selected.id,
      roundRobinCursor: {
        ...state.roundRobinCursor,
        [assignedBank]: (state.roundRobinCursor[assignedBank] + 1) % validElevators.length,
      },
    }
  }

  const selected = validElevators
    .map((elevator) => ({
      elevator,
      score:
        (state.waitingQueues[elevator.id]?.length ?? 0) * 2 +
        Math.abs(elevator.currentFloor - originFloor) +
        elevator.targetFloors.length,
    }))
    .sort((a, b) => a.score - b.score)[0].elevator

  return {
    assignedBank,
    assignedElevatorId: selected.id,
    roundRobinCursor: state.roundRobinCursor,
  }
}

function addTarget(elevator: Elevator, floor: number) {
  if (Math.abs(elevator.currentFloor - floor) < 0.01) return elevator.targetFloors
  if (elevator.targetFloors.includes(floor)) return elevator.targetFloors
  return [...elevator.targetFloors, floor]
}

function nearestElevator(elevators: Elevator[], passenger: Passenger) {
  return elevators
    .filter((elevator) => elevator.passengers.length < elevator.capacity)
    .sort((a, b) => {
      const aDistance = Math.abs(a.currentFloor - passenger.originFloor) + a.targetFloors.length * 2
      const bDistance = Math.abs(b.currentFloor - passenger.originFloor) + b.targetFloors.length * 2
      return aDistance - bDistance
    })[0]
}

export function dispatchWaitingPassengers(state: SimulationState, config: SimulationConfig): SimulationState {
  const elevators = state.elevators.map((elevator) => ({ ...elevator, targetFloors: [...elevator.targetFloors] }))

  for (const elevator of elevators) {
    const queued = state.waitingQueues[elevator.id] ?? []
    const activeFloors = Array.from(new Set(queued.map((passenger) => passenger.originFloor)))

    for (const floor of activeFloors) {
      const firstPassenger = queued.find((passenger) => passenger.originFloor === floor)
      if (!firstPassenger) continue

      const selected = config.dispatchStrategy === 'roundRobin' ? elevator : nearestElevator([elevator], firstPassenger)

      if (!selected) continue
      selected.targetFloors = addTarget(selected, floor)
    }
  }

  return { ...state, elevators }
}
