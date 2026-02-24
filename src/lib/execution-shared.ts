import type { BuilderConfig } from "./types/builder"
import type { TryCtx } from "./types/core"
import type { RunTryFn } from "./types/run"

export function executeWithWraps<T>(wraps: BuilderConfig["wraps"], ctx: TryCtx, run: () => T): T {
  if (!wraps || wraps.length === 0) {
    return run()
  }

  let next: RunTryFn<unknown, TryCtx> = (_ctx) => run()

  for (const wrap of wraps.toReversed()) {
    const previous: RunTryFn<unknown, TryCtx> = next

    next = (currentCtx) => wrap(currentCtx, previous)
  }

  return next(ctx) as T
}
