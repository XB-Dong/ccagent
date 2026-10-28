# P0 前置工作上下文地图

## 2026-10-28 · 公开仓库隐私清理

用户授权处理公开审查发现。Leader 自审冻结：README/部署示例/运维与历史报告使用示例地址及通用目录；业务需求移除私人背景，保留中性功能目标；真实反馈关联移到仓库外私有运维索引，公开文档只留匿名引用；提交邮箱使用项目隐私邮箱；添加MIT许可证、公开发布说明及防回流检查。改写在隔离镜像中完成，原历史和映射受限保存在仓库外，校验所有分支与工作树后只更新已核对的引用。依赖现有88离线、仓库校验及新的脱敏检查；不修改生产服务、数据或访问凭据，不调用模型。历史SHA变化不代表重新发布，旧部署与新提交映射由维护者私下保存。GitHub只读PR内部引用及缓存不由普通分支改写清除，剩余情况据实报告。

## 2026-10-28 · P4.2 发布结案与合并 main

用户明确要求合并 main。Leader 已核对 e5a01ac 固定发布、49文件备份/隔离恢复、14项 main 业务载荷与配置保留、严格公网HTTPS/原密码/静态资源一致证据。自审通过：仅同步 README、P4/P4.2 状态、验收、报告和证据索引及仓库外交接；不改业务实现。依赖已通过的88离线/独立审核/本地GPT Chrome点击验收，最新发布两项CI成功；公网最后一次可选画面读取因物理Esc停止，保留事实，不影响已完成的本地浏览器和公网API验证。先提交结案记录并验证，再按精确head依序合并PR#2（P4.1）与PR#3（P4.2），保留合并历史、校验main CI及树一致，只快进本地主分支。原反馈在交付核对时已删除并有tombstone，不复活或标accepted；后续新反馈留待下一轮评估，本次不扩需求。无新数据库迁移、权限或配置变更，无新增模型调用。

## 2026-10-28 · P4.2 续跑与收束

Leader 自审：用户要求收束 P4.2，随后指定 GPT Chrome 补测。通过当前 Computer Use 正常读取该浏览器并实际点击本地合成实例，已验证日期归组、时区切换、全部记录、编辑保存、完成及归组时输入保留、未知日期末尾；无需豁免这些已补验项目。接下来只更新 USER-GUIDE.zh.md（由 HelpPage 原样导入）、README、P4/P4.2 状态/验收、报告和证据索引；不再修改任务实现、API、数据库或模型。依赖原88离线/23独立审核、当前生产P4.1固定版本、既有 pinned SSH/备份/产物发布流程。验证本次说明书构建/仓库检查、精确提交 CI、固定包、发布前备份、HTTPS鉴权健康与数据保留；不重复无关付费调用。手机布局没有实际设备验收，保留界限。原工具失败记录按历史保留。

## 2026-10-28 · P4.2 任务按创建日期归组

本轮只读检查生产 main：新增一条任务清单按创建日期归组的反馈；P4.1 两条已交付反馈内容哈希未变，撤回项不采纳。Leader 将新建议解释为任务清单展示归组，不改既有工作日历的完成日期口径。地图自审冻结后才派发。

| 文件 | 职责与修改 |
| --- | --- |
| apps/web/TasksPage.tsx、task-groups.ts、p42-tasks.css | 单开发 Agent：按 createdAt 在明确查看时区归组，日期新到旧；保留状态筛选和所有任务操作 |
| tests/task-groups.test.ts | 行为 Red/Green：跨日/时区、Rome 夏令时、完成/编辑不改创建归属、组内实际时刻排序、无有效日期独立归组、不修改原数据 |
| docs/product/changes/2026-10-28.md、REQUIREMENTS.zh.md | Leader 先日期采纳再更新 CC-TASK-001 版本2，保留版本1 |
| P4.2-PLAN.md、specs/contracts/p42-v1.md、docs/waves/P4.2/、P4/state.json | Leader 计划/冻结/精确派发基准、验收、状态、独立审核和报告 |
| README.md、USER-GUIDE、报告及索引 | Leader 说明创建归组与完成日历的区别，精确发布版本与真实证据 |

