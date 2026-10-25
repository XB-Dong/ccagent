# P2 任务包

waveId=P2；baselineSha=27567670a3b863b299db361c7bd25dd0ac84a5ff；spec=inventory-v1.0 frozen；owner=Leader。

P2-FORECAST/INVENTORY：packages/operations/{forecast,inventory}.ts、tests/inventory.test.ts；验证连续数据、人工纠正版本、不重复扣预留、到货/延误/活动倍率/提前期与零需求边界。P2-ALLOCATION/SHIP：allocation.ts、shipping.ts及tests/shipping.test.ts；验证竞争池不足、店铺时间窗、幂等、前置、双号唯一与到货上下限。P2-UI：Business/App/api和InventoryPage/ShippingPage；实际合成浏览器贯通 forecast→inventory→allocation→shipment，刷新持久化。

只读审核根据具体工作树检查，禁止付费/真实资料/源码改写。每根因2次定向修复、45分钟聚焦，上限/累计修复继承前波。输出测试真实Red/Green、审核处置及报告，不等待阶段人工审批。
