import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Store } from '../packages/core/store.ts';
import { createApp } from '../apps/server/app.ts';

test('a restart makes an accepted orphan replayable without reissuing paid work', async () => {
  const directory = mkdtempSync(join(tmpdir(), 'cc-chat-restart-'));
  const seeded = new Store(join(directory, 'business.sqlite'));
  const conversation = seeded.create('main', 'conversation', {
    title: 'Synthetic interrupted request',
    messages: [{ role: 'user', text: 'Synthetic pending message' }],
  });
  seeded.create('main', 'chat-receipt', {
    requestId: 'orphan-request',
    conversationId: conversation.id,
    status: 'accepted',
  });
  seeded.close();
  const origin = 'http://127.0.0.1';
  const app = await createApp({
    dataDir: directory,
    password: 'synthetic-password',
    origin,
    limits: { maxCalls: 1, maxInputTokens: 1000, maxOutputTokens: 100, maxTotalTokens: 1100 },
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
    for (let attempt = 0; attempt < 2; attempt++) {
      const response = await fetch(`${url}/api/chat`, {
        method: 'POST',
        headers: { origin, cookie },
        body: JSON.stringify({ text: 'Synthetic pending message', requestId: 'orphan-request' }),
      });
      assert.equal(response.status, 200);
      const text = await response.text();
      assert.match(text, /"replayed":true/);
      assert.match(text, /"status":"error"/);
      assert.match(text, /中断/);
    }
    const sessions = app.business.snapshot('main').sessions as unknown as { messages: unknown[] }[];
    assert.equal(sessions[0].messages.length, 2);
    assert.equal(app.budget.snapshot().calls, 0);
  } finally {
    await app.close();
    rmSync(directory, { recursive: true, force: true });
  }
});
