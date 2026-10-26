import { createApp } from '../../apps/server/app.ts';

const transport: typeof fetch = async (_url, options) => {
  const body = JSON.parse(String(options?.body));
  const text = JSON.stringify(body.messages);
  if (text.includes('合成取消测试')) {
    await new Promise((_resolve, reject) =>
      options?.signal?.addEventListener('abort', () => reject(new Error('Synthetic cancelled')), {
        once: true,
      }),
    );
  }
  const toolResult = text.includes('tool_result');
  const wantsTask = text.includes('准备清单') && !toolResult;
  const content = wantsTask
    ? { type: 'tool_use', id: 'synthetic-tool', name: 'cc_prepare_task', input: {} }
    : { type: 'text', text: '' };
  const events: [string, object][] = [
    [
      'message_start',
      {
        message: {
          id: 'synthetic-msg',
          type: 'message',
          role: 'assistant',
          model: 'deepseek-flash',
          content: [],
          stop_reason: null,
          usage: { input_tokens: 50, output_tokens: 0 },
        },
      },
    ],
    ['content_block_start', { index: 0, content_block: content }],
    [
      'content_block_delta',
      {
        index: 0,
        delta: wantsTask
          ? {
              type: 'input_json_delta',
              partial_json: JSON.stringify({
                title: '合成验收：美站活动准备',
                timeZone: 'America/Los_Angeles',
                checklist: ['核对站点时间', '检查优惠生效', '结束后恢复价格'],
              }),
            }
          : {
              type: 'text_delta',
              text: toolResult
                ? '合成验收：任务草稿已保存，请在任务清单中确认。'
                : '合成验收：这条消息已处理。',
            },
      },
    ],
    ['content_block_stop', { index: 0 }],
    [
      'message_delta',
      {
        delta: { stop_reason: wantsTask ? 'tool_use' : 'end_turn', stop_sequence: null },
        usage: { output_tokens: 20 },
      },
    ],
    ['message_stop', {}],
  ];
  return new Response(
    events
      .map(([type, value]) => `event: ${type}\ndata: ${JSON.stringify({ type, ...value })}\n\n`)
      .join(''),
    { headers: { 'content-type': 'text/event-stream' } },
  );
};
const app = await createApp({
  dataDir: 'D:/project/.ccagent-support/browser-synthetic',
  origin: 'http://127.0.0.1:4313',
  password: 'synthetic-browser-password',
  live: true,
  apiKey: 'synthetic-only',
  modelTransport: transport,
  limits: {
    maxCalls: 100,
    maxInputTokens: 1000000,
    maxOutputTokens: 100000,
    maxTotalTokens: 1100000,
  },
});
app.server.listen(4313, '127.0.0.1', () =>
  console.log('Synthetic browser fixture ready; no real model transport.'),
);
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () => {
    void app.close().then(() => process.exit(0));
  });
