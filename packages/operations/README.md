# Operations

Pure rules and scoped persistence for activities, canonical report batches, forecast versions, daily inventory, shared allocations, shipments and advertising. `time` validates site-local offsets; `csv` parses bounded input and escapes exports. `context` builds bounded model projections with omission metadata. Shared types are exported by each capability module.

Tests: `tests/activity.test.ts`, `reports.test.ts`, `inventory.test.ts`, `shipping.test.ts`, `advertising.test.ts`, `context-bounds.test.ts`. No module calls Amazon, ERP, arbitrary code, or the model API. Reports are synthetic until business-data permission is established.
