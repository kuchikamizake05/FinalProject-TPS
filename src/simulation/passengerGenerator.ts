import { ALL_ACCESSIBLE_FLOORS } from './constants'
import { chooseElevatorForTrip } from './dispatch'
import { random, randomInt, weightedPick } from './random'
import type { Passenger, SimulationConfig, SimulationState } from './types'

const upperFloors = ALL_ACCESSIBLE_FLOORS.filter((floor) => floor !== 1)

function pickTrip(seed: number, config: SimulationConfig) {
  if (config.scenario === 'morning') {
    const roll = random(seed)
    seed = roll.seed
    if (roll.value < 0.90) {
      // 90% chance: L1 to upper floors (Jam Masuk)
      const picked = weightedPick(seed, [
        { value: 4, weight: 12 },
        { value: 5, weight: 18 },
        { value: 6, weight: 12 },
        { value: 7, weight: 10 },
        { value: 8, weight: 10 },
        { value: 9, weight: 12 },
        { value: 10, weight: 10 },
        { value: 11, weight: 8 },
      ])
      return { originFloor: 1, destinationFloor: picked.value, seed: picked.seed }
    } else {
      // 10% chance: upper floors to upper floors
      const origin = weightedPick(
        seed,
        upperFloors.map((floor) => ({ value: floor, weight: floor === 5 ? 14 : 10 })),
      )
      const destination = weightedPick(
        origin.seed,
        upperFloors.filter((floor) => floor !== origin.value).map((floor) => ({ value: floor, weight: 10 })),
      )
      return { originFloor: origin.value, destinationFloor: destination.value, seed: destination.seed }
    }
  }

  if (config.scenario === 'leaving') {
    const roll = random(seed)
    seed = roll.seed
    if (roll.value < 0.90) {
      // 90% chance: upper floors to L1 (Jam Pulang)
      const origin = weightedPick(
        seed,
        upperFloors.map((floor) => ({ value: floor, weight: floor === 5 ? 14 : 10 })),
      )
      return { originFloor: origin.value, destinationFloor: 1, seed: origin.seed }
    } else {
      // 10% chance: upper floors to upper floors
      const origin = weightedPick(
        seed,
        upperFloors.map((floor) => ({ value: floor, weight: floor === 5 ? 14 : 10 })),
      )
      const destination = weightedPick(
        origin.seed,
        upperFloors.filter((floor) => floor !== origin.value).map((floor) => ({ value: floor, weight: 10 })),
      )
      return { originFloor: origin.value, destinationFloor: destination.value, seed: destination.seed }
    }
  }

  if (config.scenario === 'classChange') {
    const roll = random(seed)
    seed = roll.seed
    if (roll.value < 0.40) {
      // 40% chance: upper floors to L1 (Jam Makan Siang - pergi makan)
      const origin = weightedPick(
        seed,
        upperFloors.map((floor) => ({ value: floor, weight: floor === 5 ? 14 : 10 })),
      )
      return { originFloor: origin.value, destinationFloor: 1, seed: origin.seed }
    } else if (roll.value < 0.80) {
      // 40% chance: L1 to upper floors (Jam Makan Siang - kembali dari makan)
      const dest = weightedPick(
        seed,
        upperFloors.map((floor) => ({ value: floor, weight: floor === 5 ? 14 : 10 })),
      )
      return { originFloor: 1, destinationFloor: dest.value, seed: dest.seed }
    } else {
      // 20% chance: upper floors to upper floors (pergantian kelas)
      const origin = weightedPick(
        seed,
        upperFloors.map((floor) => ({ value: floor, weight: floor === 5 ? 14 : 10 })),
      )
      const destination = weightedPick(
        origin.seed,
        upperFloors.filter((floor) => floor !== origin.value).map((floor) => ({ value: floor, weight: 10 })),
      )
      return { originFloor: origin.value, destinationFloor: destination.value, seed: destination.seed }
    }
  }

  const origin = weightedPick(seed, [
    { value: 1, weight: 45 },
    ...upperFloors.map((floor) => ({ value: floor, weight: 7 })),
  ])
  const destinationOptions = ALL_ACCESSIBLE_FLOORS.filter((floor) => floor !== origin.value)
  const destination = weightedPick(
    origin.seed,
    destinationOptions.map((floor) => ({ value: floor, weight: floor === 5 ? 14 : 10 })),
  )

  return { originFloor: origin.value, destinationFloor: destination.value, seed: destination.seed }
}

export function generatePassengers(state: SimulationState, config: SimulationConfig): SimulationState {
  const arrivalChance = config.arrivalRate / 60
  let seed = state.seed
  let nextPassengerId = state.nextPassengerId
  const waitingQueues = Object.fromEntries(
    Object.entries(state.waitingQueues).map(([elevatorId, queue]) => [elevatorId, [...queue]]),
  )

  const arrival = random(seed)
  seed = arrival.seed
  if (arrival.value > arrivalChance) {
    return { ...state, seed }
  }

  const group = randomInt(seed, 1, 3)
  seed = group.seed
  const trip = pickTrip(seed, config)
  seed = trip.seed

  const assignment = chooseElevatorForTrip(trip.originFloor, trip.destinationFloor, state, config)
  if (!assignment) {
    return { ...state, seed }
  }

  const passenger: Passenger = {
    id: `P${nextPassengerId}`,
    originFloor: trip.originFloor,
    destinationFloor: trip.destinationFloor,
    arrivalTime: state.time,
    assignedBank: assignment.assignedBank,
    assignedElevatorId: assignment.assignedElevatorId,
    groupSize: group.value,
    status: 'waiting',
  }

  waitingQueues[assignment.assignedElevatorId].push(passenger)
  nextPassengerId += 1

  return { ...state, waitingQueues, nextPassengerId, seed, roundRobinCursor: assignment.roundRobinCursor }
}
