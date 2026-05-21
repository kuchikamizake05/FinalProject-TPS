export type ElevatorBank = 'east' | 'west'
export type ElevatorSide = 'north' | 'south'
export type Direction = 'up' | 'down' | 'idle'
export type ElevatorStatus = 'idle' | 'moving' | 'boarding'
export type PassengerStatus = 'waiting' | 'riding' | 'completed'
export type Scenario = 'normal' | 'morning' | 'classChange' | 'leaving'
export type DispatchStrategy = 'nearest' | 'roundRobin'
export type SimulationMode = 'idle' | 'running' | 'paused' | 'finished'

export interface Elevator {
  id: string
  bank: ElevatorBank
  side: ElevatorSide
  label: string
  currentFloor: number
  targetFloors: number[]
  direction: Direction
  capacity: number
  maxWeightKg: number
  passengers: Passenger[]
  status: ElevatorStatus
  servedFloors: number[]
  busyTime: number
  doorTimer: number
}

export interface Passenger {
  id: string
  originFloor: number
  destinationFloor: number
  arrivalTime: number
  boardingTime?: number
  exitTime?: number
  assignedBank: ElevatorBank
  assignedElevatorId: string
  groupSize: number
  status: PassengerStatus
}

export interface SimulationConfig {
  durationMinutes: number
  arrivalRate: number
  elevatorCapacity: number
  maxWeightKg: number
  averagePassengerWeightKg: number
  secondsPerFloor: number
  boardingSecondsPerPerson: number
  scenario: Scenario
  dispatchStrategy: DispatchStrategy
  speed: number
  randomSeed: number
}

export interface Metrics {
  avgWaitTime: number
  maxWaitTime: number
  avgTravelTime: number
  servedCount: number
  remainingQueue: number
  totalGenerated: number
  throughputPerMinute: number
  utilizationByElevator: Record<string, number>
  queueLengthByFloor: Record<number, number>
  utilizationByBank: Record<ElevatorBank, number>
}

export interface TrendPoint {
  time: number
  avgWait: number
  queue: number
  served: number
  eastUtilization: number
  westUtilization: number
}

export interface SimulationState {
  mode: SimulationMode
  time: number
  elevators: Elevator[]
  waitingQueues: Record<string, Passenger[]>
  completedPassengers: Passenger[]
  metrics: Metrics
  trends: TrendPoint[]
  nextPassengerId: number
  roundRobinCursor: Record<ElevatorBank, number>
  seed: number
}
