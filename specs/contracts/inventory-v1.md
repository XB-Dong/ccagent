# 库存与发货契约 v1.0

P2 v1.1冻结，2026-10-26。Store通用实体种类 forecast/inventory/pool/allocation/shipment，均scope隔离、CAS、来源与事务幂等。

v1.1修订：生产预测写入要求requestId区分新选择意图与网络重试。每日单位按累计期望向上取整再差分，避免小数日需逐日放大。补货建议取提前期+安全期内每日前缀最大缺口（覆盖期至少1日），晚到货不能抹去早期缺口；另列提前期内urgentGap与正常最早到货日，明确需人工加急/调拨，不能声称普通补货能挽回已损失销量。物理池以规范化physicalSku与batchReference元组哈希唯一，前后空白不创建第二池，店铺窗按规范化店名。双号trim后校验唯一；部分到货必须0<received<quantity。

forecast：store/site/listing/asOf/batchId(可选)、baselineDaily(可空)、dailyDemand、manualReason、previousId/version、method。从sales reportKind中提取同链接连续7日至asOf，缺日不是0；人工覆盖必须原因，保留基线。每次版本有输入hash与更新日期，按周显示待更新。

inventory：forecastId/asOf/available（已经扣除预留的可售数）/reserved（仅展示）/inbound[{date,quantity}]/leadDays{purchase,transport,receiving}/safetyDays/horizon/demandFactors[{date,multiplier}]。所有量非负、整数数量，日期严格，参数有界。到货当天先入库再消耗，库存不为负，未满足需求单列lostDemand；输出每天opening/arrival/demand/closing/lostDemand，首个缺货日、总预计损失需求、补货建议、最晚发货/采购日期与明确输入假设。建议覆盖提前期+安全天数，不能只库存除日均。无需求时缺货日null。

pool：physicalSku/quantity与每店availableFrom/availableTo；allocation事务内校验所有未释放份额之和≤池quantity，日期窗匹配、CAS更新池revision，稳定requestId重复不得二次分配。不能跨scope/物理SKU调拨。allocation引用inventory和pool；其qty仅表示内部预留，不伪称已到货。取消尚未发运草稿才可显式释放。

shipment：由allocation创建，继承store/site/listing/physicalSku/quantity等共用字段；内部status=draft/ready/in_transit/partially_received/received/cancelled，四前置均检查通过才ready；人工双系统编号在scope内各自唯一且重复同输入幂等；无双号不得标发运。累计到货整数0..quantity且不可倒退，运输中不允许取消以免错误释放共享池；已分配且已发运份额保持占用历史，池库存后续入库/盘点需新池记录，不能自动返还已发出货物。所有写入记录来源，不执行外部系统写入。
