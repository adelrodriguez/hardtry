import type { InferredTaskContext, TaskContext, TaskRecord, TaskResult } from "./all"

declare const FLOW_EXIT_BRAND: unique symbol

export type FlowExit<T> = {
  readonly [FLOW_EXIT_BRAND]: T
}

type ExitValue<T> = T extends FlowExit<infer V> ? V : never

export type FlowExitValue<T extends TaskRecord> = {
  [K in keyof T]: ExitValue<TaskResult<T[K]>>
}[keyof T]

export interface FlowTaskContext<T extends TaskRecord> extends TaskContext<T> {
  $exit<V>(value: V): FlowExit<V>
}

export type InferredFlowTaskContext<T extends TaskRecord> = InferredTaskContext<T> & {
  $exit<V>(value: V): FlowExit<V>
}

export type FlowResult<T extends TaskRecord> = FlowExitValue<T>
