# 应用入口

`server/main.ts` 加载受限运行配置，提供认证、业务 API、SSE 对话与静态前端；`web/` 是 React 工作台。领域规则不放在页面中，原生 Harness 组合在 `packages/cc-harness-adapter`。

`pnpm check` 验证类型；`pnpm build` 生成 `dist/`；`pnpm server` 运行已构建应用。首次密码保存在仓库外 `CC_DATA_DIR/access.json`，模型默认关闭。不要把本地测试密码用于部署。
