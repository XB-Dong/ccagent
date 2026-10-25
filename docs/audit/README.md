# 审计记录

分别记录前置、实施、离线夹具、独立审核、真实浏览器/模型及云端验证，不生成虚假记录。

事件存 `events/`，阶段报告存 `reports/`；文件名采用带时区的 Windows 安全时间戳。大型原始结果与资料缓存放在仓库外，报告给出脱敏摘要、索引和必要哈希。

报告中的提交 SHA 表示被检查基线；报告文件自身后续提交与 CI 结果通过 Git 历史/GitHub Actions 关联，避免试图在文件内写入自身尚未产生的哈希。Git 与 JSONL 提供追踪，不保证不可篡改。

最近报告：[项目交付](FINAL-REPORT.zh.md) · [各波索引](reports/README.md) · [验收矩阵](acceptance-result.md)。
