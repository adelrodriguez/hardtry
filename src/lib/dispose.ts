import { Panic } from "./errors"

export function createDisposer(): never {
  throw new Panic({ message: "dispose is not implemented yet" })
}
