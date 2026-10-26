# 广告分析契约 v1.0

P3冻结，2026-10-26。adAnalysis引用规范ads reportKind批次与原始来源。按listing/campaign/searchTerm分组，币种始终参与分组；不同币种不汇总金额。允许人工dailyBudget/maxACOS/minClicks/costPerOrder、costCurrency、costBasisComplete；输入假设保留在快照，不冒充平台预算与利润。

v1.1修订：可选adGroup列映射后支持广告组维度，其键包含所属campaign；链接/搜索词维度为跨活动同币种汇总，不能当单活动明细。人工预算另需budgetCurrency且仅比较匹配币种、指定广告活动的单日花费。金额最多6位小数，以整数微单位累计、比较与计算利润；超精度/安全范围及输出往返失真明确拒绝，不静默舍入。模型运营摘要有5KB总界限、每类/每分析组数量限制，显示totals与truncated及活动归属，不能把容量省略当作无数据。

公式与归因口径参考Amazon官方[ROAS帮助](https://advertising.amazon.com/help/G78DVL9PAZZ83KQX)、[广告指标/归因](https://advertising.amazon.com/help/GX7KDKHMWQYMJ385)。平台类型/账号口径可能不同，因此窗口由报表实际值输入，不写死统一平台规则。

CTR=clicks/impressions，CPC=spend/clicks，CVR=orders/clicks，ACOS=spend/revenue，ROAS=revenue/spend；比率显示百分数时明确×100，零分母为null。归因窗口1–90天，批次asOf距组内最新date达到窗口才标成熟；过期快照不能因今日时间变化而自动变成熟。最新数据date、asOf、来源和范围均可见。

低样本/归因未成熟仅提示补数据/继续观察。成熟且样本≥人工minClicks时，零转化但有花费→检查搜索词相关性；ACOS超过人工目标→建议人工检查出价/否词/预算；不自动执行、不把建议当操作完成。有dailyBudget才讨论花费相对预算，跨日期先按每日汇总比较，不把多天总额与一天预算直接比。

利润只有明确costBasisComplete=true、costPerOrder非负且币种匹配时计算revenue-orders*costPerOrder-spend；单位为每订单总非广告成本，未含项需人工纳入该估计，不声称财务结算。缺数据返回null/原因。数据截至以后新增转化不在当前批次内。导出CSV对公式前缀转义，原始规范事实不修改。
