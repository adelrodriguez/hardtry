export type MaybePromise<T> = T | Promise<T>

export type ErrorCode =
  | "EXEC_CANCELLED"
  | "EXEC_TIMEOUT"
  | "EXEC_RETRY_EXHAUSTED"
  | "EXEC_UNHANDLED_EXCEPTION"
  | "EXEC_PANIC"

export interface RetryInfo {
  attempt: number
  limit: number
}

export interface TryCtx {
  signal?: AbortSignal
  retry: RetryInfo
}

export type RunTryFn<T> = (ctx: TryCtx) => T
export type RunCatchFn<E> = (error: unknown) => E

export interface RunWithCatchOptions<T, E> {
  try: RunTryFn<T>
  catch: RunCatchFn<E>
}

export type RunInput<T, E> = RunTryFn<T> | RunWithCatchOptions<T, E>

export interface BaseRetryPolicy {
  /**
   * Maximum number of attempts, including the first run.
   */
  limit: number
  /**
   * Delay in milliseconds between attempts. Defaults to 0.
   */
  delayMs?: number
  /**
   * Adds random jitter to delays when enabled.
   */
  jitter?: boolean
  /**
   * Return true to retry after an error, false to stop.
   */
  shouldRetry?: (error: unknown, ctx: TryCtx) => boolean
}

export interface LinearBackoffRetryPolicy extends BaseRetryPolicy {
  /**
   * Use linearly increasing delay between attempts.
   */
  backoff: "linear"
  /**
   * Not supported for linear backoff.
   */
  maxDelayMs?: never
}

export interface ExponentialBackoffRetryPolicy extends BaseRetryPolicy {
  /**
   * Use exponential delay growth between attempts.
   */
  backoff: "exponential"
  /**
   * Optional cap for exponential delay in milliseconds.
   */
  maxDelayMs?: number
}

/**
 * Retry policy using a constant delay strategy.
 */
export interface ConstantBackoffRetryPolicy extends BaseRetryPolicy {
  /**
   * Required discriminant: use a fixed delay between attempts.
   */
  backoff: "constant"
  /**
   * Not supported for constant backoff.
   */
  maxDelayMs?: never
}

/**
 * Retry configuration object.
 */
export type RetryPolicy =
  | LinearBackoffRetryPolicy
  | ExponentialBackoffRetryPolicy
  | ConstantBackoffRetryPolicy

/**
 * Retry shorthand or full retry configuration.
 *
 * - `number`: attempt limit
 * - `RetryPolicy`: detailed retry settings
 */
export type RetryOptions = number | RetryPolicy

export interface TimeoutPolicy {
  /**
   * Timeout in milliseconds.
   */
  ms: number
  /**
   * Timeout scope. Currently only total execution is supported.
   */
  scope: "total"
}

/**
 * Timeout shorthand or full timeout configuration.
 *
 * - `number`: timeout in milliseconds
 * - `TimeoutPolicy`: detailed timeout settings
 */
export type TimeoutOptions = number | TimeoutPolicy

export type WrapFn = (ctx: TryCtx, next: RunTryFn<unknown>) => unknown

export interface BuilderConfig {
  /**
   * Retry configuration applied to the run.
   */
  retry?: RetryPolicy
  /**
   * Timeout configuration applied to the run.
   */
  timeout?: TimeoutPolicy
  /**
   * Abort signal used to cancel execution.
   */
  signal?: AbortSignal
  /**
   * Wrapper middleware chain around execution.
   */
  wraps?: WrapFn[]
}

export type TaskMap = Record<string, (this: unknown) => unknown>
