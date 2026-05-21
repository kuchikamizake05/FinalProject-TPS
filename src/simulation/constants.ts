import type { SimulationConfig } from './types'

export const EAST_FLOORS = [1, 4, 5, 6, 7]
export const WEST_FLOORS = [1, 5, 8, 9, 10, 11]
export const INVALID_FLOORS = [2, 3]
export const ALL_ACCESSIBLE_FLOORS = [1, 4, 5, 6, 7, 8, 9, 10, 11]
export const OVERLAP_FLOOR = 5

export const DEFAULT_CONFIG: SimulationConfig = {
  durationMinutes: 30,
  arrivalRate: 12,
  elevatorCapacity: 14,
  maxWeightKg: 1100,
  averagePassengerWeightKg: 70,
  secondsPerFloor: 12,
  boardingSecondsPerPerson: 6,
  scenario: 'normal',
  dispatchStrategy: 'nearest',
  speed: 10,
  randomSeed: 2026,
}

export const SCENARIO_LABELS = {
  normal: 'Normal',
  morning: 'Jam masuk',
  classChange: 'Pergantian kelas',
  leaving: 'Jam pulang',
}

export const DISPATCH_LABELS = {
  nearest: 'Nearest valid elevator',
  roundRobin: 'Round robin',
}
