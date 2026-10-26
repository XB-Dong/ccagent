import { useState, useEffect, useRef, type FormEvent } from 'react';
import type { Snapshot, Status } from './api.ts';
import { api, requestId, modelLabel, canChat, assistantHealthy, errorMessage } from './api.ts';
import { Icon } from './components.tsx';

type Message = { role: string; text: string; status?: string };
export function Assistant({
  data,
  status,
  initialPrompt,
  refresh,
  reportError,
}: {
  data: Snapshot;
  status?: Status;
  initialPrompt: string;
  refresh: () => Promise<void>;
  reportError: (message: string) => void;
}) {
  const [text, setText] = useState(initialPrompt);
  const [conversationId, setConversationId] = useState<string>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [busy, setBusy] = useState(false);
  const messagesContainer = useRef<HTMLDivElement>(null);
  useEffect(() => {
    setText(initialPrompt);
  }, [initialPrompt]);
  useEffect(() => {
    if (messagesContainer.current)
      messagesContainer.current.scrollTop = messagesContainer.current.scrollHeight;
  }, [messages.length, busy]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!text.trim() || busy || !canChat(status)) return;
    const value = text.trim();
    setText('');
    setMessages((old) => [...old, { role: 'user', text: value }]);
    setBusy(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: value, conversationId, requestId: requestId() }),
      });
      if (!response.ok || !response.body) {
        const error = await response.json();
        throw new Error(errorMessage(error.error ?? 'CHAT_FAILED'));
      }
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let pending = '';
      let finished = false;
      for (;;) {
        const { done, value: chunk } = await reader.read();
        if (done) break;
        pending += decoder.decode(chunk, { stream: true });
        const records = pending.split('\n\n');
        pending = records.pop() ?? '';
        for (const record of records) {
          const eventName = record.match(/^event: (.+)$/m)?.[1];
          const raw = record.match(/^data: (.+)$/m)?.[1];
          if (!raw) continue;
          const event = JSON.parse(raw);
          if (eventName === 'conversation') setConversationId(event.id);
          if (eventName === 'done') {
            setMessages((old) => [
              ...old,
              { role: 'assistant', text: event.text, status: event.status },
            ]);
            finished = true;
          }
          if (eventName === 'error') throw new Error(errorMessage(event.error));
        }
      }
      if (!finished) throw new Error('对话连接已中断，已保存的记录可在历史中查看。');
      await refresh();
    } catch (error) {
      reportError(
        error instanceof Error && /[\u4e00-\u9fff]/.test(error.message)
          ? error.message
          : '消息未能发送，请检查网络后重试。',
      );
      await refresh().catch(() => {});
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="assistant-layout">
      <section className="chat-panel panel">
        <div className="chat-heading">
          <div className="assistant-avatar">
            <Icon name="spark" size={22} />
          </div>
          <div>
            <h2>cc 的运营助手</h2>
            <p>
              <span className={`status-dot ${assistantHealthy(status) ? '' : 'muted'}`} />
              {modelLabel(status)}
            </p>
          </div>
          <button
            className="text-button"
            disabled={busy}
            onClick={() => {
              setConversationId(undefined);
              setMessages([]);
            }}
          >
            新对话 <Icon name="plus" size={15} />
          </button>
        </div>
        <div className="messages" ref={messagesContainer}>
          <div className="message assistant">
            <span className="message-avatar">
              <Icon name="spark" size={16} />
            </span>
            <div>
              <strong>cc，你好！今天想先处理哪件事？</strong>
              <p>你可以让我拟一份活动准备清单，记下工作台的改进意见，或保存你确认过的业务习惯。</p>
              <div className="prompt-chips">
                {[
                  '帮我整理明天活动的准备清单',
                  '这里不好用，帮我记下来',
                  '记住：准备提前量是6小时',
                ].map((value) => (
                  <button key={value} onClick={() => setText(value)}>
                    {value}
                    <Icon name="arrow" size={13} />
                  </button>
                ))}
              </div>
            </div>
          </div>
          {messages.map((message, index) => (
            <div className={`message ${message.role}`} key={index}>
              <span className="message-avatar">
                {message.role === 'user' ? 'cc' : <Icon name="spark" size={16} />}
              </span>
              <div>
                <p>{message.text}</p>
                {message.status && ['offline', 'error', 'cancelled'].includes(message.status) && (
                  <small>{message.status === 'offline' ? '离线记录' : '本次请求未完成'}</small>
                )}
              </div>
            </div>
          ))}
          {busy && (
            <div className="working">
              <span />
              <span />
              <span /> 正在整理，请稍等
            </div>
          )}
        </div>
        {!canChat(status) && (
          <p className="notice" role="status">
            {status?.modelState === 'budget_exhausted' && status.budget.policy?.period === 'daily'
              ? '今天的助手使用已达保护上限，北京时间零点后可继续。你仍可在左侧新建任务、记录反馈和查看经验。'
              : '助手暂时无法回复，请联系工作台维护者处理。你仍可在左侧新建任务、记录反馈和查看经验。'}
          </p>
        )}
        <form className="composer" onSubmit={(event) => void submit(event)}>
          <textarea
            aria-label="给助手的消息"
            value={text}
            onChange={(event) => setText(event.target.value)}
            placeholder="说说你想做的事，也可以直接告诉我哪里不好用……"
            maxLength={2000}
            rows={2}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
          />
          <div>
            <span>按回车发送，也可点右侧按钮</span>
            {busy ? (
              <button
                type="button"
                className="secondary small"
                onClick={() => void api('cancel', {}).catch(() => {})}
              >
                停止
              </button>
            ) : (
              <button
                className="send-button"
                aria-label="发送消息"
                disabled={!text.trim() || !canChat(status)}
              >
                <Icon name="send" size={20} />
              </button>
            )}
          </div>
        </form>
        <p className="chat-footnote">
          助手拟好清单后，请到“任务清单”确认。平台上的建单、改价和广告调整仍需你操作。
        </p>
      </section>
      <aside className="chat-aside">
        <section className="panel">
          <span className="eyebrow">继续上次的话题</span>
          <h3>最近对话</h3>
          {data.sessions.length ? (
            data.sessions.slice(0, 12).map((session) => (
              <button
                key={session.id}
                disabled={busy}
                className={`history-item ${session.id === conversationId ? 'active' : ''}`}
                onClick={() => {
                  setConversationId(session.id);
                  setMessages(session.messages);
                }}
              >
                <Icon name="chat" size={16} />
                <span>{session.title}</span>
              </button>
            ))
          ) : (
            <p className="metadata">开始对话后，记录会留在这里。</p>
          )}
        </section>
        <section className="assistant-tip">
          <Icon name="book" size={22} />
          <h3>慢慢懂你，步步有据</h3>
          <p>
            已确认的记忆可以在下次对话中使用。成功清单会整理成经验，相关来源会保留，方便后续核对。
          </p>
        </section>
      </aside>
    </div>
  );
}
