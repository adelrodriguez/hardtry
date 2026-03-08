import { describe, expect, it } from "bun:test"
import * as try$ from "../index"

describe("dispose", () => {
  it("is exposed from the root namespace", () => {
    expect(typeof try$.dispose).toBe("function")
  })

  it("returns a disposer with defer, use, and disposeAsync", () => {
    const disposer = try$.dispose()

    expect(typeof disposer.defer).toBe("function")
    expect(typeof disposer.use).toBe("function")
    expect(typeof disposer.disposeAsync).toBe("function")
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

    await disposer.disposeAsync()

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
      await disposer.disposeAsync()
      expect.unreachable("should have thrown")
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect((error as Error).message).toBe("cleanup failed")
    }

    expect(calls).toEqual(["third", "second", "first"])
  })

  it("supports sync disposable resources", async () => {
    const calls: string[] = []
    const disposer = try$.dispose()

    disposer.use({
      [Symbol.dispose]() {
        calls.push("sync")
      },
    })

    await disposer.disposeAsync()

    expect(calls).toEqual(["sync"])
  })

  it("supports mixed sync and async cleanup resources", async () => {
    const calls: string[] = []
    const disposer = try$.dispose()

    disposer.use({
      [Symbol.dispose]() {
        calls.push("sync")
      },
    })

    disposer.use({
      async [Symbol.asyncDispose]() {
        await Promise.resolve()
        calls.push("async")
      },
    })

    await disposer.disposeAsync()

    expect(calls).toEqual(["async", "sync"])
  })

  it("treats null and undefined resources as no-ops", async () => {
    const disposer = try$.dispose()
    const missing = undefined

    expect(disposer.use(null)).toBeNull()
    disposer.use(missing)

    await disposer.disposeAsync()
  })

  it("throws TypeError when use() receives a non-disposable object", () => {
    const disposer = try$.dispose()

    expect(() => {
      disposer.use({ value: 1 } as never)
    }).toThrow("Object not disposable")
  })

  it("produces a suppressed error chain when multiple cleanups fail", async () => {
    const disposer = try$.dispose()

    disposer.defer(() => {
      throw new Error("first")
    })

    disposer.defer(() => {
      throw new Error("second")
    })

    try {
      await disposer.disposeAsync()
      expect.unreachable("should have thrown")
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect((error as Error).name).toBe("SuppressedError")
      expect((error as Error & { error: unknown }).error).toBeInstanceOf(Error)
      expect((error as Error & { error: Error }).error.message).toBe("first")
      expect((error as Error & { suppressed: unknown }).suppressed).toBeInstanceOf(Error)
      expect((error as Error & { suppressed: Error }).suppressed.message).toBe("second")
    }
  })
})
