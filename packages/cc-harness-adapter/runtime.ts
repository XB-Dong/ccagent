import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { DeepSeekHarness } from '@deepseek-ai/dsh-sdk-client';
import { operatorProfile } from './profile.ts';

export class OperatorRuntime {
  harness: DeepSeekHarness;
  home: string;
  running = false;
  sessions = new Set<string>();
  constructor(
    dataDir: string,
    scope: string,
    internalURL: string,
    token: string,
    modelURL = `${internalURL}/model`,
    additionalPatches: string[] = [],
  ) {
    this.home = join(dataDir, 'harness', scope);
    const workspace = join(this.home, 'workspace');
    mkdirSync(workspace, { recursive: true });
    const patch = join(this.home, 'cc.cordis.yml');
    writeFileSync(patch, `${JSON.stringify(operatorProfile(modelURL), null, 2)}\n`);
    const env = Object.fromEntries(
      Object.entries(process.env).filter(([key]) =>
        /^(PATH|PATHEXT|SYSTEMROOT|WINDIR|COMSPEC|TEMP|TMP|USERPROFILE|APPDATA|LOCALAPPDATA)$/i.test(
          key,
        ),
      ),
    );
    env.CC_INTERNAL_URL = internalURL;
    env.CC_RUNTIME_TOKEN = token;
    this.harness = new DeepSeekHarness({
      profile: 'sdk-minimal',
      patches: [patch, ...additionalPatches],
      dshHome: this.home,
      cwd: workspace,
      processCwd: workspace,
      env,
      provider: 'deepseek-official',
      model: 'deepseek-flash',
      maxTokens: 512,
      initializeTimeoutMs: 15000,
      requestTimeoutMs: 90000,
      disposeEofGraceMs: 1000,
    });
  }
  async run(text: string, sessionId?: string, onNotification?: (notification: unknown) => void) {
    if (this.running) throw new Error('SESSION_BUSY');
    this.running = true;
    try {
      if (sessionId && !this.sessions.has(sessionId)) {
        await this.harness.resumeSession(sessionId);
        this.sessions.add(sessionId);
      }
      const result = await this.harness.run(text, { sessionId, onNotification });
      this.sessions.add(result.sessionId);
      return result;
    } finally {
      this.running = false;
    }
  }
  async close(): Promise<void> {
    await this.harness.close();
  }
}
