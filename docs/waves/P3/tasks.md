# P3 任务包与验收

baselineSha=2b70206287b3509383a8f27971ab71953727419b；waveId=P3；spec=advertising-v1.0 frozen；owner=Leader。

P3-ADS路径 packages/operations/advertising.ts、tests/advertising.test.ts、AdvertisingPage、operations/api/App。验收ADS-METRIC（公式/0分母）、ADS-BOUNDARY（币种/归因/成本）、ADS-UI（实际导入→分析→来源/建议），初始not_run。P3-INTEGRATION路径tests/最终文档，验收完整回归、独立审核、跨模块来源与权限、恢复和代码回退分别实测，初始not_run。P3-RELEASE继承P0-RELEASE，不改根名/累计次数：精确SHA/产物/CI、云部署、私密鉴权、资源/恢复/回退、必要最小真实模型流、公开HTTPS分别记录。

合成测试不调用模型，预算全局累计6调用/24000输入/4096输出/28096总tokens，已用2，重试0。每根因2次定向修复，45分钟聚焦。只读审核可跑离线探针，不允许付费/读取凭据/改源码。输出真实报告/逐需求矩阵、使用和维护资料；存在强制缺口最终仍partial。
