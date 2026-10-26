# Official Harness adapter

`OperatorRuntime` starts the pinned official SDK in a scoped home with a scrubbed environment. `operatorProfile` disables general development tools, retries and diagnostic payloads, retaining native checkpoints, compaction and Skill registry. `plugin.mjs` registers only explicit business tools and the current approved Skill provider. `gateway` fixes the official endpoint, shared budget, timeout and conservative usage settlement.

Tests: `tests/harness.test.ts`, `harness-cancel.test.ts`, `gateway.test.ts`. Native integration uses a local fake SSE provider and is labelled offline. The live probe is opt-in and disabled locally once the cloud owns the budget.
