import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { ModelBudget } from '../packages/core/budget.ts';
import { forwardModel } from '../packages/cc-harness-adapter/gateway.ts';

test('truncated successful HTTP stream cannot settle a false zero output usage', async () => {
  const budget = new ModelBudget(':memory:', {
    maxCalls: 2,
    maxInputTokens: 1000,
    maxOutputTokens: 600,
    maxTotalTokens: 1600,
  });
  const fake: typeof fetch = async () =>
    new Response(
      'data: {"type":"message_start","message":{"usage":{"input_tokens":7,"output_tokens":0}}}\n\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"partial"}}\n\n',
    );
  const server = createServer(async (req, res) => {
    try {
      await forwardModel(
        req,
        res,
        { model: 'deepseek-flash', stream: true, max_tokens: 512, messages: [] },
        budget,
        'synthetic-key',
        fake,
      );
    } catch {
      res.end();
    }
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  try {
    await (await fetch(`http://127.0.0.1:${(server.address() as { port: number }).port}`)).text();
    assert.equal(budget.snapshot().outputTokens, 512);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    budget.close();
  }
});

test('model gateway enforces persistent budget before transport and reserves missing usage', async () => {
  const budget = new ModelBudget(':memory:', {
    maxCalls: 1,
    maxInputTokens: 1000,
    maxOutputTokens: 100,
    maxTotalTokens: 1100,
  });
  let calls = 0;
  const fake: typeof fetch = async (url, options) => {
    calls++;
    assert.equal(url, 'https://api.deepseek.com/anthropic/v1/messages');
    assert.equal(new Headers(options?.headers).get('x-api-key'), 'synthetic-key');
    return new Response('event: message_stop\ndata: {"type":"message_stop"}\n\n', {
      headers: { 'content-type': 'text/event-stream' },
    });
  };
  const server = createServer(async (req, res) => {
    try {
      await forwardModel(
        req,
        res,
        { model: 'deepseek-flash', stream: true, max_tokens: 30, messages: [] },
        budget,
        'synthetic-key',
        fake,
      );
    } catch (error) {
      res.writeHead(429);
      res.end((error as Error).message);
    }
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const url = `http://127.0.0.1:${(server.address() as { port: number }).port}`;
  try {
    const first = await fetch(url);
    assert.equal(first.status, 200);
    await first.text();
    const second = await fetch(url);
    assert.equal(second.status, 429);
    assert.match(await second.text(), /BUDGET_EXHAUSTED/);
    assert.equal(calls, 1);
    assert.equal(budget.snapshot().outputTokens, 30);
  } finally {
    await new Promise<void>((resolve) => server.close(() => resolve()));
    budget.close();
  }
});
