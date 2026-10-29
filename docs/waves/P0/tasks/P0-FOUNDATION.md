# P0-FOUNDATION

Status: executing. waveId=P0; roundId=R0; taskId=rootTaskId=P0-FOUNDATION.
Owner: Leader. baselineSha: 3a198f0b6e07bc31021df9d73d3cfe30e3f1c469.
Start: 2026-10-26T01:23:56+08:00. No human deadline. Focused diagnosis window: 45 minutes; preserve state and reassess rather than reset a failed root.
Repair allowance: two directed repairs per diagnosed cause, cumulative across waves. Shared live budget: 6 calls, 24000 input tokens, 4096 output tokens, 28096 total; 45-second timeout; zero retries.
Spec version: 0.2.0 R0 contract frozen by Leader for budget and controlled SDK integration; ADR 0004 defines the selected seam. Other business behavior remains gated by its packet and reviewed contract.

Requirements: CC-HARNESS-001, CC-ENTRY-001, CC-MEMORY-001, CC-SKILL-001.
Read docs/waves/P0/PLAN.md, specs/architecture.md, specs/adaptive-learning.md, specs/contracts/domain.md, specs/acceptance.md and docs/references/upstream-baseline.json.

API quota: follow docs/testing/deepseek-budget.md. Implement the shared preflight call/token guard before live probes; test it with a counting fake transport. Enable only a minimal live text/tool sample within the configured wave budget, record usage and sanitized replay, and hand evidence to Acceptance instead of repeating the same probe. Fault-inject timeout/429/cancellation offline. Budget exhaustion blocks further paid calls, not independent offline work.

Allowed after dispatch: assigned disposable prototype outside the repository; packages/cc-harness-adapter/**; explicitly assigned config files; own evidence/handoff. Leader alone updates canonical specs and shared lockfiles after review. Do not create an alternative agent loop, silently fork the entire upstream, access real business data or deploy.

Validate the pinned official runtime, exact artifact/version/license, a greeting/UI extension, minimal tool composition without ambient shell/source/credential access, real bounded DeepSeek text/tool calls, event replay, native compaction, scoped Skill provider and a transactional store. Report unsupported extension seams and measured resource requirements before downstream work depends on them.

Acceptance: P0-HARNESS plus R0 feasibility evidence for P0-WELCOME/P0-MEMORY/P0-SKILL/P0-SCOPE. Include failures, source SHA, actual environment and model verification status. A source read is not runtime evidence.

Proposed bounds, pending startup allocation: 45-minute focused attempt; at most two repairs per diagnosed cause; preserve cumulative counts. Stop/reassess when the same unchanged cause repeats. Delivery: commits, commands/exit codes, artifacts/hashes, validated interfaces, limitations and next-task handoff.
