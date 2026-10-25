import { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'node:crypto';

export type Limits = {
  maxCalls: number;
  maxInputTokens: number;
  maxOutputTokens: number;
  maxTotalTokens: number;
};
export type Usage = { inputTokens: number; outputTokens: number };

export class ModelBudget {
  db: DatabaseSync;
  limits: Limits;
  constructor(path: string, limits: Limits) {
    if (Object.values(limits).some((value) => !Number.isSafeInteger(value) || value <= 0)) {
      throw new Error('INVALID_MODEL_BUDGET');
    }
    this.db = new DatabaseSync(path);
    this.limits = limits;
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000;
      CREATE TABLE IF NOT EXISTS model_requests (
        id TEXT PRIMARY KEY, input_tokens INTEGER NOT NULL, output_tokens INTEGER NOT NULL,
        settled INTEGER NOT NULL DEFAULT 0, usage_verified INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );`);
  }
  reserve(inputTokens: number, outputTokens: number): string {
    if (
      ![inputTokens, outputTokens].every((value) => Number.isSafeInteger(value) && value >= 0) ||
      outputTokens === 0
    ) {
      throw new Error('INVALID_TOKEN_RESERVATION');
    }
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const used = this.snapshot();
      if (
        used.calls + 1 > this.limits.maxCalls ||
        used.inputTokens + inputTokens > this.limits.maxInputTokens ||
        used.outputTokens + outputTokens > this.limits.maxOutputTokens ||
        used.inputTokens + used.outputTokens + inputTokens + outputTokens >
          this.limits.maxTotalTokens
      ) {
        throw new Error('MODEL_BUDGET_EXHAUSTED');
      }
      const id = randomUUID();
      this.db
        .prepare('INSERT INTO model_requests (id,input_tokens,output_tokens) VALUES (?,?,?)')
        .run(id, inputTokens, outputTokens);
      this.db.exec('COMMIT');
      return id;
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }
  settle(id: string, usage?: Usage): void {
    if (
      usage &&
      !Object.values(usage).every((value) => Number.isSafeInteger(value) && value >= 0)
    ) {
      throw new Error('INVALID_MODEL_USAGE');
    }
    if (usage) {
      this.db
        .prepare(
          'UPDATE model_requests SET input_tokens=?,output_tokens=?,settled=1,usage_verified=1 WHERE id=? AND settled=0',
        )
        .run(usage.inputTokens, usage.outputTokens, id);
    } else {
      // A failed or interrupted request might still have been billed.
      this.db.prepare('UPDATE model_requests SET settled=1 WHERE id=? AND settled=0').run(id);
    }
  }
  snapshot(): Usage & { calls: number } {
    return {
      ...this.db
        .prepare(
          'SELECT COUNT(*) AS calls, COALESCE(SUM(input_tokens),0) AS inputTokens, COALESCE(SUM(output_tokens),0) AS outputTokens FROM model_requests',
        )
        .get(),
    } as Usage & { calls: number };
  }
  close(): void {
    this.db.close();
  }
}
