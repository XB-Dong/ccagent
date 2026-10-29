# P0-RELEASE

Status: executing under Leader ownership. waveId=P0; taskId=rootTaskId=P0-RELEASE.
Owner: Leader. Exact baselineSha: ebed58c062604249051ef48b1f122a0c34298e22.
Spec: runtime-v0.2 frozen; P0 architecture/adaptive/acceptance targets retain all mandatory gates.
Start: 2026-10-26T02:06:11+08:00. No human deadline; reassess focused work every 45 minutes.
Shared live budget: 6 calls / 24000 input / 4096 output / 28096 total tokens; already used 2 calls / 2206 input / 36 output. Zero retries.
Repair limit: two directed attempts per diagnosed root cause, with cumulative counts in state.
Leader-assigned current paths: deploy/**; operations documentation; release evidence; shared configuration as Leader. Prior proposed paths below are superseded where different.
R0 interfaces have runtime evidence; prototype implementation exists, this packet now governs hardening and final acceptance. Independent review findings must be fixed and reverified before release.

Requirements: all approved P0 requirements. Read docs/waves/P0/PLAN.md, specs/acceptance.md, specs/architecture.md, active decisions, reviewed handoffs and the exact release candidate's evidence.
Dependencies: required behavior/independent-review gates, verified CI, agreed target access/TLS/authentication, data policy and explicit deployment scope. The human startup authorizes the recorded target deployment; verify the pinned SSH identity before access and preserve the OS.

Allowed after dispatch: assigned deploy/**, runtime configuration templates, operations documentation and own release evidence. Leader owns final integration and deployment decisions. Use existing protected credentials only when necessary; never print or commit them. Verify the recorded SSH host fingerprint before connecting and preserve the existing OS.

Build pinned artifacts in a suitable environment, record source/upstream/lock/artifact hashes, back up all owned data, deploy within scope, verify HTTPS/auth/SSE and native stdio transport and the actual cc workflow, observe resources and model usage, test isolated data restore separately from code rollback. Do not re-clean or reinstall the server.

Acceptance: P0-RELEASE/P0-RECOVERY and all mandatory P0 rows at the exact deployed version. Any missing required row makes delivery partial. Preserve failures and restoration status; never claim external side effects are reversed merely by Git rollback.

Proposed bounds: a bounded release window specified at startup; at most two repairs per diagnosed cause unless reallocated with an explicit record. Delivery: Chinese timestamped report, precise versions/environment, verification, actual changes, known gaps, recovery/runbook and next-wave readiness. After reporting, the Leader generates the actual docs/waves/P1/PLAN.md and P0-style supporting artifacts, reviews/freezes them, records readiness and autonomously continues within the standing human authorization. Do not wait for human phase approval or skip preparation, unmet dependencies, budget limits or external permissions. Preserve cumulative root-task repairs; the complete project and final report are accepted by the human after the agreed scope is finished.
