import { createAsyncDisposer, type AsyncDisposer } from "../shims/disposer"

export function dispose(): AsyncDisposer {
  return createAsyncDisposer()
}
