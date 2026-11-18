# Unsupported async formatter returns

A rejecting async formatter previously produced failure rows but left its Promise unobserved. In an actual exported-runner subprocess, Node then emitted the adapter exception and local paths to stderr. The synchronous checker now observes rejected non-string returns while continuing to mark them unsupported. It never awaits or scores their results.

Regression tests execute exported runners with immediately rejecting async functions, delayed rejected Promises, and rejected thenables. They require failed rows, exit 1, and no runner-generated exception output. This is not cancellation, a process timeout, or isolation: trusted adapter code can still log, perform effects, block, or create unrelated unhandled failures.
