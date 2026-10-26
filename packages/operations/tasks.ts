import { Store } from '../core/store.ts';
import { Learning, type Task } from '../learning/service.ts';

export type TaskInput = {
  title: string;
  timeZone: string;
  dueAt?: string;
  checklist: string[];
  sourceId: string;
  confirmed?: boolean;
};
export class Tasks {
  store: Store;
  learning: Learning;
  constructor(store: Store, learning: Learning) {
    this.store = store;
    this.learning = learning;
  }
  create(scope: string, key: string, input: TaskInput): Task {
    if (!input.timeZone) throw new Error('TIME_ZONE_REQUIRED');
    try {
      new Intl.DateTimeFormat('en', { timeZone: input.timeZone });
    } catch {
      throw new Error('INVALID_TIME_ZONE');
    }
    if (
      !input.title.trim() ||
      input.title.length > 200 ||
      !input.checklist.length ||
      input.checklist.length > 30 ||
      input.checklist.some((text) => !text.trim() || text.length > 300)
    )
      throw new Error('INVALID_TASK');
    if (
      input.dueAt &&
      (!/T.*(?:Z|[+-]\d\d:\d\d)$/.test(input.dueAt) || !Number.isFinite(Date.parse(input.dueAt)))
    )
      throw new Error('EXPLICIT_OFFSET_REQUIRED');
    this.store.get(scope, input.sourceId);
    return this.store.once(
      scope,
      `task:${key}`,
      () =>
        this.store.create(scope, 'task', {
          title: input.title.trim(),
          timeZone: input.timeZone,
          dueAt: input.dueAt,
          checklist: input.checklist,
          checked: input.checklist.map(() => false),
          status: input.confirmed ? 'open' : 'draft',
          sources: [input.sourceId],
          confirmedSuccess: false,
        }) as Task,
    );
  }
  update(
    scope: string,
    id: string,
    revision: number,
    changes: { status?: string; checked?: boolean[]; confirmedSuccess?: boolean },
  ): Task {
    const result = this.store.transaction(() => {
      const task = this.store.get<Task>(scope, id);
      if (task.kind !== 'task') throw new Error('INVALID_TASK');
      if (task.revision !== revision) throw new Error('REVISION_CONFLICT');
      const transitions: Record<string, string[]> = {
        draft: ['open', 'cancelled'],
        open: ['in_progress', 'done', 'cancelled'],
        in_progress: ['done', 'cancelled'],
        done: [],
        cancelled: [],
      };
      if (
        changes.status &&
        changes.status !== task.status &&
        !transitions[task.status]?.includes(changes.status)
      )
        throw new Error('INVALID_TASK_TRANSITION');
      const checked = changes.checked ?? task.checked;
      if (
        checked.length !== task.checklist.length ||
        checked.some((value) => typeof value !== 'boolean')
      )
        throw new Error('INVALID_CHECKLIST');
      const status = changes.status ?? task.status;
      if (status === 'done' && !checked.every(Boolean)) throw new Error('CHECKLIST_INCOMPLETE');
      if (changes.confirmedSuccess && status !== 'done')
        throw new Error('WORKFLOW_NOT_CONFIRMED_SUCCESS');
      const next = this.store.update(
        task,
        {
          ...changes,
          status,
          checked,
          confirmedSuccess: changes.confirmedSuccess ?? task.confirmedSuccess,
        },
        revision,
      );
      if (next.confirmedSuccess && this.learning.enabled(scope))
        this.store.create(scope, 'job', {
          type: 'workflow',
          taskId: id,
          status: 'pending',
          attempts: 0,
        });
      return next;
    });
    this.drain(scope);
    return result;
  }
  drain(scope: string): void {
    if (!this.learning.enabled(scope)) return;
    const jobs = this.store.list<
      import('../core/store.ts').Base & {
        type: string;
        status: string;
        taskId: string;
        attempts: number;
      }
    >(scope, 'job');
    for (const job of jobs.filter((row) => row.type === 'workflow' && row.status === 'pending')) {
      try {
        this.learning.deriveSkill(scope, job.taskId);
        this.store.update(job, { status: 'completed', attempts: job.attempts + 1 });
      } catch {
        this.store.update(job, { status: 'failed', attempts: job.attempts + 1 });
      }
    }
  }
}
