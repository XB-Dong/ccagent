import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import type { IncomingMessage } from 'node:http';

export { safeText } from '../../packages/core/validation.ts';
export function scopeOf(req: IncomingMessage): string {
  const scope = String(req.headers['x-cc-workspace'] ?? 'main');
  if (!/^[a-z0-9][a-z0-9-]{0,39}$/.test(scope)) throw new Error('INVALID_SCOPE');
  return scope;
}
export class Auth {
  salt = randomBytes(16);
  passwordHash: Buffer;
  sessions = new Map<string, number>();
  attempts = new Map<string, { count: number; until: number }>();
  constructor(password: string) {
    if (password.length < 12) throw new Error('AUTH_PASSWORD_TOO_SHORT');
    this.passwordHash = scryptSync(password, this.salt, 64);
  }
  login(password: unknown, address = 'local'): string {
    let attempt = this.attempts.get(address);
    if (!attempt || attempt.until < Date.now()) {
      attempt = { count: 0, until: Date.now() + 900000 };
      this.attempts.set(address, attempt);
    }
    if (attempt.count >= 6) throw new Error('LOGIN_RATE_LIMITED');
    attempt.count++;
    if (
      typeof password !== 'string' ||
      password.length > 200 ||
      !timingSafeEqual(scryptSync(password, this.salt, 64), this.passwordHash)
    )
      throw new Error('LOGIN_FAILED');
    attempt.count = 0;
    const token = randomBytes(32).toString('hex');
    this.sessions.set(createHash('sha256').update(token).digest('hex'), Date.now() + 8 * 3600000);
    return token;
  }
  authenticated(req: IncomingMessage): boolean {
    const token = req.headers.cookie?.match(/(?:^|;\s*)cc_session=([a-f0-9]{64})(?:;|$)/)?.[1];
    if (!token) return false;
    const key = createHash('sha256').update(token).digest('hex');
    const expires = this.sessions.get(key);
    if (expires && expires > Date.now()) return true;
    this.sessions.delete(key);
    return false;
  }
  logout(req: IncomingMessage): void {
    const token = req.headers.cookie?.match(/(?:^|;\s*)cc_session=([a-f0-9]{64})/)?.[1];
    if (token) this.sessions.delete(createHash('sha256').update(token).digest('hex'));
  }
}
