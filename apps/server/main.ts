import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { randomBytes } from 'node:crypto';
import { join, resolve } from 'node:path';
import { createApp } from './app.ts';

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
  limits: {
    maxCalls: Number(process.env.CC_MAX_CALLS ?? 6),
    maxInputTokens: Number(process.env.CC_MAX_INPUT_TOKENS ?? 24000),
    maxOutputTokens: Number(process.env.CC_MAX_OUTPUT_TOKENS ?? 4096),
    maxTotalTokens: Number(process.env.CC_MAX_TOTAL_TOKENS ?? 28096),
  },
});
app.server.listen(port, host, () =>
  console.log(JSON.stringify({ service: 'ccagent', origin, live: app.chat.live, dataDir })),
);
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () => {
    void app.close().then(() => process.exit(0));
  });
