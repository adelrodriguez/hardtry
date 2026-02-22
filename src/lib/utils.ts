export function assertUnreachable(value: never): never {
  throw new Error(`Unreachable case: ${String(value)}`)
}
