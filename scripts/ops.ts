import { existsSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { Store } from '../packages/core/store.ts';
import { ModelBudget } from '../packages/core/budget.ts';
import { createRecoveryPoint, restoreRecoveryPoint } from '../packages/core/recovery.ts';

const args = process.argv.slice(2);
const mode = args[0];
function argument(name: string): string { const value = args[args.indexOf(name) + 1]; if (!args.includes(name) || !value) throw new Error('MISSING_OPERATION_ARGUMENT'); return resolve(value); }
const dataDir = resolve(process.env.CC_DATA_DIR ?? '../.ccagent-support/product-data');
const budgetPath = resolve(process.env.CC_BUDGET_PATH ?? join(dataDir, 'model-budget.sqlite'));
if (mode === 'restore') {
  const isolated = args.includes('--isolated');
  if (!isolated) {
    if (process.platform !== 'linux') throw new Error('PRODUCTION_RESTORE_REQUIRES_SERVICE_HOST');
    if (spawnSync('systemctl', ['is-active', '--quiet', 'ccagent']).status !== 3) throw new Error('STOP_SERVICE_BEFORE_RESTORE');
  }
  const target = argument('--target');
  if (target === dataDir) throw new Error('RESTORE_TO_NEW_DIRECTORY_REQUIRED');
  console.log(JSON.stringify(restoreRecoveryPoint(argument('--backup'), target, join(dataDir, 'privacy-ledger.jsonl'), budgetPath)));
} else if (mode === 'backup') {
  if (process.platform === 'linux' && spawnSync('systemctl', ['is-active', '--quiet', 'ccagent']).status === 0) throw new Error('USE_AUTHENTICATED_CHECKPOINT_WHILE_RUNNING');
  if (!existsSync(join(dataDir, 'business.sqlite'))) throw new Error('NO_BUSINESS_DATABASE');
  const store = new Store(join(dataDir, 'business.sqlite'));
  const budget = new ModelBudget(budgetPath, { maxCalls: 6, maxInputTokens: 24000, maxOutputTokens: 4096, maxTotalTokens: 28096 });
  try { const result = await createRecoveryPoint(store, budget, dataDir, argument('--output')); console.log(JSON.stringify({ directory: result.directory, files: result.manifest.files.length })); }
  finally { budget.close(); store.close(); }
} else {
  throw new Error('USE_BACKUP_OR_RESTORE_OPERATION');
}
