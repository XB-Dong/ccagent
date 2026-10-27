# P4.2 派发任务与验收

冻结规格：[p42-v1](../../../specs/contracts/p42-v1.md)；计划：[P4.2](../../../P4.2-PLAN.md)。精确 baselineSha 在 state.json；派发消息重复该 SHA、路径、依赖与验收。Owner 的实际 Agent 标识在派发后登记，未运行不伪填结果。

| 根任务 | 允许写入/依赖 | 可观察验收与交付 |
| --- | --- | --- |
| P42-TASK-GROUPS | apps/web/TasksPage.tsx、task-groups.ts、p42-tasks.css、tests/task-groups.test.ts；依赖现有 Task、calendarDay/timeZones、TaskForm | 创建日期组/数量、明确查看时区、先筛选后分组；跨日/排序/未知/不改原数据的真实 Red→Green；提供精确 commit、原始日志与实际命令/退出码 |
| P42-REVIEW | 只读上述实现、规格与相关旧流程；不改代码/共享文件、不用真实 Key | 需求与实现一致、创建/完成口径分开、无权限/数据变动、无旧任务丢失；发现含位置、触发、预期/实际、证据与未验证项；Leader 逐项处置复验 |
| P42-INTEGRATION | Leader 单写共享文档、状态、验收/报告和发布脚本 | 全离线/类型/构建/仓库；实际浏览器、精确 CI、固定产物、既有配置/数据保持及健康；来源修订未变才标采纳 |

修复边界：每根因2次定向修复后诊断留痕，不能换波次重置。付费测试无累计费用/调用/token 上限，离线与无关文档工作不调用模型。原始日志/截图/反馈载荷仅在 ../.ccagent-local/evidence/p42 及相关仓库外 deployment 证据。
