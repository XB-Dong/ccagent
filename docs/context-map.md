# P0 前置工作上下文地图

日期：2026-10-26｜范围：仓库初始化、规格与计划，不实现产品。

## Files to Modify

| File | Purpose | Changes Needed |
| --- | --- | --- |
| README.md / CONSTITUTION.md / AGENTS.md | 入口、长期约束、当前执行规则 | 新建 cc 项目专用内容 |
| P0-PLAN.md / NEXT-WAVES.md | P0 提案与后续依赖 | 分开准备状态与实施状态 |
| specs/product.md / specs/acceptance.md | 需求与验收追踪 | 纳入既有业务及新增自适应要求 |
| specs/architecture.md / specs/adaptive-learning.md | Harness 扩展与沉淀架构 | 标明复用、扩展和待验证点 |
| specs/contracts/domain.md | 状态、数据、错误和幂等契约 | 先定领域约束，不编造上游接口 |
| docs/decisions/ / docs/references/ / docs/discovery/ | 决定、参考依据和待确认项 | 钉住来源版本，保留未知 |
| docs/waves/P0/ | 任务包、状态与交接 | 未派发任务不伪填基准 SHA |
| scripts/verify.py / .github/workflows/verify.yml | 仓库检查 | 文档链接、结构、脱敏与记录检查 |
| .gitignore / .gitattributes / .editorconfig | 仓库卫生 | 统一 LF，排除凭据、业务数据、缓存 |

## Dependencies (may need updates)

| File | Relationship |
| --- | --- |
| 外部 AI-CODING-PARADIGM.zh.md v1.0 | SDD/TDD、任务包、证据和波次交付的方法参考 |
| classroom-annotator @ d31971124cfcbad19e9b56efd54f6f963d618310 | 参考规范组织，不继承旧项目授权、技术栈、凭据、预算 |
| deepseek-harness @ 22ddee3792402c3e70ec5f86a63c3e3e895a2f60 | 指定底座；本轮只读取资料，不安装或启动 |
| 仓库外现有服务器及 DeepSeek 配置 | 留在原受限路径，后续需要时读取，本轮不连接服务器 |

## Test Files

| Test | Coverage |
| --- | --- |
| scripts/verify.py | 本轮文档与仓库检查；不证明业务功能已实现 |
| specs/acceptance.md | 后续产品行为、集成、E2E、部署验收设计，当前 not_run |

## Reference Patterns

| File | Pattern |
| --- | --- |
| 参考仓库 CONSTITUTION.md / AGENTS.md | 中文审阅资料、英文执行指令；明确现行规则 |
| 参考仓库 specs/ / docs/waves/ | 契约单写、任务交接、状态与原始证据分离 |
| Harness docs/architecture.md | profile / bundle / plugin 扩展 |
| Harness docs/subsystems/compaction.md / skills.md | 复用原生会话压缩与 Skill seam |

## Risk Assessment

- [ ] 本轮改变公共 API：没有产品 API，领域契约是草案。
- [ ] 本轮数据库迁移：无。
- [x] 本轮配置变化：新建仓库规范与仅文档验证 CI。
- [x] 未来风险：上游预览版兼容性、业务数据许可、经验误泛化、外部写入副作用。

## Review

Leader 已核对当前目录为空、无祖先 AGENTS.md；确认上述文件仅支撑本轮前置工作。
本次为作者自查，不宣称独立审核通过。实施前需先完成 P0 R0 技术验证与契约冻结。

## 2026-10-26 补充 · DeepSeek 额度节约

用户追加研发成本约束。修改范围为宪法、AGENTS、P0 计划、验收矩阵、Foundation/Acceptance 任务包和 state；新增统一额度策略与 ADR 0003。依赖是未来模型调用适配器与测试分层，当前只更新文档，不实现预算拦截器。
作者已核对：普通测试离线与必要真实 API 验收可以并存；不删真实联调门槛，不混入 cc 业务需求。本次通过仓库检查验证，不调用 DeepSeek。

## 2026-10-26 补充 · 技术栈说明与六项目调研

用户要求说明现有技术栈/存储，并谨慎评估六个参考项目。修改范围：架构中的选型与存储说明、业务需求候选补充、当日追加记录、后续波次提示与 README；新增调研结论及来源索引。原有 11 项需求及版本保留，新增建议明确为候选，不改变 P0 强制范围。
依赖：固定 Harness 持久化文档、六仓库 README 与选定源码、Amazon/SQLite 官方资料。作者已复核业务需求与技术选型的界线；只做文档与来源读取，不运行外部项目，不增加模型/数据服务。校验使用现有仓库检查，不需要产品测试。

