import { group, summary } from "mitata"
import { consume, registerAsyncBenchmark, registerBenchmark, try$ } from "../shared"

const DIRECT_SYNC_RESULT = 42
const DIRECT_ASYNC_RESULT = 42

function directSyncCall() {
  return DIRECT_SYNC_RESULT
}

function directAsyncCall() {
  return Promise.resolve(DIRECT_ASYNC_RESULT)
}

export function registerCoreBenchmarks() {
  group("core", () => {
    summary(() => {
      registerBenchmark("core", "baseline/direct-sync-call", () => {
        consume(directSyncCall())
      })

      registerBenchmark("core", "runSync/function/success", () => {
        consume(try$.runSync(() => DIRECT_SYNC_RESULT))
      })

      registerBenchmark("core", "runSync/object/success", () => {
        consume(
          try$.runSync({
            catch: () => "mapped",
            try: () => DIRECT_SYNC_RESULT,
          })
        )
      })

      registerBenchmark("core", "runSync/object/mapped-error", () => {
        consume(
          try$.runSync({
            catch: () => "mapped",
            try: () => {
              throw new Error("boom")
            },
          })
        )
      })

      registerAsyncBenchmark("core", "baseline/direct-async-call", async () => {
        consume(await directAsyncCall())
      })

      registerAsyncBenchmark("core", "run/function/sync-success", async () => {
        consume(await try$.run(() => DIRECT_SYNC_RESULT))
      })

      registerAsyncBenchmark("core", "run/function/async-success", async () => {
        consume(await try$.run(async () => await directAsyncCall()))
      })

      registerAsyncBenchmark("core", "run/object/mapped-error", async () => {
        consume(
          await try$.run({
            catch: () => "mapped",
            try: () => {
              throw new Error("boom")
            },
          })
        )
      })
    })
  })
}
