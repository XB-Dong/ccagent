import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Store } from '../packages/core/store.ts';
import { Reports, type ReportInput } from '../packages/operations/reports.ts';
test('CSV mapping preserves quoted listing, rejects missing/invalid values and imports a batch idempotently', () => {
  const dir = mkdtempSync(join(tmpdir(), 'cc-reports-'));
  const store = new Store(join(dir, 'business.sqlite'));
  const reports = new Reports(store);
  try {
    const input: ReportInput = {
      kind: 'sales',
      store: '合成店',
      site: 'US',
      asOf: '2026-10-26',
      mapping: { date: '日期', listing: '链接', units: '销量' },
      csv: '日期,链接,销量\r\n2026-10-25,"A,""B""",5\r\n',
    };
    assert.deepEqual(reports.preview(input).rows, [
      { date: '2026-10-25', listing: 'A,"B"', units: 5 },
    ]);
    assert.equal(store.list('a', 'report').length, 0);
    const first = reports.import('a', input);
    assert.equal(first.reportKind, 'sales');
    assert.equal(reports.import('a', input).id, first.id);
    assert.equal(reports.import('b', input).scope, 'b');
    const two = { ...input, csv: '日期,链接,销量\n2026-10-24,B,2\n2026-10-25,A,3' };
    const reversed = { ...two, csv: '日期,链接,销量\n2026-10-25,A,3\n2026-10-24,B,2' };
    assert.equal(reports.import('a', two).id, reports.import('a', reversed).id);
    assert.throws(
      () => reports.preview({ ...input, csv: '日期,链接,销量\n,,\n2026-10-25,A,3' }),
      /MISSING_VALUE/,
    );
    assert.throws(
      () => reports.preview({ ...input, csv: '日期,链接,销量\n2026-10-25,A,' }),
      /MISSING_VALUE/,
    );
    assert.throws(
      () => reports.preview({ ...input, csv: '日期,链接,销量\n2026-02-30,A,2' }),
      /INVALID_DATE/,
    );
    assert.throws(
      () => reports.preview({ ...input, csv: '日期,链接,销量\n2026-10-25,A,2\n2026-10-25,A,3' }),
      /DUPLICATE_ROW/,
    );
    assert.throws(
      () => reports.preview({ ...input, csv: '日期,链接,销量\n2026-10-25,"A,2' }),
      /INVALID_CSV/,
    );
    assert.throws(
      () => reports.preview({ ...input, csv: '日期,链接,销量\n2026-10-25,A,-2' }),
      /INVALID_NUMBER/,
    );
  } finally {
    store.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
