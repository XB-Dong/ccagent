import { Learning, type Feedback } from './service.ts';
import { Store, digest, type Base } from '../core/store.ts';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

type Change = Base & {
  feedbackId: string;
  requirementId: string;
  text: string;
  status: string;
  changeId: string;
};
export function confirmChange(
  store: Store,
  scope: string,
  feedbackId: string,
  requirementId: string,
): Change {
  if (!/^CC-[A-Z]+-\d{3}$/.test(requirementId)) throw new Error('INVALID_REQUIREMENT_ID');
  const feedback = store.get<Feedback>(scope, feedbackId);
  if (feedback.kind !== 'feedback' || feedback.status === 'withdrawn')
    throw new Error('INVALID_FEEDBACK');
  return store.once(
    scope,
    `change:${feedbackId}`,
    () =>
      store.create(scope, 'change', {
        feedbackId,
        requirementId,
        text: feedback.text,
        status: 'confirmed',
        changeId: `cc-change-${digest([scope, feedbackId]).slice(0, 20)}`,
      }) as Change,
  );
}
export function exportChanges(store: Store, scope: string, dataDir: string) {
  const changes = store
    .list<Change>(scope, 'change')
    .filter(
      (row) =>
        row.status === 'confirmed' &&
        !store.isDeleted(scope, row.feedbackId) &&
        store.get<Feedback>(scope, row.feedbackId).status !== 'withdrawn',
    );
  if (
    changes.some((row) =>
      /(?:sk-[a-z\d]{12}|password\s*[:=]|api.?key\s*[:=]|cookie\s*[:=])/i.test(row.text),
    )
  )
    throw new Error('EXPORT_REDACTION_REQUIRED');
  const date = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Shanghai' }).format(new Date());
  const withdrawals = store.list<
    Base & {
      changeId: string;
      withdrawnChangeId: string;
      feedbackId: string;
      requirementId: string;
    }
  >(scope, 'requirement-withdrawal');
  const batchId = digest([
    changes.map((row) => [row.changeId, row.revision]),
    withdrawals.map((row) => row.changeId),
  ]);
  const pack = {
    schemaVersion: '1.0',
    exportBatchId: batchId,
    generatedAt: new Date().toISOString(),
    date,
    timeZone: 'Asia/Shanghai',
    redactionStatus: 'rule_checked_manual_review_required',
    changes,
    withdrawals,
  };
  const markdown = `# ${date} · cc 需求审阅包\n\n自动规则检查后仍须人工脱敏审核；产品不会自动更新代码仓库。\n\n${changes.map((row) => `## ${row.requirementId}\n\nchangeId: ${row.changeId}\n\n${row.text}\n\n来源：${row.feedbackId}\n`).join('\n')}\n${withdrawals.map((row) => `## 撤回 · ${row.requirementId}\n\nchangeId: ${row.changeId}\n\n撤回原变更：${row.withdrawnChangeId}\n\ncc 已明确撤回该建议，请追加撤回记录，保留原历史。\n`).join('\n')}`;
  const directory = join(dataDir, 'exports', scope);
  mkdirSync(directory, { recursive: true });
  writeFileSync(join(directory, `${batchId}.json`), JSON.stringify(pack, null, 2));
  writeFileSync(join(directory, `${batchId}.md`), markdown);
  return { ...pack, markdown };
}
export function withdrawFeedback(store: Store, scope: string, id: string, revision: number) {
  return store.once(scope, `withdraw-feedback:${id}`, () => {
    const feedback = store.get<Feedback>(scope, id);
    if (feedback.kind !== 'feedback') throw new Error('INVALID_FEEDBACK');
    const next = store.update(feedback, { status: 'withdrawn' }, revision);
    for (const change of store
      .list<Change>(scope, 'change')
      .filter((row) => row.feedbackId === id && row.status === 'confirmed')) {
      store.update(change, { status: 'withdrawn' });
      store.create(scope, 'requirement-withdrawal', {
        feedbackId: id,
        requirementId: change.requirementId,
        withdrawnChangeId: change.changeId,
        changeId: `cc-withdraw-${digest([scope, change.id]).slice(0, 20)}`,
      });
    }
    return next;
  });
}
