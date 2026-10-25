# 官方 DeepSeek Harness 调研基线

读取日期：2026-10-26。官方仓库：[deepseek-ai/deepseek-harness](https://github.com/deepseek-ai/deepseek-harness)。用户已明确指定此项目。固定源码 SHA：`22ddee3792402c3e70ec5f86a63c3e3e895a2f60`，提交时间 2026-10-23T11:48:59Z，默认分支 master。

## 观察事实

| 内容 | 固定版本依据 | 对项目的意义 |
| --- | --- | --- |
| plugin/profile/bundle 架构，Web UI 也是组合的一部分 | [architecture.md](https://github.com/deepseek-ai/deepseek-harness/blob/22ddee3792402c3e70ec5f86a63c3e3e895a2f60/docs/architecture.md) | 优先扩展，避免重写运行循环 |
| 原生自动/手动压缩、来源事件及锁/失败语义 | [compaction.md](https://github.com/deepseek-ai/deepseek-harness/blob/22ddee3792402c3e70ec5f86a63c3e3e895a2f60/docs/subsystems/compaction.md) | 复用上下文压缩；业务长期记忆另设计 |
| Skill registry/provider、作用域、动态注册与失效机制 | [skills.md](https://github.com/deepseek-ai/deepseek-harness/blob/22ddee3792402c3e70ec5f86a63c3e3e895a2f60/docs/subsystems/skills.md) | 发布受控业务 Skill，不让草稿混入自动发现目录 |
| UI 使用 React、CSS Modules、共享主题和组件 | [web-styling.md](https://github.com/deepseek-ai/deepseek-harness/blob/22ddee3792402c3e70ec5f86a63c3e3e895a2f60/docs/web-styling.md) | cc 界面沿用上游组织，不先叠另一套组件框架 |
| Node >=24.9.0，pnpm 11.28.5，根版本 0.2.1-rc.3 | [package.json](https://github.com/deepseek-ai/deepseek-harness/blob/22ddee3792402c3e70ec5f86a63c3e3e895a2f60/package.json) | 这些是根清单事实，不证明同名 npm 产物已发布/已验证 |
| MIT；开发预览期可能破坏兼容性 | [README](https://github.com/deepseek-ai/deepseek-harness/blob/22ddee3792402c3e70ec5f86a63c3e3e895a2f60/README.md) / [LICENSE](https://github.com/deepseek-ai/deepseek-harness/blob/22ddee3792402c3e70ec5f86a63c3e3e895a2f60/LICENSE) | 锁版本，保留许可，升级单独验证 |
| Web 入口的反向代理、Host、token/cookie、WS 与 TLS 契约 | [public-deployments.md](https://github.com/deepseek-ai/deepseek-harness/blob/22ddee3792402c3e70ec5f86a63c3e3e895a2f60/docs/user/guide/public-deployments.md) | 公网不能只转发端口就宣称部署安全可用 |

官方文档入口为 [deepseek-harness.github.io/deepseek-harness/](https://deepseek-harness.github.io/deepseek-harness/)。此前探测站点根路径得到 404，不据此判断项目不存在；以固定源码为准。一次 GitHub 插件递归树请求 transport closed，随后通过公开 GitHub API 读取成功；不存在本地运行验证。

## 尚未验证

- cc 欢迎区和运营布局能否全部用现有公开 UI seam 实现。
- npm 发布版本与源码基线是否一致、安装体积、依赖锁和实际构建产物。
- 业务事件接入、受控 Skill Provider、撤销缓存失效与持久化恢复在 cc 组合下的行为。
- DeepSeek Key 的实际 API 调用、模型 ID、工具返回、取消与限额。
- 当前云主机 Node/容器资源、空闲容量、认证/TLS 与运行稳定性。

本轮没有安装、运行、调用模型或部署 Harness。原始调研资料缓存于仓库外；Git 中只保留来源、精确版本和设计映射。版本清单见 [upstream-baseline.json](upstream-baseline.json)，所读资料的内容哈希见 [source-index.json](source-index.json)。
