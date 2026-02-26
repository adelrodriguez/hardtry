import { Panic } from "./errors"

export function executeGen(): never {
  throw new Panic({ message: "gen is not implemented yet" })
}
