# 运行、备份与恢复

当前发布方案是 [ADR 0005](../decisions/0005-native-service-release.md)：固定官方 Node 24.19.0、Caddy 2.11.7、pnpm 11.25.0，专用 systemd 用户；不需要 Docker Hub。公网地址只有在 HTTPS/鉴权实测后才作为可用入口交付。

最新维护2026-10-26 13:12：当前应用835de30，入口仍为公网HTTPS。研发legacy6次与本轮smoke12次保留，日常runtime改为北京时间按日，初始保护值100个模型请求，工具后续轮次同算。唯一预算库内每行保留预留账户，不能清零/改名追加测试。升级前一致备份，恢复保留全部账户；回退须使用支持budget_account的新版本，旧全表累计6次版本会再次误禁用聊天。最终状态及未完整验证项见[本轮报告](../audit/reports/SMOKE-20261026.zh.md)。下文早期版本与累计上限按历史语境阅读。

2026-10-26后续维护：应用源码为b4744a853cb53ba8a197d822d1c4b7f3c9d59877；公网入口为 `https://114.67.222.150/`，严格证书校验、既有密码登录、Secure会话和Origin校验通过。Caddy已启用开机启动与自动证书续期。历史临时域名失败保留，但不再代表当前IP入口不可用。详见[公网接入决定](../decisions/0006-public-ip-https.md)和[域名接入步骤](PUBLIC-ACCESS.zh.md)。

应用仍只监听云端127.0.0.1:4310；公网经Caddy。`CC_ORIGIN`已切换为公网HTTPS，原HTTP隧道不再是日常入口；旧地址上的写入和登录会被Origin保护拒绝，不应为兼容而关闭保护。

## 路径与凭据

- `/opt/ccagent/releases/<source-sha>`：只读版本源码和已构建静态资源；`current` 是当前代码软链接。
- `/opt/ccagent/tooling`：已校验的官方运行时。
- `/opt/ccagent/config`：受限环境配置与 Caddyfile，`service.env` 为 root-only；模型 Key 不进仓库。
- `/var/lib/ccagent`：业务 SQLite、持久预算、Harness JSONL、导出、访问密码和隐私账本，专用用户可写。
- `/var/lib/ccagent/backups`（运行中API，位于systemd可写根内）或维护者显式指定的停机 backup root：恢复点；访问权限限维护者。配置和模型 Key 独立受限保管，不混入业务备份。

服务：`systemctl status ccagent ccagent-caddy`；日志：`journalctl -u ccagent`。程序日志只输出运行 metadata，不应打印密码、Key 或原始业务会话。只在受信任主机维护，禁止把环境文件或 Docker inspect 等可能含凭据的输出粘贴到聊天。

## 启停与健康

`systemctl restart ccagent` 只重启本项目；`GET /health` 仅表示进程健康。CC界面使用中文服务提示，不展示开发调用计数。维护者通过已鉴权的`GET /api/status`查看模型状态与预算；不把Key存在当作网络可用。生产Cookie为Secure/HttpOnly/SameSite，API写入校验已配置的Origin。

Caddy管理IP的短期证书，初次证书的有效期到2026-11-02 03:24:57+08:00；自动续期配置已启用，未来续期成功尚需实际运行日志验证。保持80端口供HTTP-01验证、443端口供HTTPS，保持专用用户证书目录可写。维护时检查`journalctl -u ccagent-caddy`中的签发/续期状态，不输出私钥。此次TLS-ALPN被网络重置，已显式使用HTTP-01，未关闭浏览器/客户端证书校验。

普通回归 `pnpm check` / `pnpm test` / `pnpm build` 不载入真实 Key。旧研发累计6次及本轮smoke12次均已用尽、留作历史；日常runtime独立按日。后续真实测试必须先有明确的有界测试计划，不能拿日常账户规避研发限额。运行配置可由维护者显式调整；不要把这一能力当作自动扩大研发额度的许可。

## 一致备份

运行中通过已鉴权的 `POST /api/actions/backup` 创建恢复点：先暂停新写入/学习，关闭并 flush 原生会话、等待已接收对话结束，再调用 SQLite 备份接口并保存会话/导出/隐私账本和文件哈希清单。备份期间请求明确返回维护中，完成后恢复服务。不是直接复制有 WAL 的主库。

停机后也可运行：

```sh
CC_DATA_DIR=/var/lib/ccagent node scripts/ops.ts backup --output /var/lib/ccagent-backups
```

## 隔离恢复与正式切换

恢复目标必须是新的空目录；必须提供当前隐私账本与当前预算库，不能只恢复旧备份。系统检查全部文件哈希、重放删除/撤销、合并稳定 request ID 的当前额度并保守保留预留，随后检查 SQLite 完整性。

```sh
CC_DATA_DIR=/var/lib/ccagent node scripts/ops.ts restore --backup /path/to/point --target /path/to/isolated-restore --isolated
```

隔离命令不启动服务。正式恢复先停止 `ccagent`，运行同一命令去掉 `--isolated`（命令检查服务停止），确认备份/当前账本/权限后再由维护者切换数据目录。系统只支持单服务实例；恢复期间不允许另一个进程持续调用同一预算库。原生会话保留其工作目录，正式恢复使用相同的稳定挂载路径；变更路径时需按官方接口验证恢复与工作目录。

代码回退只切换本项目的 `current` 版本链接并重启，数据库和账本不回退；涉及未来数据结构变化先核对迁移兼容性。每次发布记录旧、新 SHA 和实际回退/恢复验证，不能以健康检查代替数据恢复。

## 删除边界

删除反馈/记忆会清除其关联来源及带内容的派生记录、失效当前导出，并退休旧对话入口，阻止旧上下文重建已删除事实；无关幂等回执保留。撤回需求会生成稳定撤回事件，补充纠正再次确认后生成新变更并保留旧版历史。产品不会自动写 GitHub。

Harness 原始日志和既有备份作为隔离存档另行保留，不承诺所有备份即时物理擦除。恢复必须先应用当前隐私账本；已经下载到个人设备的审阅包不由服务器远程删除。真实业务资料/公司数据仍须先明确上传及发模型的许可。

## 本次实机证据

鉴权checkpoint生成11文件恢复点，隔离恢复实体/原生日志/预算一致、integrity通过。代码另行回退9124665再切回3a37ec5，数据与4次预算仍在。云端预算为唯一权威，本机旧付费探针禁用；初始2次种子不覆盖现有账本。正式数据恢复前停服务，确保目标权限归ccagent，保留当前隐私/预算账本；隔离恢复目录不会自动成为生产目录。详见项目交付报告。
