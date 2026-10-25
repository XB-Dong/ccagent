import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { OperatorRuntime } from '../packages/cc-harness-adapter/runtime.ts';

test(
  'official runtime cancellation closes a hanging model request without retry',
  { timeout: 15000 },
  async () => {
    const dir = mkdtempSync(join(tmpdir(), 'cc-cancel-'));
    let resolveStarted!: () => void;
    const started = new Promise<void>((resolve) => {
      resolveStarted = resolve;
    });
    let calls = 0;
    const server = createServer(async (req, res) => {
      for await (const _chunk of req) {
        /* Drain synthetic request. */
      }
      if (req.url?.startsWith('/tools/')) {
        res.setHeader('content-type', 'application/json');
        res.end('[]');
        return;
      }
      calls++;
      resolveStarted();
      res.writeHead(200, { 'content-type': 'text/event-stream' });
      res.write(': deliberately stalled\n\n');
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const url = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
    const runtime = new OperatorRuntime(dir, 'a', url, 'fake-only', url);
    try {
      const result = runtime.run('Synthetic timeout probe.').then(
        () => false,
        () => true,
      );
      await started;
      await runtime.close();
      assert.equal(await result, true);
      assert.equal(calls, 1);
    } finally {
      await runtime.close();
      server.closeAllConnections();
      await new Promise<void>((resolve) => server.close(() => resolve()));
      rmSync(dir, { recursive: true, force: true });
    }
  },
);
