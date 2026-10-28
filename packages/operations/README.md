# Operations

Pure rules and scoped persistence for activities, canonical report batches, forecast versions, daily inventory, shared allocations, shipments and advertising. `time` validates site-local offsets; `csv` parses bounded input and escapes exports. `context` builds bounded model projections with omission metadata. Shared types are exported by each capability module.

Tests: `tests/activity.test.ts`, `reports.test.ts`, `inventory.test.ts`, `shipping.test.ts`, `advertising.test.ts`, `context-bounds.test.ts`. No module calls Amazon, ERP, arbitrary code, or the model API. Reports are synthetic until business-data permission is established.

`TaskCopies.detail(scope, input)` reads four complete checklist steps per page with a 6000-byte response boundary. `TaskCopies.copy(scope, input, sourceId?)` creates an idempotent draft with literal replacement, revision checks, reset execution fields and origin deletion lineage. UI uses task-copy; the assistant uses cc_get_task/cc_copy_task with a bounded copy confirmation. Tests: `tests/task-copy.test.ts`, `tests/p43-harness.test.ts`.
