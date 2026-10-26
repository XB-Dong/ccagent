# 决定 0004 · 官方 SDK 与运营工具组合

日期：2026-10-26｜状态：R0 已选定，持续验证

使用固定版本 `@deepseek-ai/dsh` / `dsh-sdk-client` 0.2.1-rc.3。后端通过官方 SDK 启动 `sdk-minimal` profile，保留原生 Agent loop、会话 JSONL、检查点与压缩。React 工作台通过项目后端访问它，不复制或重写 Agent loop。

离线 SSE 探针已实际启动官方进程并收到持久化事件；观察请求 `/v1/messages`、模型 `deepseek-flash`、输出上限 512，禁用开发工具后 advertised tools 为空。这是离线协议证据，不是真实 DeepSeek 验收。

运营 overlay 禁用文件工具、工作目录工具、终端及持久 shell 和默认重试；仅注册 cc 的受控业务工具与 `cc-approved` Skill Provider。子进程白名单环境不继承 GitHub、SSH 或真实模型凭据；模型访问经本机有额度约束的专用网关。所有调用及压缩共享持久化预算，缺失 usage 按预留额度记账。

业务库采用 Node 24.19.0 内置 SQLite（实际探针 SQLite 3.53.3），启用外键、WAL、短事务与 busy timeout。单主机单业务进程，不增加 Redis/PostgreSQL。原生会话、业务库、Skill/导出与撤销账本均在仓库外，以协调暂停及清单校验实现一致恢复点。

SDK 目前没有中途 prompt cancel 方法；取消使用官方 close() 终止所属运行进程并在下一次恢复原会话，界面必须显示取消/中断而非成功。每个运营 scope 使用隔离 home 与空工作目录，后端校验会话归属。

前端采用 React 19.3.1、Vite 8.3.5、TypeScript 7.0.2；版本通过注册表读取后固定。采用独立运营布局，复用官方进程与插件接口，不依赖编码用 Web 页面的管理能力。

R0 外部证据：`D:/project/.ccagent-support/evidence/P0/R0/harness-offline.json`、`server-probe.json`。主机身份已先于认证核对；服务器无 Node、Docker 已安装。尚未部署，尚未调用真实模型，原生 Skill/压缩及恢复需继续验收。
