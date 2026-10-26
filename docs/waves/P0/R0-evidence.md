# P0/R0 运行事实

日期：2026-10-26｜当前部分通过，仍继续执行，不是 P0 完成报告。

| 项目 | 已观察事实 | 证据（仓库外） |
| --- | --- | --- |
| 运行时 | Node 24.19.0、pnpm 11.25.0；官方 dsh/sdk 0.2.1-rc.3 已安装 | npm 元数据、锁文件 |
| 模型与工具 | 真实 DeepSeek 读取合成任务并正确回报标题；2 次请求，输入 2206 / 输出 36 tokens | `../.ccagent-local/evidence/P0/R0/live-*.json` |
| 工具限制 | 离线官方进程仅广告 cc 工具与原生 Skill tool；原生调用 cc_list_tasks 成功 | `evidence/tests/harness-offline-native.json` |
| 会话恢复 | 关闭并重建官方进程，恢复原 sessionId 并继续对话 | 同上原生离线测试 |
| 业务核心 | 来源幂等、精确归并、纠正/CAS、删除 tombstone、scope、Skill 分级/撤销通过回归 | `evidence/tests/learning-first.json` |
| TDD | 额度、任务状态留有实际 Red/Green；浏览器发现 HTTP 状态覆盖，补 Red 后修复 Green | `evidence/tests/budget-*.json`、`tasks-*.json`、`api-checklist-*.json` |
| 浏览器 | 真实点击登录、建带时区任务、重启重新登录后数据仍在、勾选完成→L0 Skill 生成→停用 | `evidence/P0/browser/skill-active.png`；工具操作记录 |
| 云主机 | SSH 主机指纹先于认证核对；Ubuntu22.04、约4GB内存、Docker29.9，无业务容器 | `evidence/P0/R0/server-probe.json` |

追加实测：原生 compactNow 实际提交 summary/shadowedRange；Skill 正文通过原生工具加载，停用后不返回；取消关闭挂起的原生请求且不重试；删除/撤销账本在旧库恢复后重新生效，完整恢复点哈希篡改被拒绝。以上均为离线合成机制验证。

独立只读审核发现8项缺陷并已进入修复复验，见 [审核处置](../../audit/reviews/P0-001.md)。未完成门槛：浏览器取消/恢复及删除边界的最终复验、精确提交 CI、授权云部署与 HTTPS、恢复和代码回退实机验收；不提前标通过。

研发预算为持久文件 `../.ccagent-local/p0-model-budget.sqlite`，后续波次共享，剩余4次；不为普通回归加载真实 Key。

实现路径调整：运行接口已验证的领域功能由 Leader 单写；业务回归第一组在实现后添加，未声称其为 TDD。原生 Skill/压缩等未完成接口仍须隔离验证，不能据本页提前通过 P0。
