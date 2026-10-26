# P0 前置工作上下文地图

## 2026-10-26 · 取消累计测试上限并补完验收

Leader按用户“不再设置测试上限，做完测试”自查冻结此地图。修改`packages/core/budget.ts`支持显式null代表无累计上限，仍逐请求落账；`apps/server/main.ts`解析维护者环境值unlimited，未填写继续原日常保护值，非法值拒绝；`apps/web/api.ts`状态类型兼容null。客户端不能改变政策，网关、工具循环/超时/无自动重试保持。测试账户沿用smoke-20261026-release并保留先前12次，验收结束恢复runtime日常配置。

依赖：`app.ts`只把服务端limits交给预算，`gateway.ts`调用reserve/settle，`recovery.ts`只合并请求行，均不需更改数据结构。先在`tests/budget-unbounded.test.ts`验证旧有12次后仍可预留、usage保留、混合有限维度仍拦截及非法配置fail closed；复用budget-policy/api/gateway/recovery回归。随后补真实经验复用完整自然语言回复和浏览器登录/发消息/历史回读及业务页面导航。浏览器先排查官方工具绑定故障，不把API回放冒作浏览器结果。

风险：明确无上限与漏配/无效数值不可混淆；null不能被比较运算误当0；日常有界行为不能退化。无需数据库迁移，服务器维护配置需备份；所有真实请求与仍未通过项据实记载，普通CI不加载Key。仅补完约定检查，不后台持续调用模型。

## 2026-10-26 · 全面排查、预算隔离与真实公网冒烟

Leader已审阅并冻结本轮范围：基准628b9c0，用户明确要求全面排查并用DeepSeek API冒烟。`packages/core/budget.ts`新增服务端预算账户/北京时间日周期，历史行归legacy；`recovery.ts`迁移及恢复保持账户，不退款历史请求。`apps/server/{main,app,chat}.ts`接入政策与每轮请求上限，`apps/web`如有验收缺陷只修对应行为；部署配置/运维/预算策略同步。相关测试为budget/gateway/recovery/api/ui-status及既有Harness离线集成。先为历史6次耗尽不影响新账户、跨北京时间日界、并发及恢复写行为失败用例，再实现。

本轮真实smoke独立账户`smoke-20261026-release`、终身最多12次/120000输入/6144输出/126144总token，45秒模型超时、0自动重试；包含工具后续轮次、压缩和失败。使用合成材料/独立工作区，公开HTTPS走真实服务与官方Harness。期间服务配置smoke账户；结束后切换runtime日账户，默认100请求/1000000输入/65536输出/1065536总token每日，保留历史账本；日常配置与开发测试上限分开。该默认保护值由Leader据本次恢复使用与有界测试授权设定，不表示用户指定金额，不充值/换Key。

风险：SQLite新列的旧版恢复兼容、UTC+8日界、预算预留跨日结算、异常工具循环、真实SSE/任务持久化、UI发送与历史回读。执行前一致备份，部署固定提交；升级后只允许支持账户的新版本回退，不能用旧全表计数版本误判/覆盖新列。普通回归/独立审核离线；真实用量与未覆盖项如实记录，不以页面打开冒充聊天验收。最多2轮同根因修复，不通过更换测试账户追加额度。

排查中追加修复：`chat.ts`启动恢复孤立accepted回执、不重发模型；截断turn/end不标完整成功；`packages/operations/tasks.ts`暂停学习保留待整理工作；`workspace.css`窄屏保留最近对话入口。对应chat-restart/chat-truncation/tasks测试均保留实际Red/Green；预算策略3项行为Red→Green，恢复/HTTP边界另有回归。收到用户最新单Agent要求后已停止子审核，后续仅Leader执行。

真实测试结束追加：工具落库后额度不足的用户提示在`chat.ts`修复，`tests/chat-budget-end.test.ts`先Red再Green；12次上限不再追加。最终52项离线/26项公网合成通过，经验复用回执partial及浏览器超时在`docs/audit/reports/SMOKE-20261026.zh.md`保留；当前runtime按日可用，历史18次仍在。

## 2026-10-26 · 公网入口与域名指引维护

