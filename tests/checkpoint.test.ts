import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { join, resolve, sep } from 'node:path';
import { tmpdir } from 'node:os';
import { createApp } from '../apps/server/app.ts';
test('application checkpoints remain inside the systemd writable data root', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'cc-checkpoint-'));
  const data = join(dir, 'data');
  const app = await createApp({
    dataDir: data,
    origin: 'http://127.0.0.1',
    password: 'synthetic-checkpoint-password',
    limits: { maxCalls: 6, maxInputTokens: 24000, maxOutputTokens: 4096, maxTotalTokens: 28096 },
  });
  try {
    const point = await app.checkpoint();
    assert.ok(resolve(point.directory).startsWith(resolve(data) + sep));
  } finally {
    await app.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
