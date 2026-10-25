# 领域契约草案

版本：0.1.0｜状态：待 R0 冻结。字段名是本项目提案，不是上游现有 HTTP/RPC API。

## 通用约定

稳定随机 ID；时间用带偏移 ISO 8601，活动另存 IANA `timeZone`；数量、币种、金额/比例单位显式保存。尚未明确的优惠路径不能自动算价格。金额用精确 decimal 字符串或最小货币单位整数，不用浮点运算推导财务结果。

所有业务对象带 `id / ownerId / workspaceId / revision / createdAt / updatedAt`；店铺/站点范围不得由缺省值偷偷扩成全局。变更带 `expectedRevision`，冲突返回 `REVISION_CONFLICT` 并保留本地草稿。错误有 `code / message / requestId / retryable`，不含原始内部异常或凭据。

| 对象 | 关键字段与不变量 |
| --- | --- |
| SourceRef | sessionId、eventId/seq、taskId、scope、contentHash；引用属于当前 owner，来源缺失需显式降级 |
| OperationTask | type、title、status、dueAt、timeZone、listingRef、input、result、sourceRefs；模型文字不是状态提交 |
| Feedback | category、expected、actual、impact、status、sourceRefs、occurrenceCount、duplicateOf、requirementId；归并不删除来源 |
| Memory | kind、value、scope、verification、validFrom/Until、sourceRefs、supersedes、revokedAt；推断不能伪标 confirmed |
| MemorySummary | version、sourceCursor、sourceRefs、facts、conflicts、pending、contentHash；摘要不是唯一事实库 |
| SkillVersion | name、version、status、riskLevel、scope、inputSchema、steps、allowedTools、sourceRefs、validationRefs、contentHash；版本不可原地覆盖 |
| RequirementChange | changeId、requirementId、version、type、recordedAt、proposedAt、before、after、reason、status、sourceRefs、exportBatchId；未知提出时间为 null |
| LearningJob | kind、sourceKey、algorithmVersion、status、attempt、lastErrorCode、cursor；唯一键防重复派生 |

## 状态与转换

- OperationTask：`draft → ready → in_progress → completed / failed / cancelled`；retry 生成新 attempt，不能把失败覆盖掉。P0 不含外部业务工具。
- Feedback：`captured → needs_clarification / triaged → accepted / deferred / rejected`；交付后 `resolved` 必须关联验证证据，可通过追加事件 reopen。
- Memory verification：`observed / inferred / confirmed / disputed / superseded / revoked`；只有符合 scope 且有效的 confirmed 规则可作为已知前提使用。
- SkillVersion：`candidate → validated → active` 或 `waiting_confirmation → active`；可到 `suspended / superseded / revoked`。验证失败仍是 candidate 并保留失败原因，不进入目录。
- RequirementChange：`candidate → confirmed / withdrawn`；confirmed 可导出为 `exported`，研发确认纳入文档后为 `documented`；后续更正创建新 change，不修改旧记录。
- LearningJob：`pending → running → completed / retry_wait / failed / cancelled`；重启发现运行中的任务按幂等键恢复或标中断，不能标成成功。

## 持久化与并发

业务写入、反馈捕获、outbox 插入在同一业务事务内。会话事件由上游管理，若无法共享事务，接入器从 durable session cursor 重放并用唯一来源键去重，只有业务提交成功才推进 cursor。不以事件回调已执行代替落盘保证。

摘要使用 revision/CAS 和来源快照校验；Skill 激活事务同时更新状态、活动版本指针及 outbox 失效通知。任何执行路径都在最终工具入口验证最新状态。失败通知可重试，但 provider 查询仍按持久状态拒绝撤销对象。

## 业务工具提案

P0 在 Harness 工具 registry 内注册受控动作，暂不定 RPC 方法名或 HTTP 路由。工具组为任务创建/查询/状态变更、反馈提交/补充、记忆查询/纠正/删除、Skill 候选查询/确认/禁用、需求变更导出。

只读动作与内部写入分别标记；写入需要 idempotencyKey 与 scope 校验。已保存任务与学习队列的状态单独返回。跨 scope、非法状态、已撤销 Skill、来源缺失、模型超时分别使用明确错误码，不返回“已完成”。

## 需求导出约定

导出为仓库外 JSON + 人可读 Markdown，schemaVersion、exportBatchId、generatedAt、changes、redactionStatus、hash 一并记录。每个 change 有稳定 changeId。含敏感原文时不得标 redactionStatus=passed；未确认条目只能作为候选附录，不能进入已确认需求正文。

研发追加记录以 changeId 去重，目标为 `docs/product/changes/YYYY-MM-DD.md`；日期取记录时区，不用执行主机时区猜测。当前业务总览引用追加记录，版本单调增加。
