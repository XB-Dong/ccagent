# R0 运行契约 v0.2

日期：2026-10-26｜Leader 已自查冻结；作者自查不等于独立审核。

- Node 24.19.0 单进程持有业务 SQLite；原生 Harness 进程按 scope 隔离，运行目录在 `CC_DATA_DIR`，只通过固定业务工具访问后端。官方 SDK 离线启动与空工具组合已实际验证。禁止 shell、任意 SQL/代码、插件安装与通用文件工具。
- 所有实体携带 scope、稳定 ID、revision、UTC 时间。跨 scope ID 返回 NOT_FOUND。事务内保存业务变更和幂等回执；删除清理派生回执并保存 tombstone，恢复先重放删除账本。
- Feedback 按来源去重；仅原意、页面、期望与实际完全一致才自动归并，语义相似不擅自合并。自然语言负反馈先记录原文事实；推断不作为已确认记忆。
- 业务摘要为确定性有界投影，结构化事实保持完整、精确值不改写；已确认纠正替代旧版本，CAS 阻止覆盖。原生会话压缩继续使用 Harness basic compaction，模型网关同样计费并限制调用。
- L0 Skill 仅能将已确认成功清单复用为内部草稿，经清单重放与规则检查后启用。L1 等确认，L2 拒绝。不能把一般流程步骤验证等同真实外部业务成功；成功由 cc 明确确认并逐项检查。
- 官方 Skill registry + cc-approved Provider 按当前状态、scope、正文哈希读取；不存在默认文件扫描。撤销后停止新读取，业务工具入口重新检查 Skill 版本，正文不授予权限。
- 统一预算数据库先 reserve 再转发，包括失败、工具循环和压缩；usage 缺失保留预留。模型网关只允许固定 Messages endpoint；默认离线，显式配置才启用。研发累计上限沿用 P0 state。
- 认证使用单使用者会话 Cookie（HttpOnly、SameSite、生产 Secure），状态变更校验 Origin。浏览器不获得模型 Key；服务端不返回堆栈或任意文件。导出为仓库外受控 Markdown/JSON，不推送代码。

当前 Learning 第一组测试在实现后编写，仅记录为行为回归测试，未产生该组 Red；不得列为 TDD。额度守卫留有实际 Red、首次 Green 失败及修复后 Green。后续复杂规则先写失败行为测试。
