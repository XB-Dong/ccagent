# Core

`Store` owns scoped SQLite entities, short transactions, CAS and idempotent receipts. `ModelBudget` reserves each request durably before transport. `privacy` replays deletion/revocation intent before restored data opens; `recovery` creates hashed coordinated snapshots and merges the current budget on isolated restore. `validation` is shared input validation.

Tests: `tests/budget.test.ts`, `privacy-closure.test.ts`, `recovery.test.ts`. Runtime data and ledgers stay outside Git. Only a single business service writes the database; production restore requires service downtime.
