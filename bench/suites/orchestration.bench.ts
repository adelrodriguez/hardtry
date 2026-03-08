import { group, summary } from "mitata"
import { consume, registerAsyncBenchmark, try$ } from "../shared"

const signal = new AbortController().signal

const independentTasks = {
  a() {
    return 1
  },
  b() {
    return 2
  },
}

const dependencyTasks = {
  a() {
    return 1
  },
  async b(this: { $result: { a: Promise<number> } }) {
    return (await this.$result.a) + 1
  },
}

const disposerTasks = {
  a(this: { $disposer: AsyncDisposableStack }) {
    this.$disposer.defer(() => void 0)
    return 1
  },
  b(this: { $disposer: AsyncDisposableStack }) {
    this.$disposer.defer(() => void 0)
    return 2
  },
}

const settledTasks = {
  a() {
    return 1
  },
  b() {
    return 2
  },
}

const settledDisposerTasks = {
  a(this: { $disposer: AsyncDisposableStack }) {
    this.$disposer.defer(() => void 0)
    return 1
  },
  b(this: { $disposer: AsyncDisposableStack }) {
    this.$disposer.defer(() => void 0)
    return 2
  },
}

const flowTasks = {
  a(this: { $exit(value: string): never }) {
    return this.$exit("done")
  },
}

const flowDependencyExitTasks = {
  a() {
    return 1
  },
  async b(this: { $result: { a: Promise<number> }; $exit(value: string): never }) {
    return this.$exit(`done:${await this.$result.a}`)
  },
}

export function registerOrchestrationBenchmarks() {
  group("orchestration", () => {
    summary(() => {
      registerAsyncBenchmark("orchestration", "baseline/promise-all-two-values", async () => {
        consume(await Promise.all([Promise.resolve(1), Promise.resolve(2)]))
      })

      registerAsyncBenchmark("orchestration", "all/two-independent-sync-tasks", async () => {
        consume(await try$.all(independentTasks))
      })

      registerAsyncBenchmark(
        "orchestration",
        "all/two-independent-sync-tasks-with-signal",
        async () => {
          consume(await try$.signal(signal).all(independentTasks))
        }
      )

      registerAsyncBenchmark(
        "orchestration",
        "all/two-independent-sync-tasks-with-disposer",
        async () => {
          consume(await try$.all(disposerTasks))
        }
      )

      registerAsyncBenchmark("orchestration", "all/two-node-dependency", async () => {
        consume(await try$.all(dependencyTasks))
      })

      registerAsyncBenchmark("orchestration", "allSettled/two-successful-tasks", async () => {
        consume(await try$.allSettled(settledTasks))
      })

      registerAsyncBenchmark(
        "orchestration",
        "allSettled/two-successful-tasks-with-disposer",
        async () => {
          consume(await try$.allSettled(settledDisposerTasks))
        }
      )

      registerAsyncBenchmark("orchestration", "flow/immediate-exit", async () => {
        consume(await try$.flow(flowTasks))
      })

      registerAsyncBenchmark("orchestration", "flow/two-node-dependency-then-exit", async () => {
        consume(await try$.flow(flowDependencyExitTasks))
      })
    })
  })
}
