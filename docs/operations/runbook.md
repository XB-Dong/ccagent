# 运行、备份与恢复

当前发布方案是 [ADR 0005](../decisions/0005-native-service-release.md)：固定官方 Node 24.19.0、Caddy 2.11.7、pnpm 11.25.0，专用 systemd 用户；不需要 Docker Hub。公网地址只有在 HTTPS/鉴权实测后才作为可用入口交付。

## 路径与凭据

- `/srv/cc-workbench/app/releases/<source-sha>`：只读版本源码和已构建静态资源；`current` 是当前代码软链接。
- `/srv/cc-workbench/app/tooling`：已校验的官方运行时。
- `/srv/cc-workbench/app/config`：受限环境配置与 Caddyfile，`service.env` 为 root-only；模型 Key 不进仓库。
- `/srv/cc-workbench/data`：业务 SQLite、持久预算、Harness JSONL、导出、访问密码和隐私账本，专用用户可写。
- `/var/lib/backups`（由实际命令指定）或仓库外 backup root：恢复点；访问权限限维护者。配置和模型 Key 独立受限保管，不混入业务备份。

服务：`systemctl status ccagent ccagent-caddy`；日志：`journalctl -u ccagent`。程序日志只输出运行 metadata，不应打印密码、Key 或原始业务会话。只在受信任主机维护，禁止把环境文件或 Docker inspect 等可能含凭据的输出粘贴到聊天。

## 启停与健康

`systemctl restart ccagent` 只重启本项目；`GET /health` 仅表示进程健康。登录后状态区分别显示模型启用、最近成功/失败及预算耗尽，不把 Key 存在当作网络可用。生产 Cookie 为 Secure/HttpOnly/SameSite，API 写入校验已配置的 Origin。

普通回归 `pnpm check` / `pnpm test` / `pnpm build` 不载入真实 Key。研发真实测试跨波共享累计6次上限，不因恢复/重启重置。运行配置可由维护者显式调整；不要把这一能力当作自动扩大研发额度的许可。

## 一致备份

运行中通过已鉴权的 `POST /api/actions/backup` 创建恢复点：先暂停新写入/学习，关闭并 flush 原生会话、等待已接收对话结束，再调用 SQLite 备份接口并保存会话/导出/隐私账本和文件哈希清单。备份期间请求明确返回维护中，完成后恢复服务。不是直接复制有 WAL 的主库。

停机后也可运行：

```sh
CC_DATA_DIR=/srv/cc-workbench/data node scripts/ops.ts backup --output /srv/cc-workbench/data-backups
```

## 隔离恢复与正式切换

恢复目标必须是新的空目录；必须提供当前隐私账本与当前预算库，不能只恢复旧备份。系统检查全部文件哈希、重放删除/撤销、合并稳定 request ID 的当前额度并保守保留预留，随后检查 SQLite 完整性。

```sh
CC_DATA_DIR=/srv/cc-workbench/data node scripts/ops.ts restore --backup /path/to/point --target /path/to/isolated-restore --isolated
```

隔离命令不启动服务。正式恢复先停止 `ccagent`，运行同一命令去掉 `--isolated`（命令检查服务停止），确认备份/当前账本/权限后再由维护者切换数据目录。系统只支持单服务实例；恢复期间不允许另一个进程持续调用同一预算库。原生会话保留其工作目录，正式恢复使用相同的稳定挂载路径；变更路径时需按官方接口验证恢复与工作目录。

代码回退只切换本项目的 `current` 版本链接并重启，数据库和账本不回退；涉及未来数据结构变化先核对迁移兼容性。每次发布记录旧、新 SHA 和实际回退/恢复验证，不能以健康检查代替数据恢复。

## 删除边界

删除反馈/记忆会清除其关联来源及带内容的派生记录、失效当前导出，并退休旧对话入口，阻止旧上下文重建已删除事实；无关幂等回执保留。撤回需求会生成稳定撤回事件，补充纠正再次确认后生成新变更并保留旧版历史。产品不会自动写 GitHub。

Harness 原始日志和既有备份作为隔离存档另行保留，不承诺所有备份即时物理擦除。恢复必须先应用当前隐私账本；已经下载到个人设备的审阅包不由服务器远程删除。真实业务资料/公司数据仍须先明确上传及发模型的许可。
