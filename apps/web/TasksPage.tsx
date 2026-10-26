import { useState } from 'react';
import type { Task } from '../../packages/learning/service.ts';
import type { Snapshot } from './api.ts';
import { Badge, Empty, Icon, SourceList, states } from './components.tsx';
import { timeZoneLabel } from './display.ts';
import { TaskForm, ActualMinutesForm } from './TaskForm.tsx';
import { plannedLabel } from './task-time.ts';
import './p41-tasks.css';

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
  const [editor, setEditor] = useState<{ task?: Task } | null>(null);
  const [filter, setFilter] = useState('active');
  const rows = data.tasks.filter(
    (row) => filter === 'all' || !['done', 'cancelled'].includes(row.status),
  );
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">把事情记清楚</span>
          <h1>任务清单</h1>
          <p>准备、确认、检查，也可以随时调整待办。</p>
        </div>
        <button className="primary" disabled={busy || !!editor} onClick={() => setEditor({})}>
          <Icon name="plus" size={17} /> 新建任务
        </button>
      </div>
      {editor && (
        <TaskForm
          key={editor.task?.id ?? 'new'}
          task={editor.task}
          mutate={mutate}
          busy={busy}
          onClose={() => setEditor(null)}
        />
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
            <TaskCard
              key={task.id}
              task={task}
              mutate={mutate}
              busy={busy}
              editDisabled={!!editor}
              onEdit={() => setEditor({ task })}
            />
          ))}
        </div>
      )}
    </>
  );
}
function TaskCard({
  task,
  mutate,
  busy,
  editDisabled,
  onEdit,
}: {
  task: Task;
  mutate: Mutate;
  busy: boolean;
  editDisabled: boolean;
  onEdit: () => void;
}) {
  const [minutesOpen, setMinutesOpen] = useState(false);
  const active = !['done', 'cancelled'].includes(task.status);
  return (
    <article className="panel task-card">
      <div className="card-heading">
        <h2>{task.title}</h2>
        <Badge tone={task.status === 'done' ? 'green' : ''}>{states[task.status]}</Badge>
      </div>
      <p className="metadata">
        {timeZoneLabel(task.timeZone)} · {plannedLabel(task)}
      </p>
      {task.status === 'done' && (
        <p className="metadata">
          {task.completedAt
            ? `完成于 ${new Date(task.completedAt).toLocaleString('zh-CN', { timeZone: task.timeZone, hour12: false })}`
            : '历史完成记录，日期未记录'}{' '}
          · 实际用时：{task.actualMinutes == null ? '未记录' : `${task.actualMinutes} 分钟`}
        </p>
      )}
      <div className="checklist">
        {task.checklist.map((text, index) => (
          <label key={index}>
            <input
              type="checkbox"
              checked={task.checked[index]}
              disabled={busy || !active || task.status === 'draft'}
              onChange={() => {
                const checked = [...task.checked];
                checked[index] = !checked[index];
                void mutate('task-update', { id: task.id, revision: task.revision, checked }).catch(
                  () => {},
                );
              }}
            />
            <span>{text}</span>
          </label>
        ))}
      </div>
      <div className="card-footer">
        <SourceList sources={task.sources} />
        <div className="p41-actions">
          {active && (
            <button className="secondary small" disabled={busy || editDisabled} onClick={onEdit}>
              编辑任务
            </button>
          )}
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
            active && (
              <button
                className="secondary small"
                disabled={busy || !task.checked.every(Boolean)}
                onClick={() => setMinutesOpen(true)}
              >
                记录完成
              </button>
            )
          )}
          {task.status === 'done' && (
            <button
              className="text-button"
              disabled={busy}
              onClick={() => setMinutesOpen(!minutesOpen)}
            >
              补记或修改实际用时
            </button>
          )}
          {active && (
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
      {minutesOpen && (task.status === 'done' || (active && task.status !== 'draft')) && (
        <ActualMinutesForm
          task={task}
          mutate={mutate}
          busy={busy || (active && !task.checked.every(Boolean))}
          completion={task.status !== 'done'}
          onSaved={() => setMinutesOpen(false)}
          onCancel={() => setMinutesOpen(false)}
        />
      )}
    </article>
  );
}
