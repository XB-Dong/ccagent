import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { createApp } from '../apps/server/app.ts';

test('P4.1 task editing and manual notes survive restart with scoped HTTP guards', async () => {
  const dir = mkdtempSync(join(tmpdir(), 'cc-p41-api-'));
  const origin = 'http://127.0.0.1:4310';
  const options = {
    dataDir: dir,
    origin,
    password: 'synthetic-p41-password',
    limits: { maxCalls: null, maxInputTokens: null, maxOutputTokens: null, maxTotalTokens: null },
  };
  let app = await createApp(options);
  let url = '';
  let cookie = '';
  async function start() {
    await new Promise<void>((resolve) => app.server.listen(0, '127.0.0.1', resolve));
    url = `http://127.0.0.1:${(app.server.address() as { port: number }).port}`;
    const login = await fetch(`${url}/api/login`, {
      method: 'POST',
      headers: { origin },
      body: JSON.stringify({ password: options.password }),
    });
    assert.equal(login.status, 200);
    cookie = login.headers.get('set-cookie')!.split(';')[0];
  }
  const post = (action: string, body: object, scope = 'p41') =>
    fetch(`${url}/api/actions/${action}`, {
      method: 'POST',
      headers: { origin, cookie, 'x-cc-workspace': scope },
      body: JSON.stringify(body),
    });
  async function save(action: string, body: object) {
    const response = await post(action, body);
    const result = await response.json();
    assert.equal(response.status, 200, JSON.stringify(result));
    return result;
  }
  const snapshot = async (scope = 'p41') =>
    (
      await fetch(`${url}/api/snapshot`, {
        headers: { cookie, 'x-cc-workspace': scope },
      })
    ).json();
  try {
    await start();
    let task = await save('task', {
      title: 'Synthetic original task',
      timeZone: 'Europe/Rome',
      startAt: '2026-10-27T09:00:00+01:00',
      endAt: '2026-10-27T10:00:00+01:00',
      checklist: ['Check first'],
      requestId: 'p41-create-task',
    });
    assert.equal(task.startAt, '2026-10-27T09:00:00+01:00');
    assert.equal(task.endAt, task.dueAt);
    const originalId = task.id;
    task = await save('task-update', {
      id: task.id,
      revision: task.revision,
      title: 'Synthetic edited task',
      checklist: ['Check new step'],
    });
    assert.equal(task.id, originalId);
    assert.equal(task.title, 'Synthetic edited task');
    assert.deepEqual(task.checked, [false]);
    assert.notEqual(
      (
        await post('task-update', {
          id: task.id,
          revision: 1,
          title: 'Stale edit',
        })
      ).status,
      200,
    );
    task = await save('task-update', {
      id: task.id,
      revision: task.revision,
      checked: [true],
    });
    task = await save('task-update', {
      id: task.id,
      revision: task.revision,
      status: 'done',
      actualMinutes: 25,
    });
    assert.ok(Number.isFinite(Date.parse(task.completedAt)));
    assert.equal(task.actualMinutes, 25);
    const completion = task.completedAt;
    task = await save('task-update', {
      id: task.id,
      revision: task.revision,
      actualMinutes: 30,
    });
    assert.equal(task.completedAt, completion);
    assert.equal(task.actualMinutes, 30);
    assert.notEqual(
      (
        await post('task-update', {
          id: task.id,
          revision: task.revision,
          title: 'Cannot rewrite completed flow',
        })
      ).status,
      200,
    );
    assert.equal(
      (
        await post(
          'task-update',
          {
            id: task.id,
            revision: task.revision,
            actualMinutes: 1,
          },
          'other',
        )
      ).status,
      404,
    );
    let note = await save('note', {
      title: 'Synthetic learning',
      content: 'Keep a plain text learning record.',
      requestId: 'p41-note',
    });
    const duplicate = await save('note', {
      title: 'Synthetic learning',
      content: 'Keep a plain text learning record.',
      requestId: 'p41-note',
    });
    assert.equal(duplicate.id, note.id);
    note = await save('note-update', {
      id: note.id,
      revision: note.revision,
      title: 'Synthetic learning edited',
      content: 'Revised learning.',
    });
    assert.notEqual(
      (
        await post('note-update', {
          id: note.id,
          revision: 1,
          title: 'Stale',
          content: 'Stale',
        })
      ).status,
      200,
    );
    assert.equal(
      (await post('note-delete', { id: note.id, revision: note.revision }, 'other')).status,
      404,
    );
    assert.equal(
      (
        await post('note', {
          title: 'Blocked',
          content: `password=${'x'.repeat(24)}`,
          requestId: 'sensitive-note',
        })
      ).status,
      400,
    );
    assert.equal((await snapshot('other')).notes.length, 0);
    await app.close();
    app = await createApp(options);
    await start();
    const data = await snapshot();
    assert.equal(data.tasks[0].id, originalId);
    assert.equal(data.tasks[0].completedAt, completion);
    assert.equal(data.notes[0].id, note.id);
    assert.equal(data.notes[0].title, 'Synthetic learning edited');
    assert.equal(data.memories.length, 0);
    assert.equal(data.skills.length, 0);
    await save('note-delete', { id: note.id, revision: note.revision });
    assert.equal((await snapshot()).notes.length, 0);
    assert.equal(app.budget.snapshot().calls, 0);
  } finally {
    await app.close();
    rmSync(dir, { recursive: true, force: true });
  }
});
