import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { resolve, join, extname } from 'node:path';
import { Store } from '../../packages/core/store.ts';
import { ModelBudget, type Limits } from '../../packages/core/budget.ts';
import { forwardModel } from '../../packages/cc-harness-adapter/gateway.ts';
import { Auth, scopeOf } from './security.ts';
import { readBody, json, failure } from './http.ts';
import { Business } from './business.ts';
import { Chat } from './chat.ts';
import { createRecoveryPoint } from '../../packages/core/recovery.ts';

export type AppOptions = {
  dataDir: string;
  password: string;
  origin: string;
  apiKey?: string;
  live?: boolean;
  secure?: boolean;
  limits: Limits;
  budgetPath?: string;
  modelTransport?: typeof fetch;
};
export async function createApp(options: AppOptions) {
  let sourceSha: string | null = null;
  try {
    const value = JSON.parse(readFileSync('release-manifest.json', 'utf-8')).sourceSha;
    if (/^[a-f0-9]{40}$/.test(value)) sourceSha = value;
  } catch {}
  const store = new Store(join(options.dataDir, 'business.sqlite'));
  const budget = new ModelBudget(
    options.budgetPath ?? join(options.dataDir, 'model-budget.sqlite'),
    options.limits,
  );
  const business = new Business(store, options.dataDir);
  const auth = new Auth(options.password);
  const chat = new Chat(business, options.live === true && !!options.apiKey);
  let maintenance = false;
  const activeChats = new Set<Promise<void>>();
  async function checkpoint() {
    if (maintenance) throw new Error('MAINTENANCE_IN_PROGRESS');
    maintenance = true;
    try {
      await chat.close();
      await Promise.allSettled([...activeChats]);
      return await createRecoveryPoint(
        store,
        budget,
        options.dataDir,
        join(options.dataDir, 'backups'),
      );
    } finally {
      maintenance = false;
    }
  }
  async function internal(req: IncomingMessage, res: ServerResponse) {
    try {
      const token =
        String(req.headers.authorization ?? '').replace(/^Bearer /, '') ||
        String(req.headers['x-api-key'] ?? '');
      const handle = chat.byToken(token);
      const path = req.url ?? '';
      if (req.method !== 'POST') throw new Error('METHOD_FORBIDDEN');
      const body = await readBody(req);
      if (path === '/model/v1/messages') {
        await forwardModel(req, res, body, budget, options.apiKey, options.modelTransport);
        return;
      }
      if (!path.startsWith('/tools/')) throw new Error('TOOL_FORBIDDEN');
      json(res, business.tool(handle.scope, handle.sourceId, path.slice(7), body));
    } catch (error) {
      failure(res, error);
    }
  }
  const internalServer = createServer((req, res) => {
    void internal(req, res);
  });
  await new Promise<void>((resolve) => internalServer.listen(0, '127.0.0.1', resolve));
  chat.internalURL = `http://127.0.0.1:${(internalServer.address() as { port: number }).port}`;
  async function route(req: IncomingMessage, res: ServerResponse) {
    res.setHeader('x-content-type-options', 'nosniff');
    res.setHeader('referrer-policy', 'no-referrer');
    res.setHeader(
      'content-security-policy',
      "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'self'",
    );
    try {
      const url = new URL(req.url ?? '/', 'http://localhost');
      if (url.pathname === '/health') {
        json(res, { status: 'ok', version: '0.1.0', harness: '0.2.1-rc.3', sourceSha });
        return;
      }
      if (url.pathname.startsWith('/api/')) {
        if (req.method !== 'GET' && req.headers.origin !== options.origin) {
          json(res, { error: 'ORIGIN_FORBIDDEN' }, 403);
          return;
        }
        if (url.pathname === '/api/login' && req.method === 'POST') {
          const body = await readBody(req);
          const token = auth.login(body.password, req.socket.remoteAddress);
          res.setHeader(
            'set-cookie',
            `cc_session=${token}; HttpOnly; SameSite=Strict; Path=/; Max-Age=28800${options.secure ? '; Secure' : ''}`,
          );
          json(res, { authenticated: true });
          return;
        }
        if (!auth.authenticated(req)) {
          json(res, { error: 'AUTH_REQUIRED' }, 401);
          return;
        }
        const scope = scopeOf(req);
        if (maintenance && req.method !== 'GET') throw new Error('MAINTENANCE_IN_PROGRESS');
        if (url.pathname === '/api/status' && req.method === 'GET') {
          json(res, {
            authenticated: true,
            live: chat.live,
            syntheticModel: !!options.modelTransport,
            modelState: !chat.live
              ? 'disabled'
              : budget.snapshot().calls >= budget.limits.maxCalls ||
                  budget.snapshot().inputTokens >= budget.limits.maxInputTokens ||
                  budget.snapshot().outputTokens >= budget.limits.maxOutputTokens ||
                  budget.snapshot().inputTokens + budget.snapshot().outputTokens >=
                    budget.limits.maxTotalTokens
                ? 'budget_exhausted'
                : chat.lastFailure && (!chat.lastSuccess || chat.lastFailure > chat.lastSuccess)
                  ? 'last_failed'
                  : chat.lastSuccess
                    ? 'last_succeeded'
                    : 'enabled_unverified',
            lastSuccess: chat.lastSuccess,
            lastFailure: chat.lastFailure,
            scope,
            budget: { used: budget.snapshot(), limits: budget.limits },
            version: '0.1.0',
          });
          return;
        }
        if (url.pathname === '/api/snapshot' && req.method === 'GET') {
          json(res, business.snapshot(scope));
          return;
        }
        if (url.pathname === '/api/logout' && req.method === 'POST') {
          auth.logout(req);
          res.setHeader('set-cookie', 'cc_session=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');
          json(res, { authenticated: false });
          return;
        }
        if (url.pathname === '/api/chat' && req.method === 'POST') {
          const pending = chat.send(scope, await readBody(req), res);
          activeChats.add(pending);
          try {
            await pending;
          } finally {
            activeChats.delete(pending);
          }
          return;
        }
        if (url.pathname === '/api/actions/backup' && req.method === 'POST') {
          json(res, await checkpoint());
          return;
        }
        if (url.pathname === '/api/cancel' && req.method === 'POST') {
          await chat.cancel(scope);
          json(res, { status: 'cancelled' });
          return;
        }
        if (url.pathname.startsWith('/api/actions/') && req.method === 'POST') {
          if (url.pathname === '/api/actions/delete') await chat.cancel(scope);
          json(
            res,
            business.mutate(scope, url.pathname.slice(13), await readBody(req)) ?? {
              status: 'learning_paused',
            },
          );
          return;
        }
        json(res, { error: 'NOT_FOUND' }, 404);
        return;
      }
      if (!['GET', 'HEAD'].includes(req.method ?? '')) throw new Error('METHOD_FORBIDDEN');
      const root = resolve('dist');
      let file = resolve(root, `.${decodeURIComponent(url.pathname)}`);
      if (!file.startsWith(root + '/') && !file.startsWith(root + '\\') && file !== root)
        throw new Error('NOT_FOUND');
      if (!existsSync(file) || statSync(file).isDirectory()) file = join(root, 'index.html');
      if (!existsSync(file)) {
        json(res, { error: 'WEB_BUILD_REQUIRED' }, 503);
        return;
      }
      const contentTypes: Record<string, string> = {
        '.html': 'text/html; charset=utf-8',
        '.js': 'text/javascript',
        '.css': 'text/css',
        '.svg': 'image/svg+xml',
      };
      res.setHeader('content-type', contentTypes[extname(file)] ?? 'application/octet-stream');
      res.setHeader(
        'cache-control',
        extname(file) === '.html' ? 'no-cache' : 'public,max-age=3600',
      );
      res.end(req.method === 'HEAD' ? '' : readFileSync(file));
    } catch (error) {
      failure(res, error);
    }
  }
  const server = createServer((req, res) => {
    void route(req, res);
  });
  const worker = setInterval(() => {
    if (maintenance) return;
    for (const row of store.db.prepare('SELECT DISTINCT scope FROM entities').all()) {
      const scope = String(row.scope);
      business.capture.drain(scope);
      business.tasks.drain(scope);
      business.activities.tick(scope);
    }
  }, 3000);
  worker.unref();
  return {
    server,
    checkpoint,
    store,
    business,
    chat,
    budget,
    async close() {
      clearInterval(worker);
      await chat.close();
      await Promise.allSettled([...activeChats]);
      await Promise.allSettled([...activeChats]);
      await Promise.all([
        new Promise<void>((resolve) => server.close(() => resolve())),
        new Promise<void>((resolve) => internalServer.close(() => resolve())),
      ]);
      budget.close();
      store.close();
    },
  };
}
