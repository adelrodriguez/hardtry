import { describe, expect, it } from "bun:test"
import * as try$ from "../index"

describe("dispose", () => {
  it("is exposed from the root namespace", () => {
    expect(typeof try$.dispose).toBe("function")
  })

  it("disposes registered cleanups in reverse order", async () => {
    const calls: string[] = []
    const disposer = try$.dispose()

    disposer.defer(() => {
      calls.push("defer:first")
    })

    disposer.use({
      async [Symbol.asyncDispose]() {
        await Promise.resolve()
        calls.push("use:resource")
      },
    })

    disposer.defer(() => {
      calls.push("defer:last")
    })

    await disposer[Symbol.asyncDispose]()

    expect(calls).toEqual(["defer:last", "use:resource", "defer:first"])
  })

  it("continues cleanup when one deferred cleanup throws", async () => {
    const calls: string[] = []
    const disposer = try$.dispose()

    disposer.defer(() => {
      calls.push("first")
    })

    disposer.defer(() => {
      calls.push("second")
      throw new Error("cleanup failed")
    })

    disposer.defer(() => {
      calls.push("third")
    })

    try {
      await disposer[Symbol.asyncDispose]()
      expect.unreachable("should have thrown")
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect((error as Error).message).toBe("cleanup failed")
    }

    expect(calls).toEqual(["third", "second", "first"])
  })
})
