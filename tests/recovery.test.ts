import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync, copyFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { backup } from 'node:sqlite';
import { Store } from '../packages/core/store.ts';
import { Learning, type Task } from '../packages/learning/service.ts';
import { ModelBudget } from '../packages/core/budget.ts';
import { createRecoveryPoint, restoreRecoveryPoint } from '../packages/core/recovery.ts';

test('restore of an older database reapplies current deletion and skill revocation ledger', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'cc-restore-'));
  const original = join(dir, 'business.sqlite');
  let store = new Store(original);
  let learning = new Learning(store);
  try {
    const source = store.source('a', 'precise amount 100.25 USD');
    const memory = learning.remember('a', source.id, 'amount', '100.25 USD', true)!;
    const task = store.create('a', 'task', {
      title: 'flow',
      status: 'done',
      checklist: ['Check one'],
      checked: [true],
      timeZone: 'UTC',
      sources: [source.id],
      confirmedSuccess: true,
    }) as Task;
    const skill = learning.deriveSkill('a', task.id)!;
    const old = join(dir, 'old.sqlite');
    await backup(store.db, old);
    learning.revoke('a', skill.id);
    learning.deleteSource('a', memory.id);
    store.close();
    copyFileSync(old, original);
    store = new Store(original);
    learning = new Learning(store);
    assert.equal(
      learning.activeSkills('a').length,
      0,
      'old active skill must stay revoked after restore',
    );
    assert.equal(
      learning.context('a').facts.length,
      0,
      'deleted memory must not return after restore',
    );
  } finally {
    store.close();
    rmSync(dir, { recursive: true, force: true });
  }
});

test('complete recovery point detects tampering and retains current privacy decisions', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'cc-full-restore-'));
  const data = join(dir, 'data');
  const store = new Store(join(data, 'business.sqlite'));
  const budget = new ModelBudget(join(data, 'model-budget.sqlite'), {
    maxCalls: 6,
    maxInputTokens: 1000,
    maxOutputTokens: 100,
    maxTotalTokens: 1100,
  });
  try {
    const source = store.source('a', 'synthetic fact');
    new Learning(store).remember('a', source.id, 'fact', '100.25 USD', true);
    mkdirSync(join(data, 'harness/a/sessions'), { recursive: true });
    writeFileSync(join(data, 'harness/a/sessions/synthetic.jsonl'), '{"fixture":true}\n');
    const point = await createRecoveryPoint(store, budget, data, join(dir, 'backups'));
    new Learning(store).deleteSource('a', source.id);
    const target = join(dir, 'restored');
    assert.equal(
      restoreRecoveryPoint(point.directory, target, store.ledgerPath).privacyLedgerReapplied,
      true,
    );
    const restored = new Store(join(target, 'business.sqlite'));
    assert.equal(new Learning(restored).context('a').facts.length, 0);
    restored.close();
    writeFileSync(join(point.directory, 'harness/a/sessions/synthetic.jsonl'), 'tampered');
    assert.throws(
      () => restoreRecoveryPoint(point.directory, join(dir, 'tampered'), store.ledgerPath),
      /HASH_MISMATCH/,
    );
  } finally {
    budget.close();
    store.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
