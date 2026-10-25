# Server

`main` validates deployment configuration; `createApp` owns HTTP lifecycle, authentication, internal runtime gateway, workers and coordinated checkpoints. `Business` serves scoped learning/task actions and snapshots. `operations` routes bounded domain actions. `Chat` owns durable conversations, replay receipts and native cancellation. `security` and `http` enforce session/origin and safe errors.

Run `pnpm server` after `pnpm build`; default offline. Tests: `tests/api.test.ts`, `chat-cancel.test.ts`, plus domain integration. Credentials and runtime files must remain outside the repository.
