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
