# P1 验收

| ID | 行为 | 状态 |
| --- | --- | --- |
| P1-TIME | IANA/offset一致，DST空白拒绝、重叠明确消歧，起止有效 | passed_internal_synthetic |
| P1-STAGE | 四阶段任务/内部提醒、重启补记、重复无新增、取消不触发 | passed_internal_synthetic |
| P1-DATA | 预览/映射/严格质量、导入幂等、缺失不为0、来源与日期保留 | passed_internal_synthetic |
| P1-UI | 真实页面创建/确认/查看活动与导入；刷新持久化 | passed_internal_synthetic |
| P1-REVIEW | 独立只读审核、逐项处置、类型/回归/构建通过 | passed_internal_synthetic |

发布遗留仍为 P0-RELEASE，公网HTTPS未通过。

实际浏览器/独立审核已执行；真实公司资料与外部接口不在本次合成通过声明内，公开HTTPS遗留仍保留。
