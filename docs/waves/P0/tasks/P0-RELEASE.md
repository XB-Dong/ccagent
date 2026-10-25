# P0-RELEASE

Status: draft, not dispatchable. waveId=P0; roundId=R3; taskId=rootTaskId=P0-RELEASE.
Owner, exact baselineSha, start/deadline, total budget and remaining repair allowance: unresolved; populate before dispatch.
Spec version: 0.1.0 draft, to be replaced by the frozen R0 revision.

Requirements: all approved P0 requirements. Read P0-PLAN.md, specs/acceptance.md, specs/architecture.md, active decisions, reviewed handoffs and the exact release candidate's evidence.
Dependencies: required behavior/independent-review gates, verified CI, agreed target access/TLS/authentication, data policy and explicit deployment scope. This draft does not authorize server access now.

Allowed after dispatch: assigned deploy/**, runtime configuration templates, operations documentation and own release evidence. Leader owns final integration and deployment decisions. Use existing protected credentials only when necessary; never print or commit them. Verify the recorded SSH host fingerprint before connecting and preserve the existing OS.

Build pinned artifacts in a suitable environment, record source/upstream/lock/artifact hashes, back up all owned data, deploy within scope, verify HTTPS/auth/WS and the actual cc workflow, observe resources and model usage, test isolated data restore separately from code rollback. Do not re-clean or reinstall the server.

Acceptance: P0-RELEASE/P0-RECOVERY and all mandatory P0 rows at the exact deployed version. Any missing required row makes delivery partial. Preserve failures and restoration status; never claim external side effects are reversed merely by Git rollback.

Proposed bounds: a bounded release window specified at startup; at most two repairs per diagnosed cause unless reallocated with an explicit record. Delivery: Chinese timestamped report, precise versions/environment, verification, actual changes, known gaps, recovery/runbook and next-wave readiness. After reporting, the Leader generates the actual P1-PLAN.md and P0-style supporting artifacts, reviews/freezes them, records readiness and autonomously continues within the standing human authorization. Do not wait for human phase approval or skip preparation, unmet dependencies, budget limits or external permissions. Preserve cumulative root-task repairs; the complete project and final report are accepted by the human after the agreed scope is finished.
