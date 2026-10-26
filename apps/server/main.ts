import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { join, resolve } from 'node:path';
import { createApp } from './app.ts';
import { parseBudgetLimit, type BudgetPolicy } from '../../packages/core/budget.ts';

const dataDir = resolve(process.env.CC_DATA_DIR ?? '../.ccagent-support/product-data');
mkdirSync(dataDir, { recursive: true });
const accessFile = join(dataDir, 'access.json');
if (!existsSync(accessFile) && !process.env.CC_AUTH_PASSWORD)
  writeFileSync(accessFile, JSON.stringify({ password: randomBytes(24).toString('base64url') }), {
    mode: 0o600,
  });
const password =
  process.env.CC_AUTH_PASSWORD ?? JSON.parse(readFileSync(accessFile, 'utf-8')).password;
const port = Number(process.env.PORT ?? 4310);
const host = process.env.HOST ?? '127.0.0.1';
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('INVALID_PORT');
const origin = process.env.CC_ORIGIN ?? `http://127.0.0.1:${port}`;
if (host !== '127.0.0.1' && !origin.startsWith('https://'))
  throw new Error('PUBLIC_HTTPS_REQUIRED');
const app = await createApp({
  dataDir,
  password,
  origin,
  secure: origin.startsWith('https://'),
  apiKey: process.env.DEEPSEEK_API_KEY,
  live: process.env.CC_MODEL_LIVE === '1',
  budgetPath: process.env.CC_BUDGET_PATH,
  budgetPolicy: {
    account: process.env.CC_BUDGET_ACCOUNT ?? 'runtime',
    period: (process.env.CC_BUDGET_PERIOD ?? 'daily') as BudgetPolicy['period'],
  },
  limits: {
    maxCalls: parseBudgetLimit(process.env.CC_MAX_CALLS, 100),
    maxInputTokens: parseBudgetLimit(process.env.CC_MAX_INPUT_TOKENS, 1000000),
    maxOutputTokens: parseBudgetLimit(process.env.CC_MAX_OUTPUT_TOKENS, 65536),
    maxTotalTokens: parseBudgetLimit(process.env.CC_MAX_TOTAL_TOKENS, 1065536),
  },
});
app.server.listen(port, host, () =>
  console.log(JSON.stringify({ service: 'ccagent', origin, live: app.chat.live, dataDir })),
);
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () => {
    void app.close().then(() => process.exit(0));
  });
