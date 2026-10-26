import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../apps/server/app.ts';
import type { OperatorRuntime } from '../packages/cc-harness-adapter/runtime.ts';

test('a token-truncated assistant reply keeps its text but is never presented as completed', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'cc-truncated-'));
  const origin = 'http://127.0.0.1';
  const app = await createApp({
    dataDir: dir,
    password: 'synthetic-password',
    origin,
    live: true,
    apiKey: 'synthetic-only',
    limits: { maxCalls: 2, maxInputTokens: 1000, maxOutputTokens: 100, maxTotalTokens: 1100 },
  });
  const runtime = {
    running: false,
    async close() {},
    async run() {
      return {
        sessionId: 'synthetic-session',
        finalResponse: '这里是尚未写完的建议',
        notifications: [],
        events: [{ type: 'turn/end', data: { reason: { kind: 'max-tokens' } } }],
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
      body: JSON.stringify({ text: 'Synthetic long answer', requestId: 'truncation' }),
    });
    const result = await response.text();
    assert.match(result, /这里是尚未写完的建议/);
    assert.match(result, /"status":"error"/);
    assert.match(result, /继续/);
    assert.ok(app.chat.lastFailure);
    assert.equal(app.chat.lastSuccess, undefined);
  } finally {
    await app.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
