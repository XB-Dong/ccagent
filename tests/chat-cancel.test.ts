import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../apps/server/app.ts';
import type { OperatorRuntime } from '../packages/cc-harness-adapter/runtime.ts';

test('explicit API cancellation is persisted as cancelled and never starts a replacement before close', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'cc-chat-cancel-'));
  const origin = 'http://127.0.0.1';
  const app = await createApp({
    dataDir: dir,
    origin,
    password: 'synthetic-cancel-password',
    live: true,
    apiKey: 'synthetic-only',
    limits: { maxCalls: 6, maxInputTokens: 24000, maxOutputTokens: 4096, maxTotalTokens: 28096 },
  });
  let started!: () => void;
  const running = new Promise<void>((resolve) => {
    started = resolve;
  });
  let rejectRun!: (error: Error) => void;
  const fake = {
    running: false,
    async run() {
      started();
      return await new Promise<never>((_resolve, reject) => {
        rejectRun = reject;
      });
    },
    async close() {
      rejectRun(new Error('closed'));
    },
  } as unknown as OperatorRuntime;
  app.chat.handles.set('main', { scope: 'main', token: 'synthetic-only', runtime: fake });
  await new Promise<void>((resolve) => app.server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${(app.server.address() as { port: number }).port}`;
  try {
    const login = await fetch(`${url}/api/login`, {
      method: 'POST',
      headers: { origin },
      body: JSON.stringify({ password: 'synthetic-cancel-password' }),
    });
    const cookie = login.headers.get('set-cookie')!.split(';')[0];
    const request = fetch(`${url}/api/chat`, {
      method: 'POST',
      headers: { origin, cookie },
      body: JSON.stringify({ text: 'Synthetic cancellation', requestId: 'cancel-1' }),
    }).then((response) => response.text());
    await running;
    await fetch(`${url}/api/cancel`, { method: 'POST', headers: { origin, cookie }, body: '{}' });
    assert.match(await request, /"status":"cancelled"/);
    const rows = app.business.snapshot('main').sessions as unknown as {
      messages: { status?: string }[];
    }[];
    assert.equal(rows[0].messages.at(-1)?.status, 'cancelled');
    assert.equal(app.budget.snapshot().calls, 0);
    app.budget.reserve(1, 4096);
    const status = (await (await fetch(`${url}/api/status`, { headers: { cookie } })).json()) as {
      modelState: string;
    };
    assert.equal(
      status.modelState,
      'budget_exhausted',
      'an exhausted output allowance must be visible',
    );
  } finally {
    await app.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
