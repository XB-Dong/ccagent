import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Auth } from '../apps/server/security.ts';

test('eight-character configured passwords work while short passwords and brute force remain blocked', () => {
  assert.throws(() => new Auth('short-7'), /AUTH_PASSWORD_TOO_SHORT/);
  const auth = new Auth('demo-key');
  assert.match(auth.login('demo-key'), /^[a-f0-9]{64}$/);
  for (let index = 0; index < 6; index++)
    assert.throws(() => auth.login('wrong-key', 'rate-test'), /LOGIN_FAILED/);
  assert.throws(() => auth.login('demo-key', 'rate-test'), /LOGIN_RATE_LIMITED/);
});
