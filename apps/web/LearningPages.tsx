import { useState, type FormEvent } from 'react';
import type { Snapshot } from './api.ts';
import { requestId, download } from './api.ts';
import { Badge, Empty, Icon, SourceList, states } from './components.tsx';
import type { Mutate } from './TasksPage.tsx';

export function FeedbackPage({
  data,
  mutate,
  busy,
}: {
  data: Snapshot;
  mutate: Mutate;
  busy: boolean;
}) {
  const [text, setText] = useState('');
  async function submit(event: FormEvent) {
    event.preventDefault();
    await mutate('feedback', { text, requestId: requestId(), page: 'feedback' });
    setText('');
  }
  async function exportPack() {
    const pack = (await mutate('export', {})) as { markdown: string; date: string };
    download(`cc-需求审阅-${pack.date}.md`, pack.markdown);
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR VOICE MATTERS</span>
          <h1>改进反馈</h1>
          <p>不顺手的地方，值得被认真记下来。</p>
        </div>
        <button
          className="secondary"
          onClick={() => void exportPack().catch(() => {})}
          disabled={busy}
        >
          导出已确认需求
        </button>
      </div>
      <form
        className="panel feedback-form"
        onSubmit={(event) => void submit(event).catch(() => {})}
      >
        <label htmlFor="feedback-text">哪里可以做得更好？</label>
        <textarea
          id="feedback-text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          rows={3}
          required
          maxLength={12000}
          placeholder="比如：库存页面希望能按预计缺货时间排序……"
        />
        <div className="form-actions">
          <span>保留你的原意；需求确认后可按日期导出。</span>
          <button className="primary" disabled={busy || !data.learningEnabled}>
            记下这条建议 <Icon name="arrow" size={16} />
          </button>
        </div>
      </form>
      {!data.learningEnabled && <div className="notice">学习已暂停，开启后可继续沉淀新反馈。</div>}
      <div className="section-heading">
        <h2>
          已记录的声音 <small>{data.feedback.length}</small>
        </h2>
        <span className="metadata">自动采集为候选，不会自动改动系统</span>
      </div>
      {!data.feedback.length ? (
        <section className="panel">
          <Empty
            title="还没有改进反馈"
            text="在这里写一句，或在对话中直接告诉助手哪里不好用。"
            icon="feedback"
          />
        </section>
      ) : (
        <div className="card-list">
          {data.feedback.map((row) => (
            <article className="panel" key={row.id}>
              <div className="card-heading">
                <Badge>{states[row.status] ?? row.status}</Badge>
                <span className="metadata">
                  {new Date(row.createdAt).toLocaleDateString('zh-CN')} · {row.count} 次记录
                </span>
              </div>
              <p className="feedback-body">{row.text}</p>
              {row.expected && <p className="metadata">期望：{row.expected}</p>}
              {row.actual && <p className="metadata">实际：{row.actual}</p>}
              {(row.amendments ?? []).map((item) => (
                <p className="feedback-body" key={item.sourceId}>
                  补充：{item.text}
                </p>
              ))}
              {row.status !== 'withdrawn' && (
                <details className="feedback-amendment">
                  <summary>补充或纠正这条建议</summary>
                  <form
                    onSubmit={(event) => {
                      event.preventDefault();
                      const form = event.currentTarget;
                      const values = new FormData(form);
                      void mutate('feedback-append', {
                        id: row.id,
                        revision: row.revision,
                        text: values.get('text'),
                        requestId: requestId(),
                      })
                        .then(() => form.reset())
                        .catch(() => {});
                    }}
                  >
                    <input
                      name="text"
                      aria-label="补充内容"
                      required
                      maxLength={1000}
                      placeholder="补充预期、实际表现或更正说明"
                    />
                    <button className="secondary small" disabled={busy}>
                      保存补充
                    </button>
                  </form>
                </details>
              )}
              <div className="card-footer">
                <SourceList sources={row.sources} />
                <div>
                  <button
                    className="text-button"
                    disabled={busy || row.status === 'withdrawn'}
                    onClick={() =>
                      void mutate('change-confirm', {
                        id: row.id,
                        requirementId: 'CC-FEEDBACK-001',
                      }).catch(() => {})
                    }
                  >
                    确认为迭代需求
                  </button>
                  <button
                    className="text-button muted-text"
                    disabled={busy || row.status === 'withdrawn'}
                    onClick={() =>
                      void mutate('feedback-update', {
                        id: row.id,
                        revision: row.revision,
                        status: 'withdrawn',
                      }).catch(() => {})
                    }
                  >
                    撤回
                  </button>
                  <button
                    className="text-button muted-text"
                    disabled={busy}
                    onClick={() => void mutate('delete', { id: row.id }).catch(() => {})}
                  >
                    删除
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}

export function KnowledgePage({
  data,
  mutate,
  busy,
}: {
  data: Snapshot;
  mutate: Mutate;
  busy: boolean;
}) {
  const [tab, setTab] = useState('skills');
  const [showForm, setShowForm] = useState(false);
  async function addMemory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    await mutate('memory', {
      key: form.get('key'),
      value: form.get('value'),
      requestId: requestId(),
    });
    setShowForm(false);
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">LEARNING HOW YOU WORK</span>
          <h1>经验与记忆</h1>
          <p>记住经过确认的事，让成功流程下次更省力。</p>
        </div>
        <button
          className="secondary"
          onClick={() =>
            void mutate('learning', { enabled: !data.learningEnabled }).catch(() => {})
          }
          disabled={busy}
        >
          {data.learningEnabled ? '暂停自动学习' : '恢复自动学习'}
        </button>
      </div>
      <div className="learning-banner">
        <span className="round-icon">
          <Icon name="book" size={22} />
        </span>
        <div>
          <strong>{data.learningEnabled ? '正在积累，而不是盲目照搬' : '自动学习已暂停'}</strong>
          <p>清单需逐项检查并确认成功，才会变成可复用经验。你随时可以停用或删除。</p>
        </div>
        <Badge tone={data.learningEnabled ? 'green' : ''}>
          {data.learningEnabled ? '学习开启' : '已暂停'}
        </Badge>
      </div>
      <div className="tabs">
        <button className={tab === 'skills' ? 'selected' : ''} onClick={() => setTab('skills')}>
          流程经验 <span>{data.skills.length}</span>
        </button>
        <button className={tab === 'memory' ? 'selected' : ''} onClick={() => setTab('memory')}>
          业务记忆 <span>{data.memories.length}</span>
        </button>
      </div>
      {tab === 'skills' ? (
        !data.skills.length ? (
          <section className="panel">
            <Empty
              title="第一条经验，来自一次成功"
              text="完成并确认任务清单后，工作台会自动整理为内部草稿经验。"
              icon="book"
            />
          </section>
        ) : (
          <div className="card-list">
            {data.skills.map((skill) => (
              <article className="panel" key={skill.id}>
                <div className="card-heading">
                  <h2>{skill.description}</h2>
                  <Badge tone={skill.status === 'active' ? 'green' : ''}>
                    {states[skill.status]}
                  </Badge>
                </div>
                <p className="metadata">
                  {skill.risk} · 版本 {skill.revision} · 仅适用于当前工作范围
                </p>
                <ol className="skill-steps">
                  {skill.steps.map((step, index) => (
                    <li key={index}>{step}</li>
                  ))}
                </ol>
                {skill.validation.length > 0 && (
                  <p className="notice">校验待处理：{skill.validation.join('、')}</p>
                )}
                <div className="card-footer">
                  <SourceList sources={skill.sources} />
                  <div>
                    {skill.status === 'waiting_confirmation' && (
                      <button
                        className="text-button"
                        disabled={busy}
                        onClick={() =>
                          void mutate('skill-confirm', {
                            id: skill.id,
                            revision: skill.revision,
                          }).catch(() => {})
                        }
                      >
                        确认启用该版本
                      </button>
                    )}
                    {skill.status === 'active' && (
                      <button
                        className="text-button"
                        disabled={busy}
                        onClick={() =>
                          void mutate('skill-revoke', { id: skill.id }).catch(() => {})
                        }
                      >
                        停用经验
                      </button>
                    )}
                    <button
                      className="text-button muted-text"
                      disabled={busy}
                      onClick={() => void mutate('delete', { id: skill.id }).catch(() => {})}
                    >
                      删除
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )
      ) : (
        <>
          <div className="section-heading">
            <h2>已确认与待确认的事实</h2>
            <button className="text-button" onClick={() => setShowForm(!showForm)}>
              <Icon name="plus" size={16} /> 记住一件事
            </button>
          </div>
          {showForm && (
            <form
              className="panel form-grid"
              onSubmit={(event) => void addMemory(event).catch(() => {})}
            >
              <label>
                记忆名称
                <input name="key" required maxLength={80} placeholder="活动准备提前量" />
              </label>
              <label>
                确认后的内容
                <input
                  name="value"
                  required
                  maxLength={300}
                  placeholder="6 小时，仅适用于美站当前流程"
                />
              </label>
              <div className="wide form-actions">
                <span>同名新记忆会保留旧版的更正关系。</span>
                <button className="primary" disabled={busy || !data.learningEnabled}>
                  确认并记住
                </button>
              </div>
            </form>
          )}
          {data.summary && (
            <div className="memory-summary">
              <span className="eyebrow">整理后的摘要 · v{data.summary.revision}</span>
              <p>{data.summary.summary || '暂无有效的已确认记忆'}</p>
              <small>原始结构化事实与来源保留，摘要不是事实的替代品。</small>
            </div>
          )}
          {!data.memories.length ? (
            <section className="panel">
              <Empty
                title="还没有业务记忆"
                text="例如：告诉助手“记住：活动准备提前量是 6 小时”。"
                icon="book"
              />
            </section>
          ) : (
            <div className="card-list">
              {data.memories.map((memory) => (
                <article
                  className={`panel ${memory.status === 'superseded' ? 'faded' : ''}`}
                  key={memory.id}
                >
                  <div className="card-heading">
                    <h2>{memory.key}</h2>
                    <Badge>{states[memory.status]}</Badge>
                  </div>
                  <p>{memory.value}</p>
                  <div className="card-footer">
                    <SourceList sources={memory.sources} />
                    <button
                      className="text-button muted-text"
                      disabled={busy}
                      onClick={() => void mutate('delete', { id: memory.id }).catch(() => {})}
                    >
                      删除这条记忆
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </>
      )}
    </>
  );
}