## 2026-10-26 补充 · 连续波次与最终统一验收

用户明确要求统一 P1/P2/P3，P0 后由 Leader 自主决定推进；每波先生成类似 P0 的计划，不经人工逐波审批，最终交完整项目和 report。本次只更新已有文档与状态，不启动开发。
修改范围：CONSTITUTION、AGENTS、NEXT-WAVES、P0-PLAN、README、验收说明、P0 Release 任务/交接及 ADR 0001；state 同步持久化推进政策。历史报告/事件不改写，业务需求正文不变。
作者已核对旧“报告后停止、用户决定下一波”与新授权冲突，改为“每波报告与就绪判断后自主推进”；预算、外部权限及真实依赖仍单独遵守。现有仓库检查足以验证本轮文档变更。

## 2026-10-26 启动 · P0/R0

用户已明确启动全栈开发。R0 修改范围：当前授权/state、Foundation 任务包、依赖清单/锁文件、`packages/cc-harness-adapter/` 与其测试、运行配置和验证脚本。先在仓库外安装固定官方 Harness 产物、读取官方扩展契约并验证 UI/工具/持久化 seam；不在未知接口上编写业务实现。
依赖为固定上游 0.2.1-rc.3 与源码基线、现有受限配置和合成数据；核心 TDD 首先覆盖额度守卫、配置和安全工具边界。基础探针允许只读复查已授权云主机，SSH 指纹先于密码认证核对。当前地图经 Leader 自查，独立审核状态仍未运行。

### R0 接口确认后的实现路径

`packages/core/`（SQLite、额度）、`packages/learning/`（来源/反馈/记忆/Skill）、`packages/cc-harness-adapter/`（官方 SDK/overlay/受控插件）、`apps/server/`（鉴权/API/有界学习队列）、`apps/web/`（React 工作台）、`tests/`（领域/权限/集成）。Leader 单写共享契约、依赖、状态和发布配置。依赖 `specs/contracts/runtime-v0.2.md`；已审阅风险为 SQLite 迁移、scope 隔离、运行时预算、会话删除与恢复。原有参考模式不变。

### R1 后续上下文容量复查

修改 `apps/server/business.ts` 的模型投影、`packages/cc-harness-adapter/profile.ts` 的上下文容量、`scripts/live-probe.ts` 的账本主机守卫；测试位于 `tests/context-bounds.test.ts` 与既有原生 Harness 集成。依赖仍为 Store/Learning 和原生压缩。保留完整业务数据，只分页/限制模型侧投影，避免增长后一次工具结果耗尽输入容量。云端接管预算后，本机旧账本不得用于再次付费。Leader 已审阅：无数据库迁移，工具读取新增可选分页参数，付费上限不变。

### P1 活动与报表

修改/新增 `packages/operations/{time,activities,csv,reports}.ts`、`apps/server/{business,app}.ts`、`apps/web/{App,api,ActivitiesPage,ReportsPage}.tsx`，测试 `tests/{activity,reports}.test.ts`。复用 Store/CAS/once 和 Tasks 状态，不建立外部平台适配器。活动阶段与到期提醒持久化，CSV 仅支持冻结的规范列。Leader 已审阅：既有通用实体表容纳新 kind，无 schema 迁移；新增受控 action，不变更付费限额；严格时间与重复导入是主要风险。

### P2 库存/发货

新增 forecast/inventory/allocation/shipping 领域模块及 InventoryPage/ShippingPage，依赖P1规范reportKind及严格日期。测试 inventory/shipping，复用Store短事务与CAS。Business负责受控输入，领域重新校验数量/引用/状态，API不信任UI。Leader已审阅：无DDL迁移，主要风险为重复扣预留、缺日当0、池超配、发运后错误返还及数量越界；先留失败行为测试。

### P3 广告与最终交付

新增advertising.ts/AdvertisingPage及其测试，复用Reports规范批次与csvCell；接入operations/API/App，更新发布/使用/证据矩阵。恢复脚本复用既有recovery/ops。Leader已审阅：零分母、混币种、归因窗口和缺成本主要风险；不执行广告写入、不增加付费额度。无DDL迁移。所有发布时间/HTTPS/真实模型证据独立标注。