依赖 Task.createdAt（服务端创建后不可改）、既有 calendarDay/timeZones、TaskForm/ActualMinutesForm、Snapshot；不改接口、数据库、模型提示/工具或权限。不能用 dueAt、updatedAt、completedAt 替代创建日期，未知日期单列。单开发 worktree 隔离，另设只读审核，Leader 集成与发布；无多写者冲突。纯展示变更不需要新增 DeepSeek 请求，必要测试无累计额度上限但不做无意义付费。验证为相关行为/全离线、类型/构建、实际浏览器、精确 CI、既有主机备份/固定产物发布和回退准备。Windows 界面改用当前 Computer Use 工具，原 CUA 不可用不冒称已操作。

## 2026-10-27 · P4.1 日常任务、工作日历和学习笔记

Leader 于首次定时检查只读读取生产 main 反馈：2 条有效、1 条撤回；本轮采纳清晰的任务编辑、意大利时区/起止选择、完成记录日历和独立学习笔记。已核对最新补验关闭历史公网/浏览器缺口；不修改旧 P0–P3 状态。地图经 Leader 自审冻结。

| 修改文件 | 职责与依赖 |
| --- | --- |
| packages/operations/tasks.ts、task-time.ts、time.ts | 任务编辑/显式时刻校验、完成时间和人工实际分钟；旧 dueAt 兼容 |
| packages/learning/service.ts Task 类型 | Leader 单写新增可选 startAt/endAt/completedAt/actualMinutes，沿用 JSON 实体无需 SQL 迁移 |
| apps/web/TasksPage.tsx、TaskForm.tsx、WorkCalendarPage.tsx、task-time.ts、display.ts、p41-tasks.css | 一位 UI Agent 单写；中文表单、时区转换与工作记录，不编辑共享 App/api |
| packages/operations/notes.ts、note-types.ts、apps/web/NotesPage.tsx、p41-notes.css | 一位笔记 Agent 单写；手动学习记录独立于记忆/Skill，不进入模型上下文 |
| apps/server/business.ts、apps/web/App.tsx、api.ts | Leader 集成领域动作、快照、导航和错误提示，维持鉴权/范围/修订 |
| tests/task-edit.test.ts、task-time.test.ts、notes.test.ts、p41-api.test.ts | 分别覆盖领域、夏令时/转换、笔记与实际 HTTP/重启持久化 |
| docs/product/changes/2026-10-27.md、REQUIREMENTS.zh.md、P4.1-PLAN.md、specs/contracts/p41-v1.md、docs/waves/P4.1/ | 先日期采纳，再计划/规格/任务/验收/状态与报告 |

复用 Store 乐观锁、隐私删除、任务状态与现有 CSS。并行作者必须独立 worktree，以精确冻结 SHA 为基准；Leader 单写契约/集成。先领域行为 Red 再 Green，旧 55 测试回归、类型/构建、浏览器和必要真实模型联调；日历计划时长不能伪作实际，未知完成日不臆造。风险为夏令时歧义、旧数据保留、已成功流程被编辑污染、重复完成派生经验和笔记删除恢复；已纳入契约与审核。仅合成测试，不新增业务数据许可或外部平台写入。

## 2026-10-26 · 必要测试不设 API 消耗额度限制

用户再次明确必要测试不设置 DeepSeek API 额度消耗限制。Leader 自查冻结：同步 AGENTS.md、CONSTITUTION.md、docs/testing/deepseek-budget.md、docs/waves/P4/README.md 和现有定时任务 cc-p4-x，明确费用、请求数、输入/输出/总 token 的累计额度均不作为必要测试的停止条件，也不按日期、波次或 Agent 另设小额度。保留离线优先、真实用量、超时/循环保护和日常 runtime 独立政策；只改研发规则与定时提示，不改业务需求或线上应用。验证采用仓库检查、diff 与定时配置回读，无需真实模型调用。

## 2026-10-26 · 凌晨建议检查与 P4.x 持续迭代

Leader 已自查并冻结本次配置范围：用户明确要求每天北京时间 01:00 检查 cc 建议，先计划再按规范多 Agent 开发，以 P4.1、P4.2 递增。本次仅沉淀规则并创建当前聊天的定时任务，首轮业务实施留待定时触发。

