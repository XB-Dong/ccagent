import { createServer } from 'node:http';
import { writeFileSync } from 'node:fs';

export const name = 'cc-compaction-offline-probe';
export const inject = ['agents', 'compaction'];
export function apply(ctx, config) {
  const server = createServer(async (_req, res) => {
    try {
      const agent = ctx.agents.roots()[0];
      const result = await ctx.compaction.compactNow(agent, new AbortController().signal);
      res.end(JSON.stringify({ result }));
    } catch (error) {
      res.writeHead(500);
      res.end(JSON.stringify({ error: error.message }));
    }
  });
  server.listen(0, '127.0.0.1', () =>
    writeFileSync(config.portFile, String(server.address().port)),
  );
  ctx.on('dispose', () => new Promise((resolve) => server.close(resolve)));
}
