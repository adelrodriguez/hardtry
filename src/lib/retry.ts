import type { RetryOptions, RetryPolicy } from "./types"
import { assertUnreachable } from "./utils"

export function normalizeRetryPolicy(policy: RetryOptions): RetryPolicy {
  if (typeof policy === "number") {
    return {
      backoff: "constant",
      delayMs: 0,
      limit: policy,
    }
  }

  switch (policy.backoff) {
    case "constant":
      return {
        backoff: "constant",
        delayMs: policy.delayMs ?? 0,
        jitter: policy.jitter,
        limit: policy.limit,
        shouldRetry: policy.shouldRetry,
      }
    case "linear":
      return {
        backoff: "linear",
        delayMs: policy.delayMs ?? 0,
        jitter: policy.jitter,
        limit: policy.limit,
        shouldRetry: policy.shouldRetry,
      }
    case "exponential":
      return {
        backoff: "exponential",
        delayMs: policy.delayMs ?? 0,
        jitter: policy.jitter,
        limit: policy.limit,
        maxDelayMs: policy.maxDelayMs,
        shouldRetry: policy.shouldRetry,
      }
    default:
      return assertUnreachable(policy)
  }
}

export function retryOptions(policy: RetryOptions): RetryPolicy {
  return normalizeRetryPolicy(policy)
}
