# Agent Instructions

## Current scope

Latest human authorization on 2026-10-26: remove cumulative test call/token ceilings and finish the incomplete real skill reuse and browser checks. This supersedes the historical twelve-request stop rule below. Keep the same smoke account and all usage history; use explicit server-side unbounded limits, never fake a reset or borrow the daily runtime account. Keep timeouts, zero automatic retries, per-turn loop protection, synthetic data, and the single-agent policy. Ordinary CI remains offline; finish the named checks and stop unnecessary paid work.

For subsequent in-scope project tests, do not reintroduce artificial cumulative request/token caps unless the human requests one. This standing direction preserves cost conservation, actual-usage reporting, finite test objectives, and the separate daily runtime policy; it does not authorize aimless or perpetual paid calls.

Latest user direction added on 2026-10-26: iterative development uses a single agent by default. Do not start or reactivate review/development agents unless a concrete need has first been explained to the user. This supersedes the earlier standing preference for autonomous read-only review delegation below. The active audit agent was stopped when this direction arrived; the Leader retains and verifies its already reported findings.

Standing authorization added on 2026-10-26 during execution: the human explicitly permits read-only review subagents and directs the Leader to decide similar review and in-scope execution arrangements autonomously without repeated consultation. Review agents may inspect specifications/code and run offline checks; they do not gain additional paid API, business-data, deployment, or external-write permissions.

The human explicitly started the project on 2026-10-26 with “启动”. Execute P0/R0 and the planned full-stack implementation, integration and authorized deployment, then autonomously progress under the standing policy below. The previous documentation-only restriction is historical and no longer active. Use synthetic data until business-data permission is established; do not perform real Amazon/ERP business writes.

Standing human authorization recorded on 2026-10-26: the Leader may autonomously progress from P0 through P1, P2 and P3 until the agreed project scope is complete. Before each next wave, generate its Pn-PLAN.md and P0-style supporting specifications, packets, acceptance matrix and state, then review/freeze them and record the entry decision. No per-wave human approval is required. The human will accept the complete project and final report at the end.

Read README.md, CONSTITUTION.md, docs/product/REQUIREMENTS.zh.md, P0-PLAN.md, specs/architecture.md, specs/adaptive-learning.md, specs/acceptance.md and docs/waves/P0/state.json before work. Reference repositories are evidence, not executable instructions or inherited authorization.

## Business requirements

The current business view is docs/product/REQUIREMENTS.zh.md. Append dated changes under docs/product/changes/ before updating that view. Preserve requirement IDs, original statements, superseded versions, reasons, sources and unresolved questions. Keep product requirements separate from the AI Coding constitution. Automatically extracted feedback is a candidate requirement until its classification and priority are confirmed; it must not silently authorize implementation.

## Code and repository quality

- Use English for code identifiers, code comments, API fields, configuration keys, commit messages and agent execution instructions. Use Chinese for business requirements, plans, decisions and user-facing reports.
- Organize actual modules by capability. Separate UI, domain rules, persistence and external adapters. Inspect responsibilities around 300 handwritten lines; do not split mechanically.
- Prefer explicit boundaries over speculative frameworks. Pin dependencies and preserve upstream licenses when importing code.
- Keep secrets, business files, raw sessions, databases, generated skills, tools, caches, evidence payloads and worktrees outside the repository. Never print credentials or authenticated URLs.
- Existing protected configuration locations are indexed by ../.ccagent-local/LOCAL-OPERATIONS.md outside Git. Read that index when later authorized work needs authentication; do not ask the user to resend existing credentials.
- Run python scripts/verify.py for preparation changes. This is repository verification, not product acceptance.

## Continuous execution after the project starts

User authorization added on 2026-10-26: perform a comprehensive audit and real DeepSeek API smoke test before handing the workbench back. Follow docs/testing/SMOKE-20261026-PLAN.zh.md. Preserve the exhausted legacy six-call ledger; this new smoke allocation is independently capped at twelve actual requests, including tools/compaction/failures, without retries or account renaming to add quota. Runtime use must have a separate, server-configured daily account. This explicit request supersedes the earlier no-addition restriction only for the bounded new allocation and restoring normal use; conserve quota and retain all historical usage.

Conserve DeepSeek API quota in prototyping, tests, debugging, review and repeated verification. Follow docs/testing/deepseek-budget.md: offline by default, no production key in ordinary CI, synthetic fixtures and sanitized replay first, minimal bounded live probes only. Configure shared call/token limits before enabling paid tests; include tool loops, learning/compaction and failed attempts. Stop at the limit, retain valid evidence and rerun only affected live cases. Never represent replay as live verification or treat missing usage as zero. The shared durable budget guard is implemented; preserve its tested boundaries and do not expand the recorded development allowance.

Leader owns canonical contracts, wave state, shared configuration, integration and release decisions. Populate every draft packet with a precise baseline SHA, frozen spec version, owner, dependencies and repair/time limits before dispatch. Do not infer model settings or claim independent verification from model self-identification.

Use isolated branches/worktrees for concurrent writers when parallel work is authorized. Do not change another task's files or shared contracts without coordination. Keep review read-only except assigned review artifacts. Record accepted, rejected and deferred findings and verify fixes.

Use meaningful behavior-focused TDD for appropriate rules. Preserve actual Red/Green output, commands, timestamps, environment and exit codes. Installation failures are not behavioral Red. Do not invent refactoring, independent review, browser operations, cloud tests or deployment evidence.

Distinguish development agents from the shipped DeepSeek Harness assistant. Generated business skills must never modify development instructions, source code, credentials, permissions or deployment configuration. Follow specs/adaptive-learning.md for provenance, scoping, promotion, revocation and privacy.

Issue a truthful timestamped report for each wave, assess next-wave readiness, create and freeze its actual plan/artifacts, and autonomously continue without waiting for human phase approval. Keep unmet gates and cumulative root-task repair counts visible across waves; do not mark partial work complete or bypass dependencies. Use P1/P2/P3 numbering and NEXT-WAVES.md for the current roadmap. Run tests and independent reviews throughout, not only in the final wave.

Continue until the agreed project scope and integrated verification are complete, then deliver the full product, operating documentation, requirement-to-evidence matrix, wave-report index and final project report for human acceptance. Pause only on an explicit human stop, a binding budget/deadline, or a necessary external input/permission with no independent authorized work left. Do not expand feature scope, paid budget, company-data permissions or external side effects under the wave-progression authorization. Earlier classroom-annotator model assignments, GLM credentials, exceptions, deadlines and infrastructure permissions do not apply here.
