import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../apps/server/app.ts';

test('authenticated API enforces origin, scope, offline persistence and no ambient tool access', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'cc-api-'));
  const origin = 'http://127.0.0.1:4310';
  const app = await createApp({
    dataDir: dir,
    origin,
    password: 'synthetic-test-password',
    limits: { maxCalls: 6, maxInputTokens: 24000, maxOutputTokens: 4096, maxTotalTokens: 28096 },
  });
  await new Promise<void>((resolve) => app.server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${(app.server.address() as { port: number }).port}`;
  try {
    assert.equal((await fetch(`${url}/api/snapshot`)).status, 401);
    assert.equal((await fetch(`${url}/api/login`, { method: 'POST', body: '{}' })).status, 403);
    const login = await fetch(`${url}/api/login`, {
      method: 'POST',
      headers: { origin },
      body: JSON.stringify({ password: 'synthetic-test-password' }),
    });
    const cookie = login.headers.get('set-cookie')!.split(';')[0];
    const post = (path: string, body: object, scope = 'a') =>
      fetch(`${url}${path}`, {
        method: 'POST',
        headers: { origin, cookie, 'x-cc-workspace': scope },
        body: JSON.stringify(body),
      });
    const feedback = (await (
      await post('/api/actions/feedback', { text: '这个页面不好用', requestId: 'source-a' })
    ).json()) as { id: string };
    assert.equal((await post('/api/actions/delete', { id: feedback.id }, 'b')).status, 404);
    assert.equal((await post('/api/actions/shell', {})).status, 404);
    assert.equal(
      (
        await post('/api/actions/feedback', {
          text: `password=${'x'.repeat(24)}`,
          requestId: 'sensitive',
        })
      ).status,
      400,
    );
    const chat = await post('/api/chat', { text: '希望增加快捷入口', requestId: 'chat-a' });
    assert.match(await chat.text(), /offline/);
    const repeated = await post('/api/chat', { text: '希望增加快捷入口', requestId: 'chat-a' });
    assert.match(await repeated.text(), /"replayed":true/);
    const snap = (await (
      await fetch(`${url}/api/snapshot`, { headers: { cookie, 'x-cc-workspace': 'a' } })
    ).json()) as { feedback: unknown[]; sessions: unknown[] };
    assert.equal(snap.feedback.length, 2);
    assert.equal(snap.sessions.length, 1);
    assert.equal(app.budget.snapshot().calls, 0);
    const taskResponse = await post('/api/actions/task', {
      title: 'Check status retention',
      timeZone: 'Asia/Shanghai',
      checklist: ['Check one'],
      requestId: 'api-task',
    });
    const task = (await taskResponse.json()) as { id: string; revision: number };
    const updated = (await (
      await post('/api/actions/task-update', {
        id: task.id,
        revision: task.revision,
        checked: [true],
      })
    ).json()) as { status: string };
    assert.equal(
      updated.status,
      'open',
      'checking an item must preserve the task status through HTTP',
    );
  } finally {
    await app.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
