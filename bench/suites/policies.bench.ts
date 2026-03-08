import { group, summary } from "mitata"
import { consume, registerAsyncBenchmark, registerBenchmark, try$ } from "../shared"

const signal = new AbortController().signal
const retryBuilder = try$.retry(3)
const signalRunSyncBuilder = try$.signal(signal) as unknown as {
  runSync<T>(tryFn: () => T): T
}
const signalRunBuilder = try$.signal(signal)
const timeoutBuilder = try$.timeout(60_000)
const timeoutAsyncBuilder = try$.timeout(60_000)
const signalTimeoutAsyncBuilder = try$.signal(signal).timeout(60_000)
const wrapBuilder = try$.wrap((_, next) => next())

export function registerPoliciesBenchmarks() {
  group("policies", () => {
    summary(() => {
      registerBenchmark("policies", "builder/retry-timeout-signal-chain", () => {
        consume(try$.retry(3).timeout(60_000).signal(signal))
      })

      registerBenchmark("policies", "retry/runSync/succeeds-on-third-attempt", () => {
        let attempts = 0

        consume(
          retryBuilder.runSync(() => {
            attempts += 1

            if (attempts < 3) {
              throw new Error("retry")
            }

            return attempts
          })
        )
      })

      registerAsyncBenchmark("policies", "timeout/run/success-no-expiry", async () => {
        consume(await timeoutBuilder.run(() => 42))
      })

      registerAsyncBenchmark("policies", "signal/run/async-success-no-abort", async () => {
        consume(await signalRunBuilder.run(() => Promise.resolve(42)))
      })

      registerAsyncBenchmark("policies", "timeout/run/async-success-no-expiry", async () => {
        consume(await timeoutAsyncBuilder.run(() => Promise.resolve(42)))
      })

      registerAsyncBenchmark(
        "policies",
        "signal-timeout/run/async-success-no-abort-no-expiry",
        async () => {
          consume(await signalTimeoutAsyncBuilder.run(() => Promise.resolve(42)))
        }
      )

      registerBenchmark("policies", "signal/runSync/success", () => {
        consume(signalRunSyncBuilder.runSync(() => 42))
      })

      registerBenchmark("policies", "wrap/runSync/success", () => {
        consume(wrapBuilder.runSync(() => 42))
      })
    })
  })
}
