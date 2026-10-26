# P4.1 任务与验收

规格：[p41-v1](../../../specs/contracts/p41-v1.md)。范围及决定：[计划](../../../P4.1-PLAN.md)。任务的精确 SHA、实际所有者及状态在 state.json，派发消息包含全部冻结输入/允许路径。

| 根任务 | 写入范围 | 验收 |
| --- | --- | --- |
| P41-TASK | packages/operations/tasks.ts、task-time.ts，tests/task-edit.test.ts | 确认后编辑不换 ID、修订冲突/跨范围拒绝、清单勾选重置、时间校验、done 时间/经验只记一次、旧输入兼容 |
| P41-TASK-UI | apps/web/TasksPage.tsx、TaskForm.tsx、WorkCalendarPage.tsx、task-time.ts、p41-tasks.css、display.ts，tests/task-time.test.ts | 中文编辑/取消/保存、意大利选项、起止下拉、冬夏/跳时/重叠/旧分钟处理、日历真实分钟与未记录分别展示 |
| P41-NOTES | packages/operations/notes.ts、apps/web/NotesPage.tsx、p41-notes.css，tests/notes.test.ts | 新增/编辑/搜索/删除、敏感输入及范围/修订校验、幂等/重启/删除恢复，不进入 Skill/记忆 |
| P41-INTEGRATION | Leader 的共享文件与 tests/p41-api.test.ts、文档/发布 | HTTP 边界/持久化、全部离线/类型/构建，实际浏览器和必要真实 DeepSeek 兼容；CI/云固定产物与恢复 |
| P41-REVIEW | 只读，不写实现；Leader 记录处置 | 计划实现一致、时区/统计真实性、隐私与权限、回归及未验证声明 |

状态判定：产品实现、离线测试、实际浏览器、必要模型验证、精确 CI/同步、授权发布及恢复均独立记载。未完成强制项不能 completed。外部原始证据放 D:/project/.ccagent-support/evidence/p41，不包含真实反馈原文/密钥到 Git。
