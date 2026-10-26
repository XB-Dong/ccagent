# P1 任务包

waveId=P1；rootTasks=P1-ACTIVITY、P1-DATA、P1-INTEGRATION；owner=Leader；baselineSha=9124665c76dc8ff8d706b4d5ea12e5b0682b74ff；spec=operations-v1.0 frozen。

P1-ACTIVITY允许 packages/operations/activities.ts、时间模块和 tests/activity.test.ts。依赖 Store/Tasks；验收含 DST 拒绝/消歧、跨站点显示、完整阶段、重启补记和幂等。P1-DATA允许 reports.ts、CSV模块和 tests/reports.test.ts；验收含缺失、重复、引号、scope、规范映射及稳定批次。P1-INTEGRATION允许 apps/server/business.ts、worker、apps/web/ActivitiesPage.tsx 和 ReportsPage.tsx、api.ts/App.tsx；验收经真实登录页面操作并核实持久化，无模型依赖。

无并行写入派发；独立审核仅只读，必须基于最终具体提交/工作树，记录实际发现及修复。每根因2次修复，45分钟复核，上限与累计次数继承 P0，不执行真实付费测试、不使用公司数据。输出中文波次报告与证据引用，未完成门槛如实保留后继续 P2 计划。
