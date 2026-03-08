import { bench, do_not_optimize } from "mitata"
import * as try$ from "../src/index"
import { BENCHMARK_SUITE_VERSION } from "./constants"

type BenchmarkGroup = "core" | "orchestration" | "policies"

const benchmarkGroups = new Map<string, BenchmarkGroup>()

let blackhole: unknown

export function consume<T>(value: T) {
  blackhole = value
  do_not_optimize(blackhole)
  return value
}

export function registerBenchmark(group: BenchmarkGroup, name: string, fn: () => unknown) {
  assertUniqueBenchmarkName(group, name)
  return bench(name, fn).gc("once")
}

export function registerAsyncBenchmark(
  group: BenchmarkGroup,
  name: string,
  fn: () => Promise<unknown>
) {
  assertUniqueBenchmarkName(group, name)
  return bench(name, fn).gc("once")
}

export function getBenchmarkGroups() {
  return Object.fromEntries(benchmarkGroups)
}

export { BENCHMARK_SUITE_VERSION }
export { try$ }

function assertUniqueBenchmarkName(group: BenchmarkGroup, name: string) {
  if (benchmarkGroups.has(name)) {
    throw new Error(`Duplicate benchmark name: ${name}`)
  }

  benchmarkGroups.set(name, group)
}
