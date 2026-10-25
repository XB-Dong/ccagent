# P2 验收

| ID | 行为 | 状态 |
| --- | --- | --- |
| P2-FORECAST | 连续7日/不足明确、人工修正原因/版本、每周更新提示 | passed_internal_synthetic |
| P2-SIMULATE | 每日到货/需求/损失、预留口径、活动假设、补货和日期可复核 | passed_internal_synthetic |
| P2-ALLOCATE | 共享池不会超配、日期窗、scope/CAS/重复幂等 | passed_internal_synthetic |
| P2-SHIP | 四前置、共用字段、双号唯一、累计到货与状态约束 | passed_internal_synthetic |
| P2-INTEGRATE | 浏览器闭环、持久化、独立只读审核和回归 | passed_internal_synthetic |

全部为合成内部决策，不替代外部系统验收；P0发布遗留持续保留。

实际浏览器/独立审核已执行；真实公司资料与外部接口不在本次合成通过声明内，公开HTTPS遗留仍保留。
