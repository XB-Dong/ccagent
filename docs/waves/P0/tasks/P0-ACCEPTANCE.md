# P0-ACCEPTANCE

Status: executing under Leader ownership. waveId=P0; taskId=rootTaskId=P0-ACCEPTANCE.
Owner: Leader. Exact baselineSha: ebed58c062604249051ef48b1f122a0c34298e22.
Spec: runtime-v0.2 frozen; P0 architecture/adaptive/acceptance targets retain all mandatory gates.
Start: 2026-10-26T02:06:11+08:00. No human deadline; reassess focused work every 45 minutes.
Shared live budget: 6 calls / 24000 input / 4096 output / 28096 total tokens; already used 2 calls / 2206 input / 36 output. Zero retries.
Repair limit: two directed attempts per diagnosed root cause, with cumulative counts in state.
Leader-assigned current paths: tests/**; scripts/**; own audit/evidence summaries. Prior proposed paths below are superseded where different.
R0 interfaces have runtime evidence; prototype implementation exists, this packet now governs hardening and final acceptance. Independent review findings must be fixed and reverified before release.

Requirements: CC-ENTRY-001, CC-HARNESS-001, CC-ACT-001 subset, CC-FEEDBACK-001, CC-MEMORY-001, CC-SKILL-001, CC-HISTORY-001.
Read all active specifications, requirement changes and specs/acceptance.md. Design independently from implementation details and start scenario design during R0; execute against exact candidate commits as capabilities become available.

API quota: follow docs/testing/deepseek-budget.md. Run ordinary regression/CI offline with synthetic fixtures or sanitized replay. Reuse valid Foundation evidence; independently verify its scope and artifacts without automatically repeating paid calls. Use only a minimal separately identified live acceptance sample for gaps or affected changes within the same wave budget. Test budget enforcement, retries and missing usage through a counting fake transport. Never mark replay as live model verification.

Allowed after dispatch: assigned tests/** and own evidence, findings and handoff files. Product sources/specs are read-only. Do not repair product code while claiming independent validation. Report reproducible findings for the Leader to assign.

Cover real Harness/provider integration, browser greeting-to-task/feedback/skill flow, malformed inputs, context compaction/correction, cross-scope denial, interruption/retry, pause/deletion/revocation, requirement-export deduplication and isolated restore. Distinguish unit, synthetic integration, real model, browser and cloud outcomes.

Acceptance: every P0 matrix row has passed evidence or an explicit failed/not_run state; P0-REVIEW requires an independent actor and actual browser actions. Do not replace independent review with author self-check or model agreement. Never send private business data/credentials to review services.

Proposed bounds: bounded 45-minute pass per assigned scope, at most two test-harness repairs per diagnosed cause, subject to startup allocation. Delivery: acceptance matrix, exact SHAs/environment, raw evidence index/hashes, actionable findings and report draft. Leader determines dispositions and final status.
