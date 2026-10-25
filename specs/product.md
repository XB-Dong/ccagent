# 产品规格索引

版本：0.1.0｜状态：P0 设计草案

[业务需求文档](../docs/product/REQUIREMENTS.zh.md)是业务要求的唯一当前总览；[日期记录](../docs/product/changes/README.md)保存变化。本文件只组织工程映射，不再维护第二份需求正文。

| 需求 | 行为规格 | 验收 |
| --- | --- | --- |
| CC-ENTRY-001 / CC-HARNESS-001 | [架构与入口](architecture.md) | P0-WELCOME / P0-HARNESS |
| CC-FEEDBACK-001 / CC-MEMORY-001 | [反馈与记忆](adaptive-learning.md) | P0-FEEDBACK / P0-MEMORY |
| CC-SKILL-001 | [Skill 生命周期](adaptive-learning.md) | P0-SKILL |
| CC-HISTORY-001 | [日期追加](../docs/product/changes/README.md) | PREP-REQ / P0-REQ-EXPORT |
| CC-ACT-001 的人工记录子集 | [领域契约](contracts/domain.md) | P0-TASK |
| CC-INV-001 / CC-SHIP-001 / CC-ADS-001 | 业务方向已记录，实施规格留待后续波次 | 尚未排入 P0 |
| CC-DATA-001 / CC-ANALYSIS-001 | 需求文档中的候选补充，待确认再编写实施规格 | 不自动增加 P0 验收 |

所有 P0 编号的具体验收见[验收矩阵](acceptance.md)。冻结前的 ID 不更换，规格变更递增版本并保留决策。
