# P4.3 Task packets

Baseline: `49590bec0e24bd689d107aeb289c0492e51aff84`. Frozen spec: [p43-v1](../../../specs/contracts/p43-v1.md). Leader supplies exact frozen-document commit in dispatch; implement from that commit. No production credentials, paid calls, deploys or real feedback in child tasks. Synthetic fixtures only. Concurrent writers use independent worktrees. Stop and report conflicts beyond ownership. Per-root repair limit: two targeted attempts before re-diagnosis, preserve cumulative counts; no time/consumption allowance truncates necessary testing.

| Root / owner | Allowed paths | Dependencies / deliverable |
| --- | --- | --- |
| P43-SERVICE / backend developer | packages/operations/task-copy.ts; apps/server/business.ts; packages/cc-harness-adapter/plugin.mjs; tests/task-copy.test.ts; tests/p43-harness.test.ts | Existing Store/Tasks/privacy and frozen API. Implement scoped read + copy, receipt fingerprints and deletion lineage. Real behavioral Red/Green logs outside Git, exact commit and verification commands/results. No UI/shared docs writes. |
| P43-UI / interface developer | apps/web/TasksPage.tsx; apps/web/TaskCopyForm.tsx; apps/web/task-list-view.ts; apps/web/p43-tasks.css; apps/web/api.ts; tests/task-list-view.test.ts | Existing TaskForm/time/grouping and frozen API. Copy preview with stable retry identity; fixed Beijing list/date empty view without changing calendar/editor semantics. Real Red/Green, exact commit, commands/results; no backend/shared writes. |
| P43-REVIEW / independent reviewer | Read-only source, tests, plans and contracts | Start specification/risk review during development; review exact integrated candidate later. Report locations, trigger, expected/actual, severity, evidence and unverified gates. No mutations/live API. |
| P43-INTEGRATION / Leader | Shared requirements/spec/wave/docs/reports; integration repairs coordinated by ownership | Integrate commits, decide findings, verify full suite/browser/model/CI, backup/restore/publish/rollback, usage and truthful report. |

Acceptance: [matrix](acceptance.md). Do not describe static render or stub as actual browser/live model. Keep unknown usage unknown. Private evidence location supplied in dispatch only, never commit it or raw feedback. Use no-reply identity and current sanitized history only.
