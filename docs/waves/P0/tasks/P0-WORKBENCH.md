# P0-WORKBENCH

Status: draft, not dispatchable. waveId=P0; roundId=R1; taskId=rootTaskId=P0-WORKBENCH.
Owner, exact baselineSha, start/deadline, total budget and remaining repair allowance: unresolved; populate before dispatch.
Spec version: 0.1.0 draft, to be replaced by the frozen R0 revision.

Requirements: CC-ENTRY-001, CC-ACT-001 internal-task subset, CC-FEEDBACK-001.
Read docs/product/REQUIREMENTS.zh.md, specs/architecture.md, specs/contracts/domain.md and specs/acceptance.md.
Dependencies: accepted P0-FOUNDATION UI/tool contracts and agreed service interfaces.

Allowed after dispatch: packages/cc-workbench/**, assigned packages/cc-operations/** and directly related tests; own handoff/evidence. Shared contracts, upstream source, dependency manifests and deployment configuration require explicit single-writer assignment.

Implement the first local greeting to cc, truthful capability statuses and examples, accessible task/feedback views, explicit persistence/error states and a minimal internal activity-preparation task. No actual Amazon scheduling, reminders or price changes. Coordinate task/feedback ownership with P0-LEARNING before editing any shared service.

Acceptance: P0-WELCOME/P0-TASK plus the UI part of P0-FEEDBACK. Test offline model behavior, refresh/reopen, missing timezone, duplicate retries and failed saves. Use meaningful interaction tests and actual browser acceptance; screenshots alone do not prove persistence.

Proposed bounds: 45-minute focused attempt and two repairs per diagnosed cause, subject to startup allocation. Delivery: changed paths/commits, actual tests and exits, browser observations, known gaps and handoff. Do not claim planned capabilities are available.
