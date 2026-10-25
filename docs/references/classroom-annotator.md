# 参考项目的工程组织

读取日期：2026-10-26。参考仓库：[XB-Dong/classroom-annotator](https://github.com/XB-Dong/classroom-annotator)。固定基线：`d31971124cfcbad19e9b56efd54f6f963d618310`。

## 已阅读与采用的模式

| 参考材料 | 采用到 ccagent 的内容 |
| --- | --- |
| [README](https://github.com/XB-Dong/classroom-annotator/blob/d31971124cfcbad19e9b56efd54f6f963d618310/README.md) | 先讲使用价值和真实状态，提供清晰文档入口 |
| [CONSTITUTION](https://github.com/XB-Dong/classroom-annotator/blob/d31971124cfcbad19e9b56efd54f6f963d618310/CONSTITUTION.md) | 工程约束、语言、契约、证据、数据边界和波次交付 |
| [AGENTS](https://github.com/XB-Dong/classroom-annotator/blob/d31971124cfcbad19e9b56efd54f6f963d618310/AGENTS.md) | 当前授权明确，任务有允许路径，真实测试与交接 |
| [P0 计划](https://github.com/XB-Dong/classroom-annotator/blob/d31971124cfcbad19e9b56efd54f6f963d618310/P0-PLAN.md) | 目标/非目标、依赖顺序、验收矩阵、修复和停止条件 |
| [架构规格](https://github.com/XB-Dong/classroom-annotator/blob/d31971124cfcbad19e9b56efd54f6f963d618310/specs/architecture.md) | 模块职责、配置、并发/持久化边界和失败行为 |
| [任务包](https://github.com/XB-Dong/classroom-annotator/blob/d31971124cfcbad19e9b56efd54f6f963d618310/docs/waves/P0/tasks/P0-BACK-001.md) | 自包含任务、基准 SHA、规格、所有权、测试和交接 |
| [验证 CI](https://github.com/XB-Dong/classroom-annotator/blob/d31971124cfcbad19e9b56efd54f6f963d618310/.github/workflows/verify.yml) | 本地与 CI 使用统一入口，绑定精确提交、保留失败证据 |

采用方法而不迁移历史：Go/ONNX/媒体架构、旧截止与修复预算、GLM 客户端/模型/凭据、公司数据许可和服务器权限不应用到本项目。新需求明确以官方 DeepSeek Harness 为底座，不能因参考仓库使用 Go 就默认另建 Go 编排层。

旧 AGENTS 叠加了多个历史覆盖条款。本项目改用短小的当前有效指令，历史变化放日期记录和 ADR，减少下一位 Agent 误读过期状态的风险。

另外参考用户提供的《可审计的 AI Coding 开发范式》v1.0（2026-10-26）：规范先行、有限任务、独立核验、真实证据、按波次报告。该文档只规定方法，不提供产品启动授权；本项目的业务需求另立文档。