| Files to Modify | Purpose / Changes Needed |
| --- | --- |
| AGENTS.md / CONSTITUTION.md | 记录本次对每日迭代的多 Agent 授权与 Leader 需求分流权限，明确覆盖此前单 Agent 限制的范围 |
| NEXT-WAVES.md / docs/waves/P4/README.md / docs/waves/P4/state.json | 每日流程、顺序编号、续跑/去重、计划工件和报告，初始化待检查状态而非虚构 P4.1 已执行 |
| docs/product/changes/2026-10-26.md / REQUIREMENTS.zh.md | 先追加授权来源，再同步 CC-FEEDBACK-001 版本 2；不将开发编排混入业务需求 |
| README.md / docs/product/changes/README.md | 更新导航和授权说明，保持需求与工程规则分开 |
| 当前聊天定时任务（仓库外） | 每日 01:00 Asia/Shanghai，附带现行规则与项目绝对路径，不改云端定时器 |

依赖：已有 P0–P3 计划、最新补验报告、受限运维索引与 main 工作区只读反馈读取脚本；历史 state 的旧发布缺口必须结合最新证据核对，不抹改历史。原始反馈仅保留仓库外；无需业务代码、接口或数据库改动。验证使用 scripts/verify.py、Markdown/JSON 格式检查、diff 和定时任务回读，不调用 DeepSeek、不新开审核 Agent。风险为重复波次、并行写入冲突、撤回项被误采纳、未经授权外部写入；由串行领队、来源修订去重、工作树隔离与既有权限边界约束。地图已由 Leader 审阅，可执行本次文档和定时配置。

## 2026-10-26 · 更新项目入口并合并main

用户明确要求合并到main并更新README。Leader自查冻结：只修改`README.md`与本地图，按当前已验证事实整理功能、使用入口、技术结构、本地启动、55项离线及真实/浏览器验收、日常与测试额度区别、文档导航和未接入范围。链接依赖既有补验报告、使用/运维说明、package.json、vite.config.ts和服务启动配置；不改业务需求、应用代码、云端配置或运行数据。

验证采用`python scripts/verify.py`与diff检查，精确提交GitHub CI通过后把PR#1转为待审并按固定head SHA合并main，保留提交历史；随后确认远端main内容、合并状态与main CI，快进本地主分支。不使用子Agent，不调用DeepSeek，不因文档更新重新部署服务。需要保留服务器运行源码8a63477与后续Git文档/合并提交的区别。

## 2026-10-26 · 取消累计测试上限并补完验收

Leader按用户“不再设置测试上限，做完测试”自查冻结此地图。修改`packages/core/budget.ts`支持显式null代表无累计上限，仍逐请求落账；`apps/server/main.ts`解析维护者环境值unlimited，未填写继续原日常保护值，非法值拒绝；`apps/web/api.ts`状态类型兼容null。客户端不能改变政策，网关、工具循环/超时/无自动重试保持。测试账户沿用smoke-20261026-release并保留先前12次，验收结束恢复runtime日常配置。

依赖：`app.ts`只把服务端limits交给预算，`gateway.ts`调用reserve/settle，`recovery.ts`只合并请求行，均不需更改数据结构。先在`tests/budget-unbounded.test.ts`验证旧有12次后仍可预留、usage保留、混合有限维度仍拦截及非法配置fail closed；复用budget-policy/api/gateway/recovery回归。随后补真实经验复用完整自然语言回复和浏览器登录/发消息/历史回读及业务页面导航。浏览器先排查官方工具绑定故障，不把API回放冒作浏览器结果。

风险：明确无上限与漏配/无效数值不可混淆；null不能被比较运算误当0；日常有界行为不能退化。无需数据库迁移，服务器维护配置需备份；所有真实请求与仍未通过项据实记载，普通CI不加载Key。仅补完约定检查，不后台持续调用模型。

结案：55项离线通过，真实经验复用最终回复及浏览器实际操作两项遗留已补齐，本次新增5次，原测试账户累计17次不清零；37文件云隔离恢复及日常重启后原密码登录通过。当前应用8a63477，实际结果/截图/用量见`docs/audit/reports/SMOKE-COMPLETION-20261026.zh.md`，原partial报告和证据原样保留。

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
