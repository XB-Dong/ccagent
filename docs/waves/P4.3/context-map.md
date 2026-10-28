# P4.3 Context Map

2026-10-29｜Leader 已自审：写入所有权明确，无数据库迁移；原任务、工作日历和原时区排期语义保留。

## Files to Modify
| File | Purpose | Changes Needed |
| --- | --- | --- |
| packages/operations/task-copy.ts | Task reuse domain | Scoped paged read, validated draft copy, literal replacement, provenance and idempotence |
| apps/server/business.ts | Business dispatch | Read-only detail tool and copy action/tool |
| packages/cc-harness-adapter/plugin.mjs | Official tool adapter | Advertise get/copy tools with bounded results |
| apps/web/TasksPage.tsx | Task list | Copy preview entry; fixed Beijing dates/times and date filter |
| apps/web/TaskCopyForm.tsx | Copy preview | Original unchanged, preview and draft confirmation |
| apps/web/task-list-view.ts | List rules | Fixed timezone and selected empty date |
| apps/web/api.ts | Friendly errors | Chinese copy/conflict messages |
| apps/web/p43-tasks.css | Presentation | Small-screen copy/filter layout |
| docs/product, docs/waves/P4.3, specs/contracts, README.md | Traceability | Dated requirements, contracts, plans, manual and actual results |

## Dependencies
| File | Relationship |
| --- | --- |
| packages/core/store.ts | Scope, optimistic revision, receipts and transaction boundaries |
| packages/core/privacy.ts | Copied descendants must follow deletion/restore closure |
| packages/operations/tasks.ts | Existing task edit/confirm/completion validation |
| packages/learning/service.ts | Task shape and source provenance |
| apps/web/TaskForm.tsx, task-time.ts, task-groups.ts | Existing editors, time conversion, creation-date grouping |
| apps/server/app.ts | Existing authenticated action/tool transport |

## Test Files
| Test | Coverage |
| --- | --- |
| tests/task-copy.test.ts | Scope/CAS/literal replacement/reset/idempotence/deletion/paging |
| tests/p43-harness.test.ts | Official adapter tool dispatch without paid API |
| tests/task-list-view.test.ts | Beijing boundary/filter/unknown/empty date |
| tests/p41-api.test.ts, context-bounds.test.ts, harness.test.ts | Existing API, context and native harness regression |

## Reference Patterns
| File | Pattern |
| --- | --- |
| packages/operations/notes.ts | Scoped revisions and receipt-based mutation |
| apps/web/TaskForm.tsx | Frozen opening revision and stable retry request ID |
| tests/p41-api.test.ts | Isolated authenticated synthetic fixtures |

## Risk Assessment
- [x] Additive API/tools; bounded read output, never expose another workspace.
- [ ] Database migrations needed.
- [ ] Production configuration changes required.
- [x] Copy must reset completion/schedule and retain origin lineage; no automatic external writes.
- [x] Model contract changed: necessary real DeepSeek smoke required, in addition to offline and actual browser verification.
