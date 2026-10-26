import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { ModelBudget } from '../packages/core/budget.ts';
import { createApp } from '../apps/server/app.ts';

test('server-owned runtime policy ignores client overrides and exhausted retries can still read completed receipts', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'cc-budget-policy-api-'));
  const limits = { maxCalls: 1, maxInputTokens: 1000, maxOutputTokens: 100, maxTotalTokens: 1100 };
  const legacy = new ModelBudget(join(dir, 'model-budget.sqlite'), limits);
  legacy.reserve(10, 5);
  legacy.close();
  const origin = 'http://127.0.0.1';
  const app = await createApp({
    dataDir: dir,
    origin,
    password: 'synthetic-password',
    live: true,
    apiKey: 'synthetic-only',
    limits,
    budgetPolicy: { account: 'runtime', period: 'daily' },
  });
  await new Promise<void>((resolve) => app.server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${(app.server.address() as { port: number }).port}`;
  try {
    const login = await fetch(`${url}/api/login`, {
      method: 'POST',
      headers: { origin },
      body: JSON.stringify({ password: 'synthetic-password' }),
    });
    const cookie = login.headers.get('set-cookie')!.split(';')[0];
    const initial = await (await fetch(`${url}/api/status`, { headers: { cookie } })).json();
    assert.equal(initial.budget.used.calls, 0);
    assert.equal(initial.budget.lifetime.calls, 1);
    assert.notEqual(initial.modelState, 'budget_exhausted');
    app.budget.reserve(20, 10);
    for (const scope of ['main', 'other']) {
      const blocked = await fetch(`${url}/api/chat`, {
        method: 'POST',
        headers: { origin, cookie, 'x-cc-workspace': scope, 'x-cc-budget-account': 'new-account' },
        body: JSON.stringify({
          text: 'Synthetic rejected input',
          requestId: `rejected-${scope}`,
          budgetPolicy: { account: 'new-account' },
        }),
      });
      assert.equal(blocked.status, 429);
      assert.equal(app.business.snapshot(scope).sessions.length, 0);
    }
    const conversation = app.store.create('main', 'conversation', {
      title: 'Saved result',
      messages: [],
    });
    app.store.create('main', 'chat-receipt', {
      requestId: 'saved-result',
      conversationId: conversation.id,
      status: 'completed',
      text: '已保存的结果',
    });
    const replay = await fetch(`${url}/api/chat`, {
      method: 'POST',
      headers: { origin, cookie },
      body: JSON.stringify({ text: 'Synthetic retry', requestId: 'saved-result' }),
    });
    assert.equal(replay.status, 200);
    assert.match(await replay.text(), /已保存的结果/);
    assert.equal(app.budget.snapshot().calls, 1);
    assert.equal(app.budget.lifetimeSnapshot().calls, 2);
  } finally {
    await app.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
