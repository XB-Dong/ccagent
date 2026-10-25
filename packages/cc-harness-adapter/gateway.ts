import type { IncomingMessage, ServerResponse } from 'node:http';
import { ModelBudget, type Usage } from '../core/budget.ts';

export async function forwardModel(
  req: IncomingMessage,
  res: ServerResponse,
  body: Record<string, unknown>,
  budget: ModelBudget,
  apiKey: string | undefined,
  transport: typeof fetch = fetch,
): Promise<void> {
  if (!apiKey) throw new Error('MODEL_OFFLINE');
  const raw = JSON.stringify(body);
  if (
    body.model !== 'deepseek-flash' ||
    body.stream !== true ||
    !Number.isSafeInteger(body.max_tokens) ||
    Number(body.max_tokens) <= 0 ||
    Number(body.max_tokens) > 512 ||
    Buffer.byteLength(raw) > 18000
  )
    throw new Error('MODEL_REQUEST_FORBIDDEN');
  // UTF-8 byte length is a conservative text-token reservation, including tools.
  const id = budget.reserve(Buffer.byteLength(raw), Number(body.max_tokens));
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 45000);
  const cancel = () => controller.abort();
  res.once('close', cancel);
  let usage: Usage | undefined;
  try {
    const upstream = await transport('https://api.deepseek.com/anthropic/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: raw,
      signal: controller.signal,
      redirect: 'error',
    });
    if (!upstream.ok || !upstream.body) {
      res.writeHead(upstream.status, { 'content-type': 'application/json' });
      res.end(
        JSON.stringify({
          type: 'error',
          error: { type: 'upstream_error', message: `MODEL_HTTP_${upstream.status}` },
        }),
      );
      return;
    }
    res.writeHead(200, { 'content-type': 'text/event-stream', 'cache-control': 'no-store' });
    let pending = '';
    let input: number | undefined;
    let output: number | undefined;
    let completed = false;
    const decoder = new TextDecoder();
    for await (const chunk of upstream.body) {
      res.write(chunk);
      pending += decoder.decode(chunk, { stream: true });
      const lines = pending.split('\n');
      pending = lines.pop() ?? '';
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const event = JSON.parse(line.slice(6));
          const value = event.message?.usage ?? event.usage;
          if (Number.isSafeInteger(value?.input_tokens))
            input =
              value.input_tokens +
              (value.cache_read_input_tokens ?? 0) +
              (value.cache_creation_input_tokens ?? 0);
          if (event.type === 'message_delta' && Number.isSafeInteger(value?.output_tokens))
            output = value.output_tokens;
          if (event.type === 'message_stop') completed = true;
        } catch {
          /* Non-JSON SSE lines carry no verified usage. */
        }
      }
      if (pending.length > 200000) throw new Error('MODEL_STREAM_TOO_LARGE');
    }
    if (completed && input !== undefined && output !== undefined)
      usage = { inputTokens: input, outputTokens: output };
    res.end();
  } finally {
    clearTimeout(timer);
    res.off('close', cancel);
    budget.settle(id, usage);
  }
}
