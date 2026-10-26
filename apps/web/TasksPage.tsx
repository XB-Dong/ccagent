import { useState, type FormEvent } from 'react';
import type { Snapshot } from './api.ts';
import { requestId } from './api.ts';
import { Badge, Empty, Icon, SourceList, states } from './components.tsx';
import { timeZones, timeZoneLabel } from './display.ts';

export type Mutate = (action: string, body: object) => Promise<unknown>;
export function TasksPage({
  data,
  mutate,
  busy,
}: {
  data: Snapshot;
  mutate: Mutate;
  busy: boolean;
}) {
  const [form, setForm] = useState(false);
  const [filter, setFilter] = useState('active');
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    await mutate('task', {
      title: values.get('title'),
      timeZone: values.get('timeZone'),
      dueAt: values.get('dueAt') || undefined,
      checklist: String(values.get('checklist')).split('\n').filter(Boolean),
      requestId: requestId(),
    });
    setForm(false);
  }
  const rows = data.tasks.filter(
    (row) => filter === 'all' || !['done', 'cancelled'].includes(row.status),
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">把事情记清楚</span>
          <h1>任务清单</h1>
          <p>准备、确认、检查。每一步都有据可循。</p>
        </div>
        <button className="primary" onClick={() => setForm(!form)}>
          <Icon name="plus" size={17} /> 新建任务
        </button>
      </div>
      {form && (
        <form
          className="panel form-grid"
          onSubmit={(event) => {
            void submit(event).catch(() => {});
          }}
        >
          <label className="wide">
            任务名称
            <input name="title" placeholder="例如：美站周末活动准备" required maxLength={200} />
          </label>
          <label>
            站点时区
            <select name="timeZone" required defaultValue="">
              <option value="" disabled>
                请选择，避免时间误差
              </option>
              {Object.entries(timeZones).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            计划时间（可选，按示例填写）
            <input name="dueAt" placeholder="2026-10-26T10:00:00-07:00" />
          </label>
          <label className="wide">
            检查清单（每行一项）
            <textarea
              name="checklist"
              rows={4}
              required
              placeholder={'核对活动起止和站点时区\n检查旧优惠是否需要关闭\n活动开始后核验生效情况'}
            />
          </label>
          <div className="wide form-actions">
            <span>先记下待办，平台上的操作仍需你完成。</span>
            <button className="primary" disabled={busy}>
              确认并保存
            </button>
          </div>
        </form>
      )}
      <div className="tabs">
        <button
          className={filter === 'active' ? 'selected' : ''}
          onClick={() => setFilter('active')}
        >
          待处理
        </button>
        <button className={filter === 'all' ? 'selected' : ''} onClick={() => setFilter('all')}>
          全部记录
        </button>
        <span>{rows.length} 个任务</span>
      </div>
      {!rows.length ? (
        <section className="panel">
          <Empty
            title="这里还没有任务"
            text="点“新建任务”，或者让助手先拟一份准备清单。"
            icon="tasks"
          />
        </section>
      ) : (
        <div className="card-list">
          {rows.map((task) => (
            <article className="panel task-card" key={task.id}>
              <div className="card-heading">
                <h2>{task.title}</h2>
                <Badge tone={task.status === 'done' ? 'green' : ''}>{states[task.status]}</Badge>
              </div>
              <p className="metadata">
                {timeZoneLabel(task.timeZone)}
                {task.dueAt
                  ? ` · ${new Date(task.dueAt).toLocaleString('zh-CN', { timeZone: task.timeZone })}`
                  : ' · 未设计划时间'}
              </p>
              <div className="checklist">
                {task.checklist.map((text, index) => (
                  <label key={index}>
                    <input
                      type="checkbox"
                      checked={task.checked[index]}
                      disabled={busy || ['done', 'cancelled', 'draft'].includes(task.status)}
                      onChange={() => {
                        const checked = [...task.checked];
                        checked[index] = !checked[index];
                        void mutate('task-update', {
                          id: task.id,
                          revision: task.revision,
                          checked,
                        }).catch(() => {});
                      }}
                    />
                    <span>{text}</span>
                  </label>
                ))}
              </div>
              <div className="card-footer">
                <SourceList sources={task.sources} />
                <div>
                  {task.status === 'draft' ? (
                    <button
                      className="primary small"
                      disabled={busy}
                      onClick={() =>
                        void mutate('task-update', {
                          id: task.id,
                          revision: task.revision,
                          status: 'open',
                        }).catch(() => {})
                      }
                    >
                      确认这份任务
                    </button>
                  ) : (
                    !['done', 'cancelled'].includes(task.status) && (
                      <button
                        className="secondary small"
                        disabled={busy || !task.checked.every(Boolean)}
                        onClick={() =>
                          void mutate('task-update', {
                            id: task.id,
                            revision: task.revision,
                            status: 'done',
                            confirmedSuccess: true,
                          }).catch(() => {})
                        }
                      >
                        确认完成并保存经验
                      </button>
                    )
                  )}
                  {!['done', 'cancelled'].includes(task.status) && (
                    <button
                      className="text-button"
                      disabled={busy}
                      onClick={() =>
                        void mutate('task-update', {
                          id: task.id,
                          revision: task.revision,
                          status: 'cancelled',
                        }).catch(() => {})
                      }
                    >
                      取消任务
                    </button>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
