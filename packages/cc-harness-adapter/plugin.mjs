import { defineTool } from '@deepseek-ai/dsh-tools';

export const name = 'cc-operations';
export const inject = ['tools', 'skills'];

export function apply(ctx) {
  const base = process.env.CC_INTERNAL_URL;
  const token = process.env.CC_RUNTIME_TOKEN;
  if (!base || !token) throw new Error('CC_RUNTIME_CONFIG_REQUIRED');
  async function request(action, args = {}, signal) {
    const response = await fetch(`${base}/tools/${action}`, {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify(args),
      signal: signal ?? AbortSignal.timeout(5000),
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error ?? 'CC_TOOL_FAILED');
    return result;
  }
  const definitions = [
    ['cc_list_tasks', '分页查看当前范围内的运营任务，更多结果使用 nextOffset。', 'list_tasks', { offset: {type: 'number'} }],
    [
      'cc_prepare_task',
      '创建内部任务草稿，须由 cc 确认；不能执行外部操作。',
      'prepare_task',
      {
        title: { type: 'string', required: true },
        timeZone: { type: 'string', required: true },
        dueAt: { type: 'string' },
        checklist: { type: 'array', items: { type: 'string' }, required: true },
      },
    ],
    [
      'cc_capture_feedback',
      '记录当前用户消息中的工作台改进意见，保留来源。',
      'capture_feedback',
      {
        text: { type: 'string', required: true },
        expected: { type: 'string' },
        actual: { type: 'string' },
      },
    ],
    ['cc_read_memory', '分页查看当前范围中有效的已确认业务记忆，更多结果使用 nextOffset。', 'read_memory', { offset: {type: 'number'} }],
    [
      'cc_draft_checklist',
      '将当前有效的 L0 Skill 清单复用为只读内部草稿。撤销版本不能使用。',
      'draft_checklist',
      { skillId: { type: 'string', required: true } },
    ],
  ];
  for (const [toolName, description, action, parameters] of definitions) {
    ctx.tools.register(
      defineTool({
        name: toolName,
        description,
        parameters,
        output: {
          schema: { type: 'json' },
          render: (_args, value) => [{ type: 'text', text: JSON.stringify(value) }],
        },
        execute: (args, exec) => request(action, args, exec.signal),
        timeoutMs: 5000,
      }),
    );
  }
  ctx.skills.registerProvider((control) => {
    const timer = setInterval(() => control.invalidate(), 1000);
    timer.unref();
    control.signal.addEventListener('abort', () => clearInterval(timer), { once: true });
    return {
      name: 'cc-approved',
      async list(options) {
        const rows = await request('skills', {}, options.signal);
        return rows.map((row) => ({
          name: row.name,
          description: row.description,
          invocation: { modelInvocable: true, userInvocable: true },
          source: 'cc-approved',
          provider: 'cc-approved',
          rank: 100,
          locator: row.id,
        }));
      },
      async get(candidate, options) {
        const row = await request('skill', { id: candidate.locator }, options.signal);
        if (!row) return undefined;
        return {
          name: row.name,
          description: row.description,
          content: row.content,
          invocation: { modelInvocable: true, userInvocable: true },
          source: 'cc-approved',
          provider: 'cc-approved',
        };
      },
    };
  });
}
