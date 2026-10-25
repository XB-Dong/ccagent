# 运行模块

| 目录 | 职责 | 验证入口 |
| --- | --- | --- |
| core | SQLite 实体/幂等、模型额度、隐私账本和一致恢复点 | budget / recovery 测试 |
| cc-harness-adapter | 官方 SDK、运营 profile、受控工具/Skill Provider、模型网关 | harness / gateway 测试 |
| learning | 事实来源、反馈、记忆、摘要、Skill 和需求审阅导出 | learning 测试 |
| operations | 内部运营任务、清单和成功确认 | tasks 测试 |

运行 `pnpm test`，默认全部离线。运行数据、会话、Skill、导出和凭据必须在仓库外。浏览器只经鉴权后的 `apps/server` 访问业务服务，不能直接访问原生 Harness 管理能力。
