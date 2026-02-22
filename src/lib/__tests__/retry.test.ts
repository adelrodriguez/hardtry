import { describe, expect, it } from "bun:test"
import { normalizeRetryPolicy } from "../retry"

const shouldRetry = () => true

describe("normalizeRetryPolicy", () => {
  it("normalizes number shorthand to constant backoff", () => {
    expect(normalizeRetryPolicy(3)).toEqual({
      backoff: "constant",
      delayMs: 0,
      limit: 3,
    })
  })

  it("normalizes linear policy with default delay", () => {
    expect(normalizeRetryPolicy({ backoff: "linear", limit: 2 })).toEqual({
      backoff: "linear",
      delayMs: 0,
      jitter: undefined,
      limit: 2,
      shouldRetry: undefined,
    })
  })

  it("normalizes exponential policy and preserves maxDelayMs", () => {
    expect(
      normalizeRetryPolicy({
        backoff: "exponential",
        limit: 4,
        maxDelayMs: 1000,
      })
    ).toEqual({
      backoff: "exponential",
      delayMs: 0,
      jitter: undefined,
      limit: 4,
      maxDelayMs: 1000,
      shouldRetry: undefined,
    })
  })

  it("preserves optional retry controls", () => {
    expect(
      normalizeRetryPolicy({
        backoff: "constant",
        delayMs: 25,
        jitter: true,
        limit: 5,
        shouldRetry,
      })
    ).toEqual({
      backoff: "constant",
      delayMs: 25,
      jitter: true,
      limit: 5,
      shouldRetry,
    })
  })
})
