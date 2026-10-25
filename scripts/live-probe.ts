import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { parseEnv } from 'node:util';
import { resolve, join } from 'node:path';
import { createApp } from '../apps/server/app.ts';
import { randomUUID } from 'node:crypto';

if (!process.argv.includes('--live')) {
  console.log('Live probe disabled. Use --live only within the recorded project budget.');
  process.exit(0);
}
const support = resolve('../.ccagent-support');
if (existsSync(join(support, 'cloud-budget-authority.json')))
  throw new Error('MODEL_BUDGET_OWNED_BY_CLOUD');
const secretPath = process.env.CC_MODEL_ENV_FILE;
if (!secretPath) throw new Error('MODEL_ENV_FILE_REQUIRED');
const secret = parseEnv(readFileSync(secretPath, 'utf-8'));
if (!secret.DEEPSEEK_API_KEY || secret.DEEPSEEK_BASE_URL !== 'https://api.deepseek.com')
  throw new Error('MODEL_CONFIGURATION_INVALID');
const app = await createApp({
  dataDir: join(support, 'live-probe'),
  budgetPath: join(support, 'p0-model-budget.sqlite'),
  password: 'synthetic-probe-password',
  origin: 'http://127.0.0.1',
  live: true,
  apiKey: secret.DEEPSEEK_API_KEY,
  limits: { maxCalls: 6, maxInputTokens: 24000, maxOutputTokens: 4096, maxTotalTokens: 28096 },
});
const startedAt = new Date().toISOString();
try {
  const scope = 'synthetic-r0';
  const id = randomUUID();
  const source = app.business.capture.enqueue(
    scope,
    '请用工具读取当前任务，仅用一句中文报告任务标题。不要创建或修改记录。',
    id,
  );
  app.business.tasks.create(scope, 'live-synthetic-task', {
    title: '合成验收：美站活动准备',
    timeZone: 'America/Los_Angeles',
    checklist: ['核对时区', '检查优惠生效'],
    sourceId: source.id,
    confirmed: true,
  });
  const handle = app.chat.handle(scope);
  handle.sourceId = source.id;
  const result = await handle.runtime.run(source.text);
  const record = {
    startedAt,
    completedAt: new Date().toISOString(),
    upstreamVersion: '0.2.1-rc.3',
    requestModel: 'deepseek-flash',
    fixture: 'synthetic-only',
    budget: app.budget.snapshot(),
    finalResponse: result.finalResponse,
    events: result.events,
  };
  const directory = join(support, 'evidence/P0/R0');
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, `live-${Date.now()}.json`), JSON.stringify(record, null, 2));
  console.log(
    JSON.stringify({
      finalResponse: result.finalResponse,
      eventTypes: [...new Set(result.events.map((event) => event.type))],
      budget: app.budget.snapshot(),
    }),
  );
  if (!result.finalResponse || !JSON.stringify(result.events).includes('cc_list_tasks'))
    process.exitCode = 1;
} finally {
  await app.close();
}
