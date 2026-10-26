import assert from 'node:assert/strict';
import test from 'node:test';
import {
  localTimeToInstant,
  localFields,
  timeOptions,
  calendarDay,
} from '../apps/web/task-time.ts';

test('Rome local plans use correct winter and summer offsets', () => {
  assert.equal(
    localTimeToInstant('2026-01-20', '10:15', 'Europe/Rome'),
    '2026-01-20T10:15:00+01:00',
  );
  assert.equal(
    localTimeToInstant('2026-07-20', '10:15', 'Europe/Rome'),
    '2026-07-20T10:15:00+02:00',
  );
  assert.equal(
    localTimeToInstant('2026-10-27', '10:00', 'Asia/Shanghai'),
    '2026-10-27T10:00:00+08:00',
  );
});

test('DST gaps and folds reject guessing with actionable Chinese guidance', () => {
  assert.throws(() => localTimeToInstant('2026-03-29', '02:30', 'Europe/Rome'), /不存在.*重新选择/);
  assert.throws(
    () => localTimeToInstant('2026-10-25', '02:30', 'Europe/Rome'),
    /出现两次.*重新选择/,
  );
});

test('invalid or incomplete calendar input is rejected instead of normalizing', () => {
  for (const date of ['2026-02-30', '2026-13-01', '2026-04-31', '', '26-01-01']) {
    assert.throws(() => localTimeToInstant(date, '10:00', 'Europe/Rome'), /日期/);
  }
  assert.throws(() => localTimeToInstant('2026-01-01', '24:00', 'Europe/Rome'), /时间/);
  assert.throws(() => localTimeToInstant('2026-01-01', '10:00', 'invalid'), /时区/);
  assert.equal(
    localTimeToInstant('2028-02-29', '00:00', 'Europe/Rome'),
    '2028-02-29T00:00:00+01:00',
  );
});

test('old instants display in their zone and non-quarter minutes remain selectable', () => {
  assert.deepEqual(localFields('2026-07-20T08:07:32Z', 'Europe/Rome'), {
    date: '2026-07-20',
    time: '10:07',
  });
  assert.deepEqual(localFields(undefined, 'Europe/Rome'), { date: '', time: '' });
  const options = timeOptions('10:07');
  assert.equal(options.length, 97);
  assert.ok(options.includes('10:07'));
  assert.equal(options.indexOf('10:07'), options.indexOf('10:00') + 1);
});

test('calendar date uses completed instant in selected zone, never update time', () => {
  assert.equal(calendarDay('2026-10-26T23:30:00Z', 'Asia/Shanghai'), '2026-10-27');
  assert.equal(calendarDay('2026-10-26T23:30:00Z', 'America/Los_Angeles'), '2026-10-26');
  assert.equal(calendarDay(undefined, 'Europe/Rome'), undefined);
});

test('editing a title preserves old timestamps and explicit clearing sends null', async () => {
  const { scheduleChanges } = await import('../apps/web/task-time.ts');
  const old = { timeZone: 'Europe/Rome', dueAt: '2026-07-20T08:07:32Z' };
  assert.deepEqual(
    scheduleChanges(
      old,
      'Europe/Rome',
      { date: '', time: '' },
      { date: '2026-07-20', time: '10:07' },
    ),
    {},
  );
  assert.deepEqual(
    scheduleChanges(old, 'Europe/Rome', { date: '', time: '' }, { date: '', time: '' }),
    { endAt: null },
  );
  assert.deepEqual(
    scheduleChanges(undefined, 'Europe/Rome', { date: '', time: '' }, { date: '', time: '' }),
    {},
  );
});

test('replacing a schedule converts intent and checks order against untouched old end', async () => {
  const { scheduleChanges } = await import('../apps/web/task-time.ts');
  const old = { timeZone: 'Europe/Rome', dueAt: '2026-07-20T08:07:32Z' };
  assert.throws(
    () =>
      scheduleChanges(
        old,
        'Europe/Rome',
        { date: '2026-07-20', time: '11:00' },
        { date: '2026-07-20', time: '10:07' },
      ),
    /结束时间/,
  );
  assert.deepEqual(
    scheduleChanges(
      old,
      'Asia/Shanghai',
      { date: '', time: '' },
      { date: '2026-07-20', time: '10:07' },
    ),
    { endAt: '2026-07-20T10:07:00+08:00' },
  );
});
