import { modelLabel, type Snapshot, type Status } from './api.ts';
import { Badge } from './components.tsx';
import type { Mutate } from './TasksPage.tsx';

export function SettingsPage({
  data,
  status,
  busy,
  mutate,
  logout,
}: {
  data: Snapshot;
  status?: Status;
  busy: boolean;
  mutate: Mutate;
  logout: () => void;
}) {
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">YOUR SPACE, YOUR CONTROL</span>
          <h1>工作台设置</h1>
          <p>连接、学习与数据状态，都保持清晰。</p>
        </div>
      </div>
      <section className="panel settings-panel">
        <div>
          <span>助手连接</span>
          <Badge tone={status?.live ? 'green' : ''}>{modelLabel(status)}</Badge>
        </div>
        <div>
          <span>自动学习</span>
          <button
            className="secondary small"
            disabled={busy}
            onClick={() =>
              void mutate('learning', { enabled: !data.learningEnabled }).catch(() => {})
            }
          >
            {data.learningEnabled ? '暂停' : '恢复'}
          </button>
        </div>
        <div>
          <span>模型请求额度（累计）</span>
          <strong>
            {status?.budget.used.calls ?? 0} / {status?.budget.limits.maxCalls ?? 0} 次
          </strong>
        </div>
        <div>
          <span>整理队列</span>
          <strong>
            {data.jobs.filter((row) => row.status === 'pending').length} 待处理 ·{' '}
            {data.jobs.filter((row) => row.status === 'failed').length} 失败
          </strong>
        </div>
        <div>
          <span>需求与经验</span>
          <p>保存在工作台的数据目录；不会自动修改研发仓库。</p>
        </div>
        <div>
          <span>离开工作台</span>
          <button className="text-button" onClick={logout}>
            退出登录
          </button>
        </div>
      </section>
    </>
  );
}
