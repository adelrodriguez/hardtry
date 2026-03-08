---
"tryharder": patch
---

Replace the native `DisposableStack` and `AsyncDisposableStack` runtime dependency with internal private shims.

`tryharder` now provides its own cleanup runtime through `dispose()` and task-local `$disposer`, so consumers no longer need native disposable-stack globals or an external polyfill to use the library in unsupported runtimes.

The public cleanup helper type is now `AsyncDisposer` instead of ambient `AsyncDisposableStack`.
