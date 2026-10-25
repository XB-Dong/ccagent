# ccagent · cc 的运营工作台

基于 **DeepSeek Harness**，面向 cc 的亚马逊日常运营：对话入口、活动跟进、库存补货、发货协同、广告分析，以及持续积累的工作经验。

**当前状态：P0–P3 内部验收版已实现；37项离线测试与业务浏览器流程通过，最终部署验证进行中。公网HTTPS因云厂商临时域名拦截未通过，不标完整发布。**

[使用说明](docs/operations/USER-GUIDE.zh.md) · [维护与恢复](docs/operations/runbook.md) · [P1计划](P1-PLAN.md) · [P2计划](P2-PLAN.md) · [P3计划](P3-PLAN.md)

仓库为私密仓库：[XB-Dong/ccagent](https://github.com/XB-Dong/ccagent)。本地目录：`D:/project/ccagent`。

## 从这里阅读

| 想了解什么 | 入口 |
| --- | --- |
| cc 要解决哪些问题，后来增加了什么 | [业务需求总览](docs/product/REQUIREMENTS.zh.md) · [按日期追加记录](docs/product/changes/README.md) |
| P0 准备做什么，什么还没确定 | [P0 计划](P0-PLAN.md) · [待确认清单](docs/discovery/open-questions.md) |
| 后续波次与自主推进、最终验收 | [P1/P2/P3 规划规则](NEXT-WAVES.md) |
| 如何开发、验证与交付 | [AI Coding 宪法](CONSTITUTION.md) · [Agent 规则](AGENTS.md) |
| 工作台怎样复用 Harness | [架构](specs/architecture.md) · [上游调研](docs/references/deepseek-harness.md) |
| 同类项目哪些值得参考、哪些技术可迁移 | [同类项目调研](docs/references/同类项目.md) |
| 怎样记住反馈、压缩经验和生成 Skill | [自适应机制](specs/adaptive-learning.md) |
| 行为怎样被验收 | [验收矩阵](specs/acceptance.md) · [领域契约](specs/contracts/domain.md) |
| 当前波次的真实状态 | [P0 状态](docs/waves/P0/state.json) · [前置交接](docs/waves/P0/handoffs/preparation.md) |
| 本轮结果、证据与尚未运行项 | [前置交付报告](docs/audit/reports/report-20261026T004638+0800.md) |

## 项目方向

工作台打开先向 cc 问好，展示当前实际可用的功能及示例说法。对话与结构化任务相连，结果显示数据依据、状态和待确认项。

自适应分两路：使用反馈形成迭代需求；成功工作流程形成有来源、适用条件和版本的 Skill。会话压缩、长期业务记忆与研发记录分别管理。官方Harness与业务学习两条路径已实现并分层验证，详见各波报告；发布遗留单独保留。

## 准备阶段的交付范围（历史）

业务需求与日期记录、工程规范、上游版本基线、P0 提案、任务包、验收设计和轻量仓库检查。本轮没有产品代码、依赖安装、API 调用或服务器操作。

运行仓库检查（Python 3.12+，仅标准库）：

```sh
python scripts/verify.py
```

GitHub Actions 使用同一检查入口。它检查文档链接、结构、追踪记录和常见凭据风险，**不证明产品功能或部署通过**。

## 开发运行

Node 24.19.0、pnpm 11.25.0。安装 `pnpm install --frozen-lockfile --ignore-scripts`，检查 `pnpm check` / `pnpm test`，构建 `pnpm build` 后执行 `pnpm server`。默认地址 `http://127.0.0.1:4310`，默认离线，不加载真实模型 Key。

`CC_DATA_DIR` 默认为仓库外的 `../.ccagent-support/product-data`；首次运行的访问密码保存在该目录 `access.json`，不要提交或公开。配置及维护说明会随发布验收补齐。开发 Vite 使用 `pnpm dev`，后端相应设置 `CC_ORIGIN=http://127.0.0.1:4311`。

当前实测与未验项见 [R0 运行事实](docs/waves/P0/R0-evidence.md)。CI 已增加类型检查、离线测试和构建，真实 DeepSeek 探针不在 CI 中运行。

## 仓库约定

业务文档和审阅材料使用中文；源码标识符、注释、接口字段、提交信息和 Agent 执行指令使用英文。按职责组织文件，先写可检查的行为与验收，再实现；核心规则采用真实 TDD，审核与验收保留证据。

凭据、真实运营报表、会话原文、数据库、日志、运行时 Skill 和上游源码缓存放在仓库外。已有服务器与模型凭据继续使用原受限配置，项目不保存副本。暂不指定项目源码许可证；上游 MIT 许可与第三方声明在引入实际代码时保留。

本机运维交接索引：`D:/project/.ccagent-support/LOCAL-OPERATIONS.md`（仓库外，仅记录既有配置位置，不含密码或 Key 正文）。后续接手按此定位，不重复索取已有凭据。
