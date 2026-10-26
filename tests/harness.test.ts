import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { mkdtempSync, rmSync, writeFileSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { OperatorRuntime } from '../packages/cc-harness-adapter/runtime.ts';

test(
  'official Harness executes only supplied cc tools, checkpoints and resumes offline',
  { timeout: 45000 },
  async () => {
    const dir = mkdtempSync(join(tmpdir(), 'cc-harness-'));
    const advertised: string[][] = [];
    const executed: string[] = [];
    let turns = 0;
    let skillActive = true;
    const server = createServer(async (req, res) => {
      let raw = '';
      for await (const chunk of req) raw += chunk;
      const body = JSON.parse(raw || '{}');
      if (req.url?.startsWith('/tools/')) {
        executed.push(req.url);
        res.setHeader('content-type', 'application/json');
        res.end(
          JSON.stringify(
            req.url.endsWith('/skills')
              ? skillActive
                ? [
                    {
                      id: 'synthetic-skill',
                      name: 'cc-known-flow',
                      description: 'Synthetic internal checklist',
                    },
                  ]
                : []
              : req.url.endsWith('/skill')
                ? skillActive
                  ? {
                      name: 'cc-known-flow',
                      description: 'Synthetic internal checklist',
                      content: 'Synthetic approved checklist body.',
                    }
                  : null
                : { tasks: [{ title: 'Synthetic preparation' }] },
          ),
        );
        return;
      }
      advertised.push((body.tools ?? []).map((tool: { name: string }) => tool.name));
      const currentTurn = turns++;
      const toolName =
        currentTurn === 0
          ? 'cc_list_tasks'
          : currentTurn === 2 || currentTurn === 4
            ? 'skill'
            : undefined;
      const callTool = !!toolName;
      res.writeHead(200, { 'content-type': 'text/event-stream' });
      const send = (type: string, data: object) =>
        res.write(`event: ${type}\ndata: ${JSON.stringify({ type, ...data })}\n\n`);
      send('message_start', {
        message: {
          id: `fake-${turns}`,
          type: 'message',
          role: 'assistant',
          content: [],
          model: body.model,
          stop_reason: null,
          usage: { input_tokens: 20, output_tokens: 0 },
        },
      });
      if (callTool) {
        send('content_block_start', {
          index: 0,
          content_block: { type: 'tool_use', id: `tool-${turns}`, name: toolName, input: {} },
        });
        send('content_block_delta', {
          index: 0,
          delta: {
            type: 'input_json_delta',
            partial_json: toolName === 'skill' ? '{"name":"cc-known-flow"}' : '{}',
          },
        });
      } else {
        send('content_block_start', { index: 0, content_block: { type: 'text', text: '' } });
        send('content_block_delta', {
          index: 0,
          delta: { type: 'text_delta', text: '已读取合成任务。' },
        });
      }
      send('content_block_stop', { index: 0 });
      send('message_delta', {
        delta: { stop_reason: callTool ? 'tool_use' : 'end_turn', stop_sequence: null },
        usage: { output_tokens: 10 },
      });
      send('message_stop', {});
      res.end();
    });
    await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
    const port = (server.address() as { port: number }).port;
    const portFile = join(dir, 'compaction-port');
    const extra = join(dir, 'probe.yml');
    writeFileSync(
      extra,
      JSON.stringify([
        {
          id: 'compaction-basic',
          config: {
            auto: false,
            retainTokens: 32,
            headroomTokens: 128,
            maxTokens: 128,
            compactionRetries: 0,
            maxOverflowRetries: 0,
          },
        },
        {
          insert: [
            {
              id: 'compaction-probe',
              name: resolve('tests/fixtures/compaction.mjs'),
              config: { portFile },
            },
          ],
        },
      ]),
    );
    let runtime = new OperatorRuntime(
      dir,
      'a',
      `http://127.0.0.1:${port}`,
      'fake-only',
      `http://127.0.0.1:${port}`,
      [extra],
    );
    try {
      const first = await runtime.run(
        `List my tasks. Synthetic context: ${'daily inventory, currency USD, scope a; '.repeat(100)}`,
      );
      assert.equal(first.finalResponse, '已读取合成任务。');
      assert.ok(executed.includes('/tools/list_tasks'));
      assert.ok(executed.includes('/tools/skills'));
      assert.ok(advertised[0].includes('cc_list_tasks'));
      assert.ok(advertised.flat().every((name) => name.startsWith('cc_') || name === 'skill'));
      await runtime.close();
      runtime = new OperatorRuntime(
        dir,
        'a',
        `http://127.0.0.1:${port}`,
        'fake-only',
        `http://127.0.0.1:${port}`,
        [extra],
      );
      const resumed = await runtime.run(
        `Continue. ${'Synthetic activity preparation steps. '.repeat(70)}`,
        first.sessionId,
      );
      assert.equal(resumed.sessionId, first.sessionId);
      assert.equal(resumed.finalResponse, '已读取合成任务。');
      assert.ok(executed.includes('/tools/skill'));
      assert.ok(JSON.stringify(resumed.events).includes('Synthetic approved checklist body.'));
      skillActive = false;
      const revoked = await runtime.run('Try the same skill again.', first.sessionId);
      assert.ok(
        !JSON.stringify(revoked.events.filter((event) => event.type === 'tool/result')).includes(
          'Synthetic approved checklist body.',
        ),
      );
      const controlPort = Number(readFileSync(portFile, 'utf-8'));
      const compactResponse = await fetch(`http://127.0.0.1:${controlPort}`);
      const compacted = (await compactResponse.json()) as { result?: unknown; error?: string };
      assert.equal(compactResponse.status, 200, JSON.stringify(compacted));
      assert.ok(compacted.result, 'native compactNow must commit a useful history reduction');
      console.log(JSON.stringify({ nativeCompaction: compacted.result }));
    } finally {
      await runtime.close();
      await new Promise<void>((resolve) => server.close(() => resolve()));
      rmSync(dir, { recursive: true, force: true });
    }
  },
);
