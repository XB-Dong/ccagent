# P0-WORKBENCH

Status: executing under Leader ownership. waveId=P0; taskId=rootTaskId=P0-WORKBENCH.
Owner: Leader. Exact baselineSha: ebed58c062604249051ef48b1f122a0c34298e22.
Spec: runtime-v0.2 frozen; P0 architecture/adaptive/acceptance targets retain all mandatory gates.
Start: 2026-10-26T02:06:11+08:00. No human deadline; reassess focused work every 45 minutes.
Shared live budget: 6 calls / 24000 input / 4096 output / 28096 total tokens; already used 2 calls / 2206 input / 36 output. Zero retries.
Repair limit: two directed attempts per diagnosed root cause, with cumulative counts in state.
Leader-assigned current paths: apps/web/**; apps/server/**; directly related tests. Prior proposed paths below are superseded where different.
R0 interfaces have runtime evidence; prototype implementation exists, this packet now governs hardening and final acceptance. Independent review findings must be fixed and reverified before release.

Requirements: CC-ENTRY-001, CC-ACT-001 internal-task subset, CC-FEEDBACK-001.
Read docs/product/REQUIREMENTS.zh.md, specs/architecture.md, specs/contracts/domain.md and specs/acceptance.md.
Dependencies: accepted P0-FOUNDATION UI/tool contracts and agreed service interfaces.

Allowed after dispatch: packages/cc-workbench/**, assigned packages/cc-operations/** and directly related tests; own handoff/evidence. Shared contracts, upstream source, dependency manifests and deployment configuration require explicit single-writer assignment.

Implement the first local greeting to cc, truthful capability statuses and examples, accessible task/feedback views, explicit persistence/error states and a minimal internal activity-preparation task. No actual Amazon scheduling, reminders or price changes. Coordinate task/feedback ownership with P0-LEARNING before editing any shared service.

Acceptance: P0-WELCOME/P0-TASK plus the UI part of P0-FEEDBACK. Test offline model behavior, refresh/reopen, missing timezone, duplicate retries and failed saves. Use meaningful interaction tests and actual browser acceptance; screenshots alone do not prove persistence.

Proposed bounds: 45-minute focused attempt and two repairs per diagnosed cause, subject to startup allocation. Delivery: changed paths/commits, actual tests and exits, browser observations, known gaps and handoff. Do not claim planned capabilities are available.
