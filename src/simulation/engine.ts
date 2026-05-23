import { EAST_FLOORS, WEST_FLOORS } from './constants'
import { dispatchWaitingPassengers } from './dispatch'
import { generatePassengers } from './passengerGenerator'
import { appendTrend, calculateMetrics } from './metrics'
import type { Elevator, ElevatorBank, ElevatorSide, Passenger, SimulationConfig, SimulationState } from './types'

function createElevator(
  id: string,
  bank: ElevatorBank,
  side: ElevatorSide,
  label: string,
  servedFloors: number[],
  config: SimulationConfig,
): Elevator {
  return {
    id,
    bank,
    side,
    label,
    currentFloor: 1,
    targetFloors: [],
    direction: 'idle',
    capacity: config.elevatorCapacity,
    maxWeightKg: config.maxWeightKg,
    passengers: [],
    status: 'idle',
    servedFloors,
    busyTime: 0,
    doorTimer: 0,
  }
}

export function createInitialState(config: SimulationConfig): SimulationState {
  const baseState: SimulationState = {
    mode: 'idle',
    time: 0,
    elevators: [
      createElevator('WN', 'west', 'north', 'Barat Utara', WEST_FLOORS, config),
      createElevator('WS', 'west', 'south', 'Barat Selatan', WEST_FLOORS, config),
      createElevator('EN', 'east', 'north', 'Timur Utara', EAST_FLOORS, config),
      createElevator('ES', 'east', 'south', 'Timur Selatan', EAST_FLOORS, config),
    ],
    waitingQueues: { WN: [], WS: [], EN: [], ES: [] },
    completedPassengers: [],
    metrics: {
      avgWaitTime: 0,
      maxWaitTime: 0,
      avgTravelTime: 0,
      servedCount: 0,
      remainingQueue: 0,
      totalGenerated: 0,
      throughputPerMinute: 0,
      utilizationByElevator: {},
      queueLengthByFloor: {},
      utilizationByBank: { east: 0, west: 0 },
    },
    trends: [],
    nextPassengerId: 1,
    roundRobinCursor: { east: 0, west: 0 },
    seed: config.randomSeed,
  }

  return { ...baseState, metrics: calculateMetrics(baseState) }
}

function removeTargetsAtCurrentFloor(elevator: Elevator) {
  return elevator.targetFloors.filter((floor) => Math.abs(floor - elevator.currentFloor) > 0.01)
}

function passengerWeight(passengers: Passenger[], config: SimulationConfig) {
  return passengers.reduce((sum, passenger) => sum + passenger.groupSize * config.averagePassengerWeightKg, 0)
}

function processStop(
  elevator: Elevator,
  waitingQueue: Passenger[],
  time: number,
  config: SimulationConfig,
): { elevator: Elevator; waitingQueue: Passenger[]; completed: Passenger[] } {
  const currentFloor = Math.round(elevator.currentFloor)
  const exiting = elevator.passengers.filter((passenger) => passenger.destinationFloor === currentFloor)
  const riding = elevator.passengers.filter((passenger) => passenger.destinationFloor !== currentFloor)
  const completed = exiting.map((passenger) => ({ ...passenger, status: 'completed' as const, exitTime: time }))

  let currentPassengers = riding
  const remainingQueue: Passenger[] = []
  const boarding: Passenger[] = []

  for (const passenger of waitingQueue) {
    const nextCount = currentPassengers.reduce((sum, item) => sum + item.groupSize, 0) + passenger.groupSize
    const nextWeight = passengerWeight(currentPassengers, config) + passenger.groupSize * config.averagePassengerWeightKg
    const canBoard =
      passenger.originFloor === currentFloor &&
      nextCount <= config.elevatorCapacity &&
      nextWeight <= config.maxWeightKg &&
      elevator.servedFloors.includes(passenger.destinationFloor)

    if (canBoard) {
      const ridingPassenger = { ...passenger, boardingTime: time, status: 'riding' as const }
      boarding.push(ridingPassenger)
      currentPassengers = [...currentPassengers, ridingPassenger]
    } else {
      remainingQueue.push(passenger)
    }
  }

  const targetFloors = Array.from(
    new Set([...removeTargetsAtCurrentFloor(elevator), ...boarding.map((passenger) => passenger.destinationFloor)]),
  )
  const doorTimer = Math.max(2, (boarding.length + exiting.length) * config.boardingSecondsPerPerson)

  return {
    elevator: {
      ...elevator,
      passengers: currentPassengers,
      targetFloors,
      status: boarding.length || exiting.length ? 'boarding' : targetFloors.length ? 'moving' : 'idle',
      doorTimer: boarding.length || exiting.length ? doorTimer : 0,
    },
    waitingQueue: remainingQueue,
    completed,
  }
}

function moveElevator(elevator: Elevator, config: SimulationConfig) {
  const target = elevator.targetFloors[0]
  if (!target) {
    return { ...elevator, direction: 'idle' as const, status: 'idle' as const }
  }

  const delta = target - elevator.currentFloor
  const step = 1 / config.secondsPerFloor
  const direction = delta > 0 ? ('up' as const) : ('down' as const)
  const nextFloor = Math.abs(delta) <= step ? target : elevator.currentFloor + Math.sign(delta) * step

  return {
    ...elevator,
    currentFloor: nextFloor,
    direction,
    status: 'moving' as const,
    busyTime: elevator.busyTime + 1,
  }
}

export function stepSimulation(previous: SimulationState, config: SimulationConfig): SimulationState {
  const durationSeconds = config.durationMinutes * 60
  if (previous.time >= durationSeconds) {
    return { ...previous, mode: 'finished' }
  }

  let state = generatePassengers({ ...previous, time: previous.time + 1 }, config)
  state = dispatchWaitingPassengers(state, config)

  const waitingQueues = Object.fromEntries(
    Object.entries(state.waitingQueues).map(([elevatorId, queue]) => [elevatorId, [...queue]]),
  )
  const completedPassengers = [...state.completedPassengers]

  const elevators = state.elevators.map((elevator) => {
    let currentElevator = { ...elevator }

    // Algoritma Standby (Home Floor): Kembali ke Lantai 1 jika kosong & idle pada Jam Masuk Pagi
    if (
      config.scenario === 'morning' &&
      currentElevator.targetFloors.length === 0 &&
      currentElevator.passengers.length === 0 &&
      (state.waitingQueues[currentElevator.id]?.length ?? 0) === 0 &&
      Math.abs(currentElevator.currentFloor - 1) > 0.01
    ) {
      currentElevator.targetFloors = [1]
    }

    if (currentElevator.doorTimer > 0) {
      return {
        ...currentElevator,
        doorTimer: currentElevator.doorTimer - 1,
        status: 'boarding' as const,
        busyTime: currentElevator.busyTime + 1,
      }
    }

    const hasArrived = currentElevator.targetFloors.some((floor) => Math.abs(floor - currentElevator.currentFloor) < 0.01)
    if (hasArrived) {
      const stopped = processStop(currentElevator, waitingQueues[currentElevator.id] ?? [], state.time, config)
      waitingQueues[currentElevator.id] = stopped.waitingQueue
      completedPassengers.push(...stopped.completed)
      return stopped.elevator
    }

    return moveElevator(currentElevator, config)
  })

  const nextState = {
    ...state,
    elevators,
    waitingQueues,
    completedPassengers,
  }
  const metrics = calculateMetrics(nextState)
  const withMetrics = { ...nextState, metrics }

  return {
    ...withMetrics,
    mode: state.time >= durationSeconds ? 'finished' : state.mode,
    trends: appendTrend(withMetrics, durationSeconds),
  }
}
