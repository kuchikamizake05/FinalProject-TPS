export function nextSeed(seed: number) {
  return (seed * 1664525 + 1013904223) >>> 0
}

export function random(seed: number) {
  const next = nextSeed(seed)
  return { value: next / 4294967296, seed: next }
}

export function randomInt(seed: number, min: number, max: number) {
  const result = random(seed)
  return {
    value: Math.floor(result.value * (max - min + 1)) + min,
    seed: result.seed,
  }
}

export function weightedPick<T>(seed: number, options: Array<{ value: T; weight: number }>) {
  const total = options.reduce((sum, option) => sum + option.weight, 0)
  const result = random(seed)
  let cursor = result.value * total

  for (const option of options) {
    cursor -= option.weight
    if (cursor <= 0) {
      return { value: option.value, seed: result.seed }
    }
  }

  return { value: options[options.length - 1].value, seed: result.seed }
}
