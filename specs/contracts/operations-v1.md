# 内部运营契约 v1.0

2026-10-26｜P1 v1.1 冻结。存储复用 scope/id/revision/来源/CAS/幂等回执。所有写入经鉴权和 Origin 校验；领域模块位于 packages/operations，与 UI/HTTP 分离。

v1.1 变更：业务类型使用 reportKind，避免与实体 kind=report 冲突；规范行排序后计算哈希，换序仍幂等；显式全空记录拒绝。为保证开始后15分钟检查先于结束，当前活动时长须大于15分钟。这是 Leader 的最小工程策略，不冒称 cc 原始要求；未来短时活动需定义更合适的检查点后调整。

Activity：title、store、listing、timeZone、startAt、endAt、leadHours、offerNote、stages、status。时间需精确到分钟，offset 必须与 IANA 站点匹配；end>start+15分钟，leadHours为0–168，检查时刻为开始后15分钟。阶段键 activityId:stage 固定；tick事务同时保存任务与阶段引用；取消使未完成阶段任务取消，已完成记录保留。阶段完成只证明人工确认，不能证明平台 API 操作。

ReportBatch：实体kind=report、reportKind(sales/ads)、store、site、asOf、mapping、contentHash、rows、warnings、sources。输入最多100KB/1000行，CSV支持引号、逗号、双引号及 CRLF；拒绝坏引号/重复标题/缺列/重复规范键/空关键字段/NaN/负数/非法日期。映射为规范名到标题名。相同 scope、kind、store、site、日期和规范行导入幂等。asOf不能伪填当前；UI展示时效。sales规范 date/listing/units，ads规范 date/listing/campaign/searchTerm/impressions/clicks/spend/orders/revenue/currency。广告不存在的列拒绝，不能补0。预览不落盘；确认导入再次服务端校验。

模型工具本波仍限 P0 工具；结构化活动/报表入口可离线使用。不把完整报表发送给模型。P2/P3 计算使用规范快照及批次 ID 作为 provenance。
