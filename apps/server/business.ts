import { readOperations } from '../../packages/operations/context.ts';
import { Store, type Base } from '../../packages/core/store.ts';
import {
  Learning,
  type Skill,
  type Memory,
  type Feedback,
  type Task,
} from '../../packages/learning/service.ts';
import { Capture } from '../../packages/learning/capture.ts';
import { Tasks, type TaskChanges } from '../../packages/operations/tasks.ts';
import { Notes } from '../../packages/operations/notes.ts';
import { confirmChange, exportChanges, withdrawFeedback } from '../../packages/learning/export.ts';
import { safeText } from './security.ts';
import { Activities, type Activity } from '../../packages/operations/activities.ts';
import { Reports, type ReportInput } from '../../packages/operations/reports.ts';
import { operate } from './operations.ts';

export class Business {
  store: Store;
  learning: Learning;
  capture: Capture;
  tasks: Tasks;
  dataDir: string;
  activities: Activities;
  reports: Reports;
  notes: Notes;
  constructor(store: Store, dataDir: string) {
    this.store = store;
    this.dataDir = dataDir;
    this.learning = new Learning(store);
    this.capture = new Capture(store, this.learning);
    this.tasks = new Tasks(store, this.learning);
    this.activities = new Activities(store);
    this.reports = new Reports(store);
    this.notes = new Notes(store);
  }
  snapshot(scope: string) {
    this.capture.drain(scope);
    this.tasks.drain(scope);
    this.activities.tick(scope);
    return {
      forecasts: this.store.list(scope, 'forecast'),
      inventories: this.store.list(scope, 'inventory'),
      pools: this.store.list(scope, 'pool'),
      allocations: this.store.list(scope, 'allocation'),
      shipments: this.store.list(scope, 'shipment'),
      adAnalyses: this.store.list(scope, 'adAnalysis'),
      activities: this.store.list(scope, 'activity'),
      reminders: this.store.list(scope, 'reminder'),
      reports: this.store.list(scope, 'report'),
      tasks: this.store.list(scope, 'task'),
      notes: this.store.list(scope, 'note'),
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
    if (action === 'note')
      return this.notes.create(scope, safeText(body.requestId, 100), {
        title: safeText(body.title, 200),
        content: safeText(body.content, 10000),
      });
    if (action === 'note-update')
      return this.notes.update(scope, safeText(body.id, 100), Number(body.revision), {
        title: safeText(body.title, 200),
        content: safeText(body.content, 10000),
      });
    if (action === 'note-delete') {
      const id = safeText(body.id, 100);
      this.notes.remove(scope, id, Number(body.revision));
      return { deleted: id };
    }
    const result = operate(this.store, scope, action, body);
    if (result !== undefined) return result;
    if (action === 'report-preview' || action === 'report-import') {
      const input = body as ReportInput;
      return action === 'report-preview'
        ? this.reports.preview(input)
        : this.reports.import(scope, input);
    }
    if (action === 'activity')
      return this.activities.create(scope, safeText(body.requestId, 100), {
        title: safeText(body.title, 200),
        store: safeText(body.store, 100),
        listing: safeText(body.listing, 100),
        timeZone: safeText(body.timeZone, 100),
        startAt: safeText(body.startAt, 40),
        endAt: safeText(body.endAt, 40),
        leadHours: Number(body.leadHours),
        offerNote: body.offerNote ? safeText(body.offerNote, 1000) : '',
      });
    if (action === 'activity-cancel')
      return this.activities.cancel(scope, safeText(body.id, 100), Number(body.revision));
    if (action === 'activity-observe') {
      const row = this.store.get<Activity>(scope, safeText(body.id, 100));
      if (
        row.kind !== 'activity' ||
        body.confirmed !== true ||
        !(
          (row.status === 'planned' && body.status === 'active') ||
          (row.status === 'active' && body.status === 'restored')
        )
      )
        throw new Error('INVALID_ACTIVITY_STATE');
      return this.store.update(row, { status: String(body.status) }, Number(body.revision));
    }
    if (action === 'reminder-read') {
      const row = this.store.get<Base & { read: boolean }>(scope, safeText(body.id, 100));
      if (row.kind !== 'reminder') throw new Error('NOT_FOUND');
      return this.store.update(row, { read: true }, Number(body.revision));
    }
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
        startAt: body.startAt === undefined ? undefined : safeText(body.startAt, 40),
        endAt: body.endAt === undefined ? undefined : safeText(body.endAt, 40),
        sourceId: source.id,
        confirmed: true,
      });
    }
    if (action === 'task-update') {
      const changes: TaskChanges = {};
      if (body.title !== undefined) changes.title = safeText(body.title, 200);
      if (body.timeZone !== undefined) changes.timeZone = safeText(body.timeZone, 100);
      if (body.checklist !== undefined) {
        if (!Array.isArray(body.checklist)) throw new Error('INVALID_CHECKLIST');
        changes.checklist = body.checklist.map((value) => safeText(value, 300));
      }
      for (const field of ['dueAt', 'startAt', 'endAt'] as const)
        if (body[field] !== undefined)
          changes[field] = body[field] === null ? null : safeText(body[field], 40);
      if (body.status !== undefined) changes.status = safeText(body.status, 30);
      if (body.checked !== undefined) {
        if (!Array.isArray(body.checked)) throw new Error('INVALID_CHECKLIST');
        changes.checked = body.checked as boolean[];
      }
      if (body.confirmedSuccess !== undefined) {
        if (typeof body.confirmedSuccess !== 'boolean') throw new Error('INVALID_TASK');
        changes.confirmedSuccess = body.confirmedSuccess;
      }
      if (body.actualMinutes !== undefined)
        changes.actualMinutes = body.actualMinutes as number | null;
      return this.tasks.update(scope, safeText(body.id, 100), Number(body.revision), changes);
    }
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
    if (action === 'read_operations') return readOperations(this.store, scope, body);
    if (action === 'find_skills') {
      const query = safeText(body.query, 100).toLowerCase();
      const offset = body.offset === undefined ? 0 : Number(body.offset);
      if (!Number.isSafeInteger(offset) || offset < 0) throw new Error('INVALID_OFFSET');
      const rows = this.learning
        .activeSkills(scope)
        .filter((s) => `${s.name} ${s.description} ${s.content}`.toLowerCase().includes(query));
      return {
        skills: rows
          .slice(offset, offset + 6)
          .map(({ id, name, description }) => ({ id, name, description })),
        total: rows.length,
        nextOffset: offset + 6 < rows.length ? offset + 6 : null,
      };
    }
    if (action === 'skills')
      return this.learning
        .activeSkills(scope)
        .slice(0, 6)
        .map(({ id, name, description }) => ({ id, name, description }));
    if (action === 'skill')
      return (
        this.learning
          .activeSkills(scope)
          .find((row) => row.id === body.id && Buffer.byteLength(row.content) <= 6000) ?? null
      );
    if (action === 'list_tasks' || action === 'read_memory') {
      const offset = body.offset === undefined ? 0 : Number(body.offset);
      if (!Number.isSafeInteger(offset) || offset < 0) throw new Error('INVALID_OFFSET');
      if (action === 'list_tasks') {
        const rows = this.store.list<Task>(scope, 'task');
        const tasks = rows
          .slice(offset, offset + 8)
          .map(({ id, title, status, timeZone, dueAt }) => ({
            id,
            title: title.slice(0, 100),
            status,
            timeZone,
            dueAt,
          }));
        return {
          tasks,
          total: rows.length,
          nextOffset: offset + 8 < rows.length ? offset + 8 : null,
        };
      }
      const rows = this.learning.context(scope).facts;
      const facts = rows
        .slice(offset, offset + 4)
        .map(({ id, key, value, sources }) => ({ id, key, value, sources: sources.slice(0, 2) }));
      return {
        facts,
        total: rows.length,
        nextOffset: offset + 4 < rows.length ? offset + 4 : null,
      };
    }
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
