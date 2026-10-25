# P0-LEARNING

Status: draft, not dispatchable. waveId=P0; roundId=R1; taskId=rootTaskId=P0-LEARNING.
Owner, exact baselineSha, start/deadline, total budget and remaining repair allowance: unresolved; populate before dispatch.
Spec version: 0.1.0 draft, to be replaced by the frozen R0 revision.

Requirements: CC-FEEDBACK-001, CC-MEMORY-001, CC-SKILL-001, CC-HISTORY-001.
Read specs/adaptive-learning.md, specs/contracts/domain.md, specs/architecture.md, specs/acceptance.md and docs/product/changes/README.md.
Dependencies: accepted R0 event/store/provider contracts and explicit skill-promotion policy.

Allowed after dispatch: packages/cc-learning/**, assigned adapter/store files and related tests; own handoff/evidence. Leader owns canonical contracts, shared migration sequence and dependencies. Do not edit development instructions, source through runtime learning, secrets, cloud state or the live business requirements automatically.

Implement durable capture/outbox and idempotent replay, feedback merge with provenance, structured memory and safe summaries, conflict/correction/scope handling, skill candidates/validation/promotion/revocation, pause/delete propagation and a deduplicated redacted requirement-review export. Generated skills remain outside the repository and cannot expand permissions.

Acceptance: P0-FEEDBACK/P0-MEMORY/P0-SKILL/P0-REQ-EXPORT/P0-PRIVACY and relevant P0-SCOPE/P0-RECOVERY cases. Preserve real TDD evidence for deterministic state/concurrency rules. Synthetic model fixtures are not proof of live extraction quality or native provider integration.

Proposed bounds: 45-minute focused attempt and two repairs per diagnosed cause, subject to startup allocation. Split into dependency-bounded rounds after contract freeze; do not use one huge undifferentiated patch. Delivery: commits, tests/exits, schema/migration notes, failures, export examples and recovery handoff.
