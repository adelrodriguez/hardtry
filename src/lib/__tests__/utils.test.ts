import { describe, expect, it } from "bun:test"
import { Panic } from "../errors"
import { assertUnreachable, checkIsPromiseLike, invariant } from "../utils"

describe("checkIsPromiseLike", () => {
  it("returns true for native Promise", () => {
    expect(checkIsPromiseLike(Promise.resolve("ok"))).toBe(true)
  })

  it("returns true for thenable objects", () => {
    const thenable: Record<string, unknown> = {}
    Reflect.set(thenable, "then", (_resolve: (value: string) => void) => null)

    expect(checkIsPromiseLike(thenable)).toBe(true)
  })

  it("returns false for non-thenable values", () => {
    expect(checkIsPromiseLike(null)).toBe(false)
    expect(checkIsPromiseLike(123)).toBe(false)
    expect(checkIsPromiseLike({})).toBe(false)
  })
})

describe("invariant", () => {
  it("does nothing when the condition is truthy", () => {
    expect(() => {
      invariant(true, new Error("boom"))
    }).not.toThrow()
  })

  it("throws the provided error when the condition is falsy", () => {
    const error = new Panic("RUN_SYNC_TRY_PROMISE")

    expect(() => {
      invariant(false, error)
    }).toThrow(error)
  })
})

describe("assertUnreachable", () => {
  it("throws with the unreachable value", () => {
    let error: unknown

    try {
      assertUnreachable("unexpected" as never, "UNREACHABLE_RETRY_POLICY_BACKOFF")
    } catch (caughtError) {
      error = caughtError
    }

    expect(error).toBeInstanceOf(Panic)
    expect((error as Panic).code).toBe("UNREACHABLE_RETRY_POLICY_BACKOFF")
    expect((error as Error).message).toBe("Unreachable case: unexpected")
  })
})