Leader已审阅：修改`deploy/Caddyfile`、`deploy/service.env.example`及运维/入口说明；新增ADR0006和公网域名步骤。依赖既有Caddy2.11.7、Node鉴权和已授权云主机；不改业务接口/数据库/模型预算，不引入付费资源。先对无业务数据探测页签发可信IP证书，再开启反代与HTTPS Origin；以外网严格证书、401/403、Secure登录、只读预览及预算不变检查验收。云端配置已备份；维持80/443及自动续期进程，旧HTTP隧道不再作为日常入口。仓库检查与Caddy配置验证即可，普通业务测试不因文档变更重复付费。

## 2026-10-26 · 面向 cc 的中文界面与简明说明书

### Files to Modify

| File                                                      | Purpose            | Changes Needed                                                                |
| --------------------------------------------------------- | ------------------ | ----------------------------------------------------------------------------- |
| apps/web/{App,Assistant,Overview,SettingsPage,api}.tsx/ts | 日常入口与服务提示 | 移除技术栈、累计测试额度与整理队列；保留真实不可用状态和处理办法              |
| apps/web/{ReportsPage,KnowledgePage,components}.tsx       | 报表与经验         | 中文字段填写替代 JSON；移除校验哈希、风险代码和来源编号展示，保留底层追踪记录 |
| apps/web/*Page.tsx                                        | 业务页面           | 英文装饰标题、站点/时区选项、指标说明改为中文；接口标识及用户数据不改写       |
| apps/web/HelpPage.tsx, docs/operations/USER-GUIDE.zh.md   | 小白使用说明       | 页面内入口、简短步骤、可下载说明；不泄露密码，不承诺自动操作外部平台          |
| docs/product/{REQUIREMENTS.zh.md,changes/2026-10-26.md}   | 用户需求追踪       | 先追加来源，再同步中文易用性要求                                              |

### Dependencies / Test Files / Reference Patterns

依赖既有鉴权 API、后端预算守卫、报表 mapping 契约、React/Vite 与现有样式。使用类型检查、构建、仓库检查及离线浏览器核验；报表映射改变输入行为，针对预览/确认及可选广告组做行为验证。复用已有表单、下载函数和状态呈现，不引入依赖。

审核修正补充：`SitePicker.tsx` 保留旧站点代码及自定义输入，`display.ts` 集中中文业务标签；`tests/ui-status.test.ts` 覆盖不可用时禁发、指示灯及网络/非 JSON 错误。`apps/server/chat.ts` 仅替换用户可见失败文案。独立审核与处置见[维护审核记录](audit/reviews/UI-20261026.md)。

### Risk Assessment / Review

Leader 已审阅：无数据库迁移、无服务端权限扩展、无付费预算增加。不能用隐藏提示伪装助手可用；输入字段改变后旧预览必须失效。保留必要的业务编码、币种、文件扩展名和完整底层来源，去掉开发展示。真实业务数据权限仍未建立，示例必须清楚标记。发布到现有云服务并验证静态页面/登录/预算账本不变；本轮不调用模型。

日期：2026-10-26｜范围：仓库初始化、规格与计划，不实现产品。

## 2026-10-26 · 用户指定访问密码更新

Leader已审阅：用户明确要求8位访问密码，需要调整`apps/server/security.ts`的最短长度为8，保留scrypt/会话/限流；`tests/auth.test.ts`验证8位登录、短值拒绝及限流。凭据只更新仓库外本机与云端`access.json`，不在源码或文档写密码。发布固定提交并验证新密码登录、旧密码失效，普通检查不调用模型；无数据库迁移。

## Files to Modify

| File                                                 | Purpose                      | Changes Needed                    |
| ---------------------------------------------------- | ---------------------------- | --------------------------------- |
| README.md / CONSTITUTION.md / AGENTS.md              | 入口、长期约束、当前执行规则 | 新建 cc 项目专用内容              |
| P0-PLAN.md / NEXT-WAVES.md                           | P0 提案与后续依赖            | 分开准备状态与实施状态            |
| specs/product.md / specs/acceptance.md               | 需求与验收追踪               | 纳入既有业务及新增自适应要求      |
| specs/architecture.md / specs/adaptive-learning.md   | Harness 扩展与沉淀架构       | 标明复用、扩展和待验证点          |
| specs/contracts/domain.md                            | 状态、数据、错误和幂等契约   | 先定领域约束，不编造上游接口      |
| docs/decisions/ / docs/references/ / docs/discovery/ | 决定、参考依据和待确认项     | 钉住来源版本，保留未知            |
| docs/waves/P0/                                       | 任务包、状态与交接           | 未派发任务不伪填基准 SHA          |
| scripts/verify.py / .github/workflows/verify.yml     | 仓库检查                     | 文档链接、结构、脱敏与记录检查    |
| .gitignore / .gitattributes / .editorconfig          | 仓库卫生                     | 统一 LF，排除凭据、业务数据、缓存 |

## Dependencies (may need updates)

| File                                                           | Relationship                                       |
| -------------------------------------------------------------- | -------------------------------------------------- |
| 外部 AI-CODING-PARADIGM.zh.md v1.0                             | SDD/TDD、任务包、证据和波次交付的方法参考          |
| classroom-annotator @ d31971124cfcbad19e9b56efd54f6f963d618310 | 参考规范组织，不继承旧项目授权、技术栈、凭据、预算 |
| deepseek-harness @ 22ddee3792402c3e70ec5f86a63c3e3e895a2f60    | 指定底座；本轮只读取资料，不安装或启动             |
| 仓库外现有服务器及 DeepSeek 配置                               | 留在原受限路径，后续需要时读取，本轮不连接服务器   |

## Test Files

| Test                | Coverage                                            |
| ------------------- | --------------------------------------------------- |
| scripts/verify.py   | 本轮文档与仓库检查；不证明业务功能已实现            |
| specs/acceptance.md | 后续产品行为、集成、E2E、部署验收设计，当前 not_run |

## Reference Patterns

| File                                              | Pattern                                  |
| ------------------------------------------------- | ---------------------------------------- |
| 参考仓库 CONSTITUTION.md / AGENTS.md              | 中文审阅资料、英文执行指令；明确现行规则 |
| 参考仓库 specs/ / docs/waves/                     | 契约单写、任务交接、状态与原始证据分离   |
| Harness docs/architecture.md                      | profile / bundle / plugin 扩展           |
| Harness docs/subsystems/compaction.md / skills.md | 复用原生会话压缩与 Skill seam            |

## Risk Assessment

- [ ] 本轮改变公共 API：没有产品 API，领域契约是草案。
- [ ] 本轮数据库迁移：无。
- [x] 本轮配置变化：新建仓库规范与仅文档验证 CI。
- [x] 未来风险：上游预览版兼容性、业务数据许可、经验误泛化、外部写入副作用。

## Review

Leader 已核对当前目录为空、无祖先 AGENTS.md；确认上述文件仅支撑本轮前置工作。
本次为作者自查，不宣称独立审核通过。实施前需先完成 P0 R0 技术验证与契约冻结。

## 2026-10-26 补充 · DeepSeek 额度节约

用户追加研发成本约束。修改范围为宪法、AGENTS、P0 计划、验收矩阵、Foundation/Acceptance 任务包和 state；新增统一额度策略与 ADR 0003。依赖是未来模型调用适配器与测试分层，当前只更新文档，不实现预算拦截器。
作者已核对：普通测试离线与必要真实 API 验收可以并存；不删真实联调门槛，不混入 cc 业务需求。本次通过仓库检查验证，不调用 DeepSeek。

## 2026-10-26 补充 · 技术栈说明与六项目调研

用户要求说明现有技术栈/存储，并谨慎评估六个参考项目。修改范围：架构中的选型与存储说明、业务需求候选补充、当日追加记录、后续波次提示与 README；新增调研结论及来源索引。原有 11 项需求及版本保留，新增建议明确为候选，不改变 P0 强制范围。
依赖：固定 Harness 持久化文档、六仓库 README 与选定源码、Amazon/SQLite 官方资料。作者已复核业务需求与技术选型的界线；只做文档与来源读取，不运行外部项目，不增加模型/数据服务。校验使用现有仓库检查，不需要产品测试。

## 2026-10-26 补充 · 连续波次与最终统一验收

用户明确要求统一 P1/P2/P3，P0 后由 Leader 自主决定推进；每波先生成类似 P0 的计划，不经人工逐波审批，最终交完整项目和 report。本次只更新已有文档与状态，不启动开发。
修改范围：CONSTITUTION、AGENTS、NEXT-WAVES、P0-PLAN、README、验收说明、P0 Release 任务/交接及 ADR 0001；state 同步持久化推进政策。历史报告/事件不改写，业务需求正文不变。
作者已核对旧“报告后停止、用户决定下一波”与新授权冲突，改为“每波报告与就绪判断后自主推进”；预算、外部权限及真实依赖仍单独遵守。现有仓库检查足以验证本轮文档变更。

## 2026-10-26 启动 · P0/R0

用户已明确启动全栈开发。R0 修改范围：当前授权/state、Foundation 任务包、依赖清单/锁文件、`packages/cc-harness-adapter/` 与其测试、运行配置和验证脚本。先在仓库外安装固定官方 Harness 产物、读取官方扩展契约并验证 UI/工具/持久化 seam；不在未知接口上编写业务实现。
依赖为固定上游 0.2.1-rc.3 与源码基线、现有受限配置和合成数据；核心 TDD 首先覆盖额度守卫、配置和安全工具边界。基础探针允许只读复查已授权云主机，SSH 指纹先于密码认证核对。当前地图经 Leader 自查，独立审核状态仍未运行。

### R0 接口确认后的实现路径

`packages/core/`（SQLite、额度）、`packages/learning/`（来源/反馈/记忆/Skill）、`packages/cc-harness-adapter/`（官方 SDK/overlay/受控插件）、`apps/server/`（鉴权/API/有界学习队列）、`apps/web/`（React 工作台）、`tests/`（领域/权限/集成）。Leader 单写共享契约、依赖、状态和发布配置。依赖 `specs/contracts/runtime-v0.2.md`；已审阅风险为 SQLite 迁移、scope 隔离、运行时预算、会话删除与恢复。原有参考模式不变。

### R1 后续上下文容量复查

修改 `apps/server/business.ts` 的模型投影、`packages/cc-harness-adapter/profile.ts` 的上下文容量、`scripts/live-probe.ts` 的账本主机守卫；测试位于 `tests/context-bounds.test.ts` 与既有原生 Harness 集成。依赖仍为 Store/Learning 和原生压缩。保留完整业务数据，只分页/限制模型侧投影，避免增长后一次工具结果耗尽输入容量。云端接管预算后，本机旧账本不得用于再次付费。Leader 已审阅：无数据库迁移，工具读取新增可选分页参数，付费上限不变。

### P1 活动与报表

修改/新增 `packages/operations/{time,activities,csv,reports}.ts`、`apps/server/{business,app}.ts`、`apps/web/{App,api,ActivitiesPage,ReportsPage}.tsx`，测试 `tests/{activity,reports}.test.ts`。复用 Store/CAS/once 和 Tasks 状态，不建立外部平台适配器。活动阶段与到期提醒持久化，CSV 仅支持冻结的规范列。Leader 已审阅：既有通用实体表容纳新 kind，无 schema 迁移；新增受控 action，不变更付费限额；严格时间与重复导入是主要风险。

### P2 库存/发货

新增 forecast/inventory/allocation/shipping 领域模块及 InventoryPage/ShippingPage，依赖P1规范reportKind及严格日期。测试 inventory/shipping，复用Store短事务与CAS。Business负责受控输入，领域重新校验数量/引用/状态，API不信任UI。Leader已审阅：无DDL迁移，主要风险为重复扣预留、缺日当0、池超配、发运后错误返还及数量越界；先留失败行为测试。

### P3 广告与最终交付

新增advertising.ts/AdvertisingPage及其测试，复用Reports规范批次与csvCell；接入operations/API/App，更新发布/使用/证据矩阵。恢复脚本复用既有recovery/ops。Leader已审阅：零分母、混币种、归因窗口和缺成本主要风险；不执行广告写入、不增加付费额度。无DDL迁移。所有发布时间/HTTPS/真实模型证据独立标注。
