import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, readdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Store } from '../packages/core/store.ts';
import { Learning, type Task } from '../packages/learning/service.ts';
import { Capture } from '../packages/learning/capture.ts';
import { confirmChange, exportChanges, withdrawFeedback } from '../packages/learning/export.ts';

test('privacy deletion closes derived tasks, changes, exports and replay without clearing unrelated receipts', () => {
  const dir = mkdtempSync(join(tmpdir(), 'cc-closure-'));
  const store = new Store(join(dir, 'business.sqlite'));
  const learning = new Learning(store);
  const capture = new Capture(store, learning);
  try {
    const source = capture.enqueue('a', 'Synthetic private feedback', 'source-a');
    const unrelated = capture.enqueue('a', 'Unrelated fact', 'source-b');
    const feedback = learning.feedback('a', source.id, { text: source.text })!;
    store.create('a', 'task', { title: 'Synthetic private checklist', sources: [source.id] });
    confirmChange(store, 'a', feedback.id, 'CC-FEEDBACK-001');
    exportChanges(store, 'a', dir);
    learning.deleteSource('a', feedback.id);
    assert.equal(store.list('a', 'task').length, 0);
    assert.equal(store.list('a', 'change').length, 0);
    assert.equal(readdirSync(join(dir, 'exports/a')).length, 0);
    assert.throws(() => capture.enqueue('a', source.text, source.id), /REVOKED|DELETED/);
    assert.equal(capture.enqueue('a', unrelated.text, unrelated.id).id, unrelated.id);
  } finally {
    store.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
test('confirmed requirement withdrawal exports a stable append-only withdrawal event', () => {
  const dir = mkdtempSync(join(tmpdir(), 'cc-withdraw-'));
  const store = new Store(join(dir, 'business.sqlite'));
  try {
    const source = store.source('a', 'Synthetic suggestion');
    const feedback = new Learning(store).feedback('a', source.id, { text: source.text })!;
    const change = confirmChange(store, 'a', feedback.id, 'CC-FEEDBACK-001');
    withdrawFeedback(store, 'a', feedback.id, feedback.revision);
    withdrawFeedback(store, 'a', feedback.id, feedback.revision);
    const pack = exportChanges(store, 'a', dir);
    assert.equal(pack.changes.length, 0);
    assert.equal(pack.withdrawals.length, 1);
    assert.equal(pack.withdrawals[0].withdrawnChangeId, change.changeId);
  } finally {
    store.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
