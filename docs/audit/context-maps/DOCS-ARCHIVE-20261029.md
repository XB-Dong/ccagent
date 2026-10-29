# Context Map · Merge P4.3 and archive root plans

2026-10-29. Self-reviewed by Leader before any repository edits. Source head5394d1a11dcc8b9cddd933e5c34fb4da095f6005, remote main49590bec0e24bd689d107aeb289c0492e51aff84. User explicitly authorizes merge and root Markdown organization. No new product wave or application deployment.

## Files to Modify
| File | Purpose | Changes Needed |
| --- | --- | --- |
| P0-PLAN.md through P4.3-PLAN.md | Historical wave plans | Move seven files into docs/waves/{wave}/PLAN.md, preserve historical facts, rebase outgoing links |
| README.md, docs/README.md, docs/waves/README.md | Discoverable navigation | Root entry and categorized document/wave indexes |
| AGENTS.md, CONSTITUTION.md, NEXT-WAVES.md, docs/waves/P4/README.md | Active process | Canonical plan paths and future plan location |
| docs/waves/P4/state.json and P4.3/state.json | Published merge/path bookkeeping | Real merge status and plan references, no private feedback |
| Existing Markdown links/task instructions | References | Update moved targets without changing external classroom-annotator links or historical facts |
| scripts/verify.py | Repository preparation validation | Require archived P0 plan, verify all wave plan entries and canonical location |
| docs/audit/reports/README.md, archive maintenance report | Traceability | Document moves, checks, actual merge and no application redeploy |

## Dependencies
| File | Relationship |
| --- | --- |
| .github/workflows/verify.yml | Runs verify.py and public/privacy checks on main |
| Existing tests/production build | Unchanged app sources; established 100-test source gate retained |
| Private automation cc-p4-x | Existing prompt must point future plans to docs/waves/<wave>/PLAN.md |
| Local-only privacy/history guard | Must run before all remote ref updates; retain no-reply Git identity |

## Test Files
| Test | Coverage |
| --- | --- |
| scripts/verify.py | UTF8/LF, links, wave plan files/state references and root layout |
| scripts/verify_public.py | Public privacy and no production feedback registry |
| Existing CI checks | Types, all100 offline tests, build; no live API needed for document-only reorganization |

## Reference Patterns
| File | Pattern |
| --- | --- |
| docs/waves/P4.3/{tasks,acceptance,state} | Keep a wave's artifacts together |
| docs/product/changes/README.md | Small index and relative navigation |
| docs/audit/reports/README.md | Preserve historical reports and append current outcomes |

## Risk Assessment
- [ ] Public API changes.
- [ ] Database migration or live model test needed.
- [x] Broken relative links/in-code path literals: rebase from original location and verify.
- [x] Future automation could recreate root plans: update prompt and active repository instructions.
- [x] Privacy merge: fast-forward existing sanitized/no-reply commits, lease remote main; never server-create a merge exposing personal email.
