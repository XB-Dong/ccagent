import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../apps/server/app.ts';
import type { OperatorRuntime } from '../packages/cc-harness-adapter/runtime.ts';

test('a tool turn ending at its budget limit explains the limit and retains its saved draft', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'cc-budget-end-'));
  const origin = 'http://127.0.0.1';
  const app = await createApp({
    dataDir: dir,
    password: 'synthetic-password',
    origin,
    live: true,
    apiKey: 'synthetic-only',
    limits: { maxCalls: 1, maxInputTokens: 1000, maxOutputTokens: 100, maxTotalTokens: 1100 },
  });
  const runtime = {
    running: false,
    async close() {},
    async run() {
      const id = app.budget.reserve(10, 10);
      app.budget.settle(id, { inputTokens: 10, outputTokens: 10 });
      app.business.tool('main', app.chat.handles.get('main')!.sourceId, 'prepare_task', {
        title: 'Saved before budget end',
        timeZone: 'Asia/Shanghai',
        checklist: ['Verify'],
      });
      return {
        sessionId: 'synthetic-session',
        finalResponse: '',
        notifications: [],
        events: [{ type: 'turn/end', data: { reason: { kind: 'error' } } }],
      };
    },
  } as unknown as OperatorRuntime;
  app.chat.handles.set('main', { scope: 'main', token: 'synthetic-only', runtime });
  await new Promise<void>((resolve) => app.server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${(app.server.address() as { port: number }).port}`;
  try {
    const login = await fetch(`${url}/api/login`, {
      method: 'POST',
      headers: { origin },
      body: JSON.stringify({ password: 'synthetic-password' }),
    });
    const cookie = login.headers.get('set-cookie')!.split(';')[0];
    const response = await fetch(`${url}/api/chat`, {
      method: 'POST',
      headers: { origin, cookie },
      body: JSON.stringify({ text: 'Save a synthetic checklist', requestId: 'budget-end' }),
    });
    const result = await response.text();
    assert.match(result, /使用已达上限/);
    assert.match(result, /任务清单/);
    assert.match(result, /"status":"error"/);
    assert.equal(app.business.snapshot('main').tasks.length, 1);
    assert.equal(app.budget.snapshot().calls, 1);
    assert.equal(app.chat.lastSuccess, undefined);
  } finally {
    await app.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
