# P0-ACCEPTANCE

Status: draft, not dispatchable. waveId=P0; roundId=R0-R2; taskId=rootTaskId=P0-ACCEPTANCE.
Owner, exact baselineSha, start/deadline, total budget and remaining repair allowance: unresolved; populate before dispatch.
Spec version: 0.1.0 draft, to be replaced by the frozen R0 revision.

Requirements: CC-ENTRY-001, CC-HARNESS-001, CC-ACT-001 subset, CC-FEEDBACK-001, CC-MEMORY-001, CC-SKILL-001, CC-HISTORY-001.
Read all active specifications, requirement changes and specs/acceptance.md. Design independently from implementation details and start scenario design during R0; execute against exact candidate commits as capabilities become available.

API quota: follow docs/testing/deepseek-budget.md. Run ordinary regression/CI offline with synthetic fixtures or sanitized replay. Reuse valid Foundation evidence; independently verify its scope and artifacts without automatically repeating paid calls. Use only a minimal separately identified live acceptance sample for gaps or affected changes within the same wave budget. Test budget enforcement, retries and missing usage through a counting fake transport. Never mark replay as live model verification.

Allowed after dispatch: assigned tests/** and own evidence, findings and handoff files. Product sources/specs are read-only. Do not repair product code while claiming independent validation. Report reproducible findings for the Leader to assign.

Cover real Harness/provider integration, browser greeting-to-task/feedback/skill flow, malformed inputs, context compaction/correction, cross-scope denial, interruption/retry, pause/deletion/revocation, requirement-export deduplication and isolated restore. Distinguish unit, synthetic integration, real model, browser and cloud outcomes.

Acceptance: every P0 matrix row has passed evidence or an explicit failed/not_run state; P0-REVIEW requires an independent actor and actual browser actions. Do not replace independent review with author self-check or model agreement. Never send private business data/credentials to review services.

Proposed bounds: bounded 45-minute pass per assigned scope, at most two test-harness repairs per diagnosed cause, subject to startup allocation. Delivery: acceptance matrix, exact SHAs/environment, raw evidence index/hashes, actionable findings and report draft. Leader determines dispositions and final status.
