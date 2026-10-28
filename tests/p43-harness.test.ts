import assert from 'node:assert/strict';
import test from 'node:test';
import { createServer } from 'node:http';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { OperatorRuntime } from '../packages/cc-harness-adapter/runtime.ts';
import { Store } from '../packages/core/store.ts';
import { Business } from '../apps/server/business.ts';

test(
  'official Harness dispatches scoped task detail and copy tools with bounded confirmation offline',
  { timeout: 45000 },
  async () => {
    const dir = mkdtempSync(join(tmpdir(), 'cc-p43-harness-'));
    const store = new Store(join(dir, 'business.sqlite'));
    const business = new Business(store, dir);
    const source = store.source('synthetic', 'Copy ItemA+1 as ItemB');
    const original = business.mutate('synthetic', 'task', {
      requestId: 'original',
      title: 'ItemA+1 test',
      timeZone: 'Asia/Shanghai',
      checklist: Array.from({ length: 30 }, () => 'Check ItemA+1 ' + '中'.repeat(280)),
    }) as any;
    const executed: string[] = [];
    const advertised: string[][] = [];
    let turns = 0;
    const server = createServer(async (req, res) => {
      let raw = '';
      for await (const chunk of req) raw += chunk;
      const body = JSON.parse(raw || '{}');
      if (req.url?.startsWith('/tools/')) {
        const action = req.url.slice('/tools/'.length);
        executed.push(action);
        try {
          const result = business.tool('synthetic', source.id, action, body);
          assert.ok(Buffer.byteLength(JSON.stringify(result)) <= 6000);
          res.setHeader('content-type', 'application/json');
          res.end(JSON.stringify(result));
        } catch (error) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: String(error) }));
        }
        return;
      }
      advertised.push((body.tools ?? []).map((tool: { name: string }) => tool.name));
      const turn = turns++;
      const name = turn === 0 ? 'cc_get_task' : turn === 1 ? 'cc_copy_task' : undefined;
      const args =
        turn === 0
          ? { taskId: original.id }
          : { taskId: original.id, revision: 1, replaceFrom: 'ItemA+1', replaceTo: 'ItemB' };
      res.writeHead(200, { 'content-type': 'text/event-stream' });
      const send = (type: string, data: object) =>
        res.write(`event: ${type}\ndata: ${JSON.stringify({ type, ...data })}\n\n`);
      send('message_start', {
        message: {
          id: `fake-${turn}`,
          type: 'message',
          role: 'assistant',
          content: [],
          model: body.model,
          stop_reason: null,
          usage: { input_tokens: 20, output_tokens: 0 },
        },
      });
      if (name) {
        send('content_block_start', {
          index: 0,
          content_block: { type: 'tool_use', id: `call-${turn}`, name, input: {} },
        });
        send('content_block_delta', {
          index: 0,
          delta: { type: 'input_json_delta', partial_json: JSON.stringify(args) },
        });
      } else {
        send('content_block_start', { index: 0, content_block: { type: 'text', text: '' } });
        send('content_block_delta', {
          index: 0,
          delta: { type: 'text_delta', text: '已复制为待确认任务，原任务保留。' },
        });
      }
      send('content_block_stop', { index: 0 });
      send('message_delta', {
        delta: { stop_reason: name ? 'tool_use' : 'end_turn', stop_sequence: null },
        usage: { output_tokens: 10 },
      });
      send('message_stop', {});
      res.end();
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const url = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
    const runtime = new OperatorRuntime(dir, 'synthetic', url, 'synthetic-only', url);
    try {
      const result = await runtime.run(
        'Copy the synthetic task using literal identifier replacement.',
      );
      assert.equal(result.finalResponse, '已复制为待确认任务，原任务保留。');
      assert.ok(advertised[0].includes('cc_get_task'));
      assert.ok(advertised[0].includes('cc_copy_task'));
      assert.ok(executed.includes('get_task'));
      assert.ok(executed.includes('copy_task'));
      const copies = store.list<any>('synthetic', 'task').filter((task) => task.id !== original.id);
      assert.equal(copies.length, 1);
      assert.equal(copies[0].status, 'draft');
      assert.equal(copies[0].checklist.length, 30);
      assert.ok(
        copies[0].checklist.every(
          (text: string) => text.includes('ItemB') && !text.includes('ItemA+1'),
        ),
      );
      assert.deepEqual(store.get('synthetic', original.id), original);
    } finally {
      await runtime.close();
      await new Promise<void>((resolve) => server.close(() => resolve()));
      store.close();
      rmSync(dir, { recursive: true, force: true });
    }
  },
);
