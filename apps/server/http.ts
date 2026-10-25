import type { IncomingMessage, ServerResponse } from 'node:http';
export async function readBody(req: IncomingMessage): Promise<Record<string, unknown>> {
  let raw = '';
  let size = 0;
  for await (const chunk of req) {
    size += Buffer.byteLength(chunk);
    if (size > 250000) throw new Error('BODY_TOO_LARGE');
    raw += chunk;
  }
  try {
    const value = JSON.parse(raw || '{}');
    if (!value || Array.isArray(value) || typeof value !== 'object') throw new Error();
    return value;
  } catch {
    throw new Error('INVALID_JSON');
  }
}
export function json(res: ServerResponse, value: unknown, status = 200): void {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  });
  res.end(JSON.stringify(value));
}
export function failure(res: ServerResponse, error: unknown): void {
  const message =
    error instanceof Error && /^[A-Z][A-Z0-9_]+$/.test(error.message)
      ? error.message
      : 'INTERNAL_ERROR';
  const status =
    message === 'NOT_FOUND'
      ? 404
      : message === 'REVISION_CONFLICT' || message === 'SESSION_BUSY'
        ? 409
        : message.includes('BUDGET')
          ? 429
          : message === 'MODEL_OFFLINE'
            ? 503
            : message === 'INTERNAL_ERROR'
              ? 500
              : 400;
  if (!res.headersSent) json(res, { error: message }, status);
  else res.end(`event: error\ndata: ${JSON.stringify({ error: message })}\n\n`);
}
