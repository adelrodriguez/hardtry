# PR #18 Review Triage Checklist

Generated from review-comment verification on local `HEAD fbe3e59`.

Note: local `HEAD` is ahead of the current GitHub PR head (`6d14275`), so this checklist reflects the current workspace state.

## Fix in Code

- [ ] Preserve top-level `runSync` throw behavior for panic failures instead of returning `Panic` values through the bound builder export.
  - Current area: `src/index.ts`, `src/lib/executors/run-sync.ts`
  - Why: nested `runSync` panic cases still change observable public behavior.

- [ ] Tighten `RunBuilder` state typing so the constructor accepts `State` and `#state` is stored as `State`, not the looser `BuilderState`.
  - Current area: `src/lib/builder.ts`
  - Why: invalid generic/runtime state combinations still typecheck.

- [ ] Forward wrap-modified context through `BaseExecution` instead of always using `this.ctx`.
  - Current area: `src/lib/executors/base.ts`
  - Why: wraps can replace or clone `ctx`, but the terminal executor path currently ignores that replacement.

- [ ] Validate `retry.shouldRetry` returns a strict boolean and reject promise-like or other invalid values.
  - Current area: `src/lib/executors/base.ts`, `src/lib/modifiers/retry.ts`
  - Why: promise-returning `shouldRetry` callbacks currently retry until exhaustion instead of failing fast.

- [ ] Keep the internal standalone `runSync()` helper from wrapping promise-returning `catch` misconfiguration as `RUN_SYNC_CATCH_HANDLER_THROW`.
  - Current area: `src/lib/executors/run-sync.ts`
  - Why: the promise-like check still happens inside the `try`, so the config error is rewrapped as a panic about the handler throwing.

- [ ] Fix `executeRun()` overloads so object-form callers see the full `RunnerError` union.
  - Current area: `src/lib/executors/run.ts`
  - Why: duplicate overloads still allow narrower `Promise<T | E>` typing than runtime behavior.

- [ ] Add `UnhandledException` to the public `GenResult` type.
  - Current area: `src/lib/executors/gen.ts`
  - Why: the implementation returns `UnhandledException`, but the public type omits it.

- [ ] Replace the fail-fast abort test's time-based sleep with a readiness barrier.
  - Current area: `src/lib/executors/__tests__/shared.test.ts`
  - Why: the current test still depends on elapsed time and can flake.

- [ ] Remove explicit `Promise<...>` return annotations from local async test helpers where inference is enough.
  - Current area: `src/lib/executors/__tests__/shared.test.ts`
  - Why: this is still a style nit and remains inconsistent with project guidance.

## Make a Decision

- [ ] Decide whether `allSettled()` should keep its current cancellation asymmetry or document it explicitly.
  - Current area: `src/lib/executors/all-settled.ts`
  - Current behavior: outer cancellation does not short-circuit the aggregate; settled results are returned after tasks observe abort.
  - If kept: add a short comment near the direct `this.timeout.race(...)` call.

- [ ] Decide whether `allSettled()` should keep forcing `retryLimit: 1` or honor configured retry limits.
  - Current area: `src/lib/executors/all-settled.ts`, `src/lib/executors/__tests__/all-settled.test.ts`
  - Current behavior: wraps always see `ctx.retry.limit === 1`, and tests currently lock that in.

- [ ] Decide whether to leave the `FlowExecution` and `TaskExecution` duplication in place for now.
  - Current area: `src/lib/executors/flow.ts`, `src/lib/executors/shared.ts`
  - Recommendation: defer unless more changes are planned there; this is a refactor opportunity, not a correctness bug.

- [ ] Decide whether to keep or remove the redundant resolver-queue null check.
  - Current area: `src/lib/executors/shared.ts`
  - Recommendation: optional cleanup only.
