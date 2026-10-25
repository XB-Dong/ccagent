import { Store, type Base } from '../../packages/core/store.ts';
import {
  Learning,
  type Skill,
  type Memory,
  type Feedback,
} from '../../packages/learning/service.ts';
import { Capture } from '../../packages/learning/capture.ts';
import { Tasks, type TaskInput } from '../../packages/operations/tasks.ts';
import { confirmChange, exportChanges, withdrawFeedback } from '../../packages/learning/export.ts';
import { safeText } from './security.ts';

export class Business {
  store: Store;
  learning: Learning;
  capture: Capture;
  tasks: Tasks;
  dataDir: string;
  constructor(store: Store, dataDir: string) {
    this.store = store;
    this.dataDir = dataDir;
    this.learning = new Learning(store);
    this.capture = new Capture(store, this.learning);
    this.tasks = new Tasks(store, this.learning);
  }
  snapshot(scope: string) {
    this.capture.drain(scope);
    this.tasks.drain(scope);
    return {
      tasks: this.store.list(scope, 'task'),
      feedback: this.store.list(scope, 'feedback'),
      memories: this.store.list(scope, 'memory'),
      skills: this.store.list(scope, 'skill'),
      jobs: this.store.list(scope, 'job'),
      sessions: this.store.list(scope, 'conversation'),
      learningEnabled: this.learning.enabled(scope),
      summary: this.store.list(scope, 'summary')[0] ?? null,
    };
  }
  mutate(scope: string, action: string, body: Record<string, unknown>) {
    if (action === 'task') {
      const title = safeText(body.title, 200);
      const checklist = Array.isArray(body.checklist)
        ? body.checklist.map((value) => safeText(value, 300))
        : [];
      const source = this.capture.enqueue(scope, title, safeText(body.requestId, 100));
      return this.tasks.create(scope, source.id, {
        title,
        checklist,
        timeZone: String(body.timeZone ?? ''),
        dueAt: body.dueAt ? String(body.dueAt) : undefined,
        sourceId: source.id,
        confirmed: true,
      });
    }
    if (action === 'task-update')
      return this.tasks.update(scope, safeText(body.id, 100), Number(body.revision), {
        status: typeof body.status === 'string' ? body.status : undefined,
        checked: Array.isArray(body.checked) ? (body.checked as boolean[]) : undefined,
        confirmedSuccess: body.confirmedSuccess === true,
      });
    if (action === 'feedback') {
      const text = safeText(body.text);
      const source = this.capture.enqueue(scope, text, safeText(body.requestId, 100));
      return this.learning.feedback(scope, source.id, {
        text,
        page: typeof body.page === 'string' ? safeText(body.page, 100) : undefined,
        expected:
          typeof body.expected === 'string' && body.expected
            ? safeText(body.expected, 1000)
            : undefined,
        actual:
          typeof body.actual === 'string' && body.actual ? safeText(body.actual, 1000) : undefined,
      });
    }
    if (action === 'feedback-update') {
      if (body.status === 'withdrawn')
        return withdrawFeedback(this.store, scope, safeText(body.id, 100), Number(body.revision));
      const row = this.store.get<Feedback>(scope, safeText(body.id, 100));
      if (
        row.kind !== 'feedback' ||
        !['captured', 'triaged', 'accepted', 'deferred', 'rejected', 'withdrawn'].includes(
          String(body.status),
        )
      )
        throw new Error('INVALID_FEEDBACK_STATE');
      return this.store.update(row, { status: String(body.status) }, Number(body.revision));
    }
    if (action === 'feedback-append') {
      const id = safeText(body.id, 100);
      const text = safeText(body.text, 1000);
      const requestId = safeText(body.requestId, 100);
      return this.store.once(scope, `feedback-append:${requestId}`, () => {
        const feedback = this.store.get<Feedback>(scope, id);
        if (feedback.kind !== 'feedback' || feedback.status === 'withdrawn')
          throw new Error('INVALID_FEEDBACK');
        const source = this.store.source(scope, text);
        return this.store.update(
          feedback,
          {
            sources: [...feedback.sources, source.id],
            amendments: [
              ...(feedback.amendments ?? []),
              { text, sourceId: source.id, createdAt: source.createdAt },
            ],
          },
          Number(body.revision),
        );
      });
    }
    if (action === 'memory') {
      const key = safeText(body.key, 80);
      const value = safeText(body.value, 300);
      const source = this.capture.enqueue(scope, `${key}：${value}`, safeText(body.requestId, 100));
      const memory = this.learning.remember(scope, source.id, key, value, true);
      this.learning.compact(scope);
      return memory;
    }
    if (action === 'delete') {
      const id = safeText(body.id, 100);
      this.learning.deleteSource(scope, id);
      return { deleted: id };
    }
    if (action === 'learning') {
      this.learning.setEnabled(scope, body.enabled === true);
      return { enabled: this.learning.enabled(scope) };
    }
    if (action === 'compact')
      return this.learning.compact(
        scope,
        typeof body.revision === 'number' ? body.revision : undefined,
      );
    if (action === 'skill-revoke') return this.learning.revoke(scope, safeText(body.id, 100));
    if (action === 'skill-confirm') {
      const skill = this.store.get<Skill>(scope, safeText(body.id, 100));
      if (
        skill.kind !== 'skill' ||
        skill.status !== 'waiting_confirmation' ||
        this.learning.validateDraft(skill.steps).length
      )
        throw new Error('SKILL_NOT_VALIDATED');
      return this.store.update(skill, { status: 'active' }, Number(body.revision));
    }
    if (action === 'change-confirm')
      return confirmChange(
        this.store,
        scope,
        safeText(body.id, 100),
        safeText(body.requirementId, 50),
      );
    if (action === 'export') return exportChanges(this.store, scope, this.dataDir);
    throw new Error('NOT_FOUND');
  }
  tool(scope: string, sourceId: string | undefined, action: string, body: Record<string, unknown>) {
    if (action === 'skills')
      return this.learning
        .activeSkills(scope)
        .map(({ id, name, description }) => ({ id, name, description }));
    if (action === 'skill')
      return this.learning.activeSkills(scope).find((row) => row.id === body.id) ?? null;
    if (action === 'list_tasks') return { tasks: this.store.list(scope, 'task') };
    if (action === 'read_memory') return this.learning.context(scope);
    if (action === 'draft_checklist') {
      const skill = this.learning.activeSkills(scope).find((row) => row.id === body.skillId);
      if (!skill || skill.risk !== 'L0') throw new Error('SKILL_REVOKED_OR_UNAVAILABLE');
      return {
        skillId: skill.id,
        version: skill.revision,
        checklist: skill.steps.map((text) => ({ text, checked: false })),
        status: 'draft',
      };
    }
    if (!sourceId) throw new Error('SOURCE_REQUIRED');
    if (action === 'prepare_task') {
      const title = safeText(body.title, 200);
      const checklist = Array.isArray(body.checklist)
        ? body.checklist.map((value) => safeText(value, 300))
        : [];
      return this.tasks.create(scope, `${sourceId}:${title}`, {
        title,
        checklist,
        timeZone: String(body.timeZone ?? ''),
        dueAt: body.dueAt ? String(body.dueAt) : undefined,
        sourceId,
      });
    }
    if (action === 'capture_feedback')
      return (
        this.learning.feedback(scope, sourceId, {
          text: safeText(body.text),
          expected: typeof body.expected === 'string' ? safeText(body.expected, 1000) : undefined,
          actual: typeof body.actual === 'string' ? safeText(body.actual, 1000) : undefined,
        }) ?? { status: 'learning_paused' }
      );
    throw new Error('TOOL_FORBIDDEN');
  }
}
