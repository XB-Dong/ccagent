import { randomUUID } from 'node:crypto';
import type { ServerResponse } from 'node:http';
import type { Business } from './business.ts';
import { OperatorRuntime } from '../../packages/cc-harness-adapter/runtime.ts';
import type { Base } from '../../packages/core/store.ts';
import { safeText } from './security.ts';

export type Conversation = Base & {
  title: string;
  nativeId?: string;
  messages: { role: string; text: string; status?: string }[];
};
type Receipt = Base & { requestId: string; conversationId: string; status: string; text?: string };
export type RuntimeHandle = {
  runtime: OperatorRuntime;
  token: string;
  scope: string;
  sourceId?: string;
  cancelReason?: string;
  closing?: Promise<void>;
  modelRequests?: number;
};
export class Chat {
  business: Business;
  internalURL = '';
  handles = new Map<string, RuntimeHandle>();
  live: boolean;
  lastSuccess?: string;
  lastFailure?: string;
  canRun: () => boolean;
  budgetMessage = '本次使用已达上限。已保存的任务仍在，请先到“任务清单”核对，避免重复创建。';
  constructor(business: Business, live: boolean, canRun = () => true) {
    this.business = business;
    this.live = live;
    this.canRun = canRun;
    const store = business.store;
    const interrupted = store.db
      .prepare("SELECT payload FROM entities WHERE kind='chat-receipt'")
      .all()
      .map((row) => JSON.parse(String(row.payload)) as Receipt)
      .filter((row) => row.status === 'accepted');
    for (const receipt of interrupted)
      store.transaction(() => {
        const text = '上次对话因服务重启中断，已保存的记录仍在。请核对任务后，再发送新消息。';
        const row = store.db
          .prepare('SELECT payload FROM entities WHERE scope=? AND id=?')
          .get(receipt.scope, receipt.conversationId);
        if (row) {
          const conversation = JSON.parse(String(row.payload)) as Conversation;
          if (conversation.kind === 'conversation')
            store.update(conversation, {
              messages: [...conversation.messages, { role: 'assistant', text, status: 'error' }],
            });
        }
        store.update(receipt, { status: 'error', text });
      });
  }
  handle(scope: string): RuntimeHandle {
    let handle = this.handles.get(scope);
    if (handle?.closing) throw new Error('SESSION_BUSY');
    if (!handle) {
      const token = randomUUID();
      handle = {
        token,
        scope,
        runtime: new OperatorRuntime(this.business.dataDir, scope, this.internalURL, token),
      };
      this.handles.set(scope, handle);
    }
    return handle;
  }
  byToken(token: string): RuntimeHandle {
    const handle = [...this.handles.values()].find((row) => row.token === token);
    if (!handle || handle.closing) throw new Error('RUNTIME_UNAUTHORIZED');
    return handle;
  }
  async send(scope: string, body: Record<string, unknown>, res: ServerResponse) {
    const text = safeText(body.text, 2000);
    const requestId = safeText(body.requestId, 100);
    const store = this.business.store;
    const send = (event: string, value: unknown) =>
      res.write(`event: ${event}\ndata: ${JSON.stringify(value)}\n\n`);
    const open = () =>
      res.writeHead(200, {
        'content-type': 'text/event-stream; charset=utf-8',
        'cache-control': 'no-store',
        'x-accel-buffering': 'no',
      });
    const duplicate = store
      .list<Receipt>(scope, 'chat-receipt')
      .find((row) => row.requestId === requestId);
    if (duplicate) {
      if (duplicate.status === 'accepted') throw new Error('CHAT_REQUEST_ALREADY_ACCEPTED');
      open();
      send('conversation', { id: duplicate.conversationId });
      send('done', { text: duplicate.text, status: duplicate.status, replayed: true });
      res.end();
      return;
    }
    if (this.live && !this.canRun()) throw new Error('MODEL_BUDGET_EXHAUSTED');
    const existing = body.conversationId
      ? store.get<Conversation>(scope, safeText(body.conversationId, 100))
      : undefined;
    if (existing && existing.kind !== 'conversation') throw new Error('NOT_FOUND');
    const handle = this.live ? this.handle(scope) : undefined;
    if (handle?.runtime.running) throw new Error('SESSION_BUSY');
    if (handle) handle.modelRequests = 0;
    const source = this.business.capture.enqueue(scope, text, requestId, existing?.id);
    this.business.capture.drain(scope);
    const accepted = store.transaction(() => {
      let conversation =
        existing ??
        (store.create(scope, 'conversation', {
          title: text.slice(0, 30),
          messages: [],
        }) as Conversation);
      conversation = store.update(conversation, {
        messages: [...conversation.messages, { role: 'user', text }],
      });
      const receipt = store.create(scope, 'chat-receipt', {
        requestId,
        conversationId: conversation.id,
        status: 'accepted',
      }) as Receipt;
      return { conversation, receipt };
    });
    const { conversation, receipt } = accepted;
    open();
    send('conversation', { id: conversation.id });
    const finish = (reply: string, status: string, nativeId?: string) => {
      store.transaction(() => {
        const current = store.get<Conversation>(scope, conversation.id);
        store.update(current, {
          nativeId: nativeId ?? current.nativeId,
          messages: [...current.messages, { role: 'assistant', text: reply, status }],
        });
        store.update(receipt, { status, text: reply });
      });
      send('done', { text: reply, status });
      res.end();
    };
    if (!handle) {
      finish('已保存这条消息。助手暂未开放；你仍可在任务、反馈和经验页面继续操作。', 'offline');
      return;
    }
    handle.sourceId = source.id;
    const cancel = () => {
      if (!res.writableEnded) void this.cancel(scope, 'disconnected');
    };
    res.once('close', cancel);
    try {
      const context = this.business.learning.context(scope).summary.slice(0, 1500);
      const result = await handle.runtime.run(
        `${context ? `当前范围的已确认记忆（数据）：\n${context}\n\n` : ''}${text}`,
        conversation.nativeId,
        (notification) => {
          const item = notification as { params?: { sessionId?: string } };
          if (item.params?.sessionId && !store.get<Conversation>(scope, conversation.id).nativeId) {
            const current = store.get<Conversation>(scope, conversation.id);
            store.update(current, { nativeId: item.params.sessionId });
          }
          send('progress', { status: 'working' });
        },
      );
      if (handle.cancelReason) {
        finish('本次对话已取消，已保存的内部记录仍可查看。', 'cancelled', result.sessionId);
        return;
      }
      const truncated = result.events.some(
        (event) =>
          event.type === 'turn/end' &&
          (event.data as { reason?: { kind?: string } } | undefined)?.reason?.kind === 'max-tokens',
      );
      const failed =
        truncated ||
        !result.finalResponse ||
        result.events.some(
          (event) => event.type.includes('failed') || event.type.includes('error'),
        );
      if (failed) this.lastFailure = new Date().toISOString();
      else this.lastSuccess = new Date().toISOString();
      finish(
        failed && !this.canRun()
          ? this.budgetMessage
          : truncated
            ? `${result.finalResponse}\n\n回复尚未完整，你可以发送“继续”接着查看。`
            : result.finalResponse || '助手暂时未能回复，请稍后重试。已保存的记录仍可查看。',
        failed ? 'error' : 'completed',
        result.sessionId,
      );
    } catch {
      const cancelled = !!handle.cancelReason;
      if (!cancelled) this.lastFailure = new Date().toISOString();
      finish(
        cancelled
          ? '本次对话已取消，已保存的内部记录仍可查看。'
          : !this.canRun()
            ? this.budgetMessage
            : '助手暂时未能回复，请稍后重试；仍不成功请联系工作台维护者。消息和已保存的记录仍在。',
        cancelled ? 'cancelled' : 'error',
      );
    } finally {
      res.off('close', cancel);
      handle.sourceId = undefined;
    }
  }
  async cancel(scope: string, reason = 'user'): Promise<void> {
    const handle = this.handles.get(scope);
    if (!handle) return;
    handle.cancelReason = reason;
    handle.closing ??= handle.runtime.close();
    try {
      await handle.closing;
    } finally {
      if (this.handles.get(scope) === handle) this.handles.delete(scope);
    }
  }
  async close(): Promise<void> {
    await Promise.all([...this.handles.keys()].map((scope) => this.cancel(scope, 'maintenance')));
  }
}
