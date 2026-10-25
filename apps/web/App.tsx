import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { api, empty, modelLabel, type Snapshot, type Status } from './api.ts';
import { Icon, Badge, Empty } from './components.tsx';
import { Overview } from './Overview.tsx';
import { TasksPage } from './TasksPage.tsx';
import { FeedbackPage, KnowledgePage } from './LearningPages.tsx';
import { Assistant } from './Assistant.tsx';

const navigation = [
  { id: 'home', name: '工作台', icon: 'home' },
  { id: 'assistant', name: '运营助手', icon: 'chat' },
  { id: 'tasks', name: '任务清单', icon: 'tasks' },
  { id: 'feedback', name: '改进反馈', icon: 'feedback' },
  { id: 'knowledge', name: '经验与记忆', icon: 'book' },
];
const future = [
  { id: 'activities', name: '活动日历', icon: 'calendar' },
  { id: 'inventory', name: '库存补货', icon: 'box' },
  { id: 'shipping', name: '发货协同', icon: 'box' },
  { id: 'advertising', name: '广告分析', icon: 'chart' },
];
export function App() {
  const [page, setPage] = useState('home');
  const [status, setStatus] = useState<Status>();
  const [data, setData] = useState<Snapshot>(empty);
  const [ready, setReady] = useState(false);
  const [authenticated, setAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [initialPrompt, setInitialPrompt] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const refresh = useCallback(async () => {
    const [nextStatus, snapshot] = await Promise.all([
      api<Status>('status'),
      api<Snapshot>('snapshot'),
    ]);
    setStatus(nextStatus);
    setData(snapshot);
    setAuthenticated(true);
  }, []);
  useEffect(() => {
    void refresh()
      .catch(() => setAuthenticated(false))
      .finally(() => setReady(true));
  }, [refresh]);
  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(''), 3500);
    return () => clearTimeout(timer);
  }, [notice]);
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    setBusy(true);
    setError('');
    try {
      await api('login', { password: values.get('password') });
      await refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : '登录未完成');
    } finally {
      setBusy(false);
    }
  }
  async function mutate(action: string, body: object): Promise<unknown> {
    setBusy(true);
    setError('');
    try {
      const result = await api(`actions/${action}`, body);
      await refresh();
      setNotice(action === 'export' ? '需求审阅包已生成' : '已保存');
      return result;
    } catch (error) {
      setError(error instanceof Error ? error.message : '操作未完成');
      throw error;
    } finally {
      setBusy(false);
    }
  }
  function navigate(next: string) {
    setPage(next);
    setMenuOpen(false);
    setError('');
  }
  function prompt(text: string) {
    setInitialPrompt(text);
    navigate('assistant');
  }
  if (!ready)
    return (
      <div className="initial-loading">
        <div className="brand-mark">
          c<span>c</span>
        </div>
        <p>正在打开你的工作台…</p>
      </div>
    );
  if (!authenticated)
    return (
      <main className="login-screen">
        <div className="login-decoration" />
        <section className="login-card">
          <div className="brand">
            <div className="brand-mark">
              c<span>c</span>
            </div>
            <div>
              <strong>cc 的工作台</strong>
              <small>OPERATIONS COMPANION</small>
            </div>
          </div>
          <span className="eyebrow">A CALMER WAY TO WORK</span>
          <h1>cc，你好！</h1>
          <p>
            整理任务，积累经验。
            <br />
            从这里开始，让每天的运营轻一点。
          </p>
          <form onSubmit={(event) => void login(event)}>
            <label>
              工作台密码
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                placeholder="输入你的访问密码"
                required
                autoFocus
              />
            </label>
            {error && (
              <div className="error-message" role="alert">
                {error}
              </div>
            )}
            <button className="primary" disabled={busy}>
              进入工作台 <Icon name="arrow" size={17} />
            </button>
          </form>
          <small>登录后可整理任务、反馈和经验；模型连接状态会单独显示。</small>
        </section>
        <div className="login-caption">少一些重复，多一些从容。</div>
      </main>
    );
  const name =
    [...navigation, ...future, { id: 'settings', name: '设置' }].find((item) => item.id === page)
      ?.name ?? '工作台';
  return (
    <div className="app-shell">
      <button
        className={`mobile-backdrop ${menuOpen ? 'visible' : ''}`}
        aria-label="关闭菜单"
        onClick={() => setMenuOpen(false)}
      />
      <aside className={`sidebar ${menuOpen ? 'open' : ''}`}>
        <button className="brand" onClick={() => navigate('home')}>
          <div className="brand-mark">
            c<span>c</span>
          </div>
          <div>
            <strong>cc 的工作台</strong>
            <small>OPERATIONS COMPANION</small>
          </div>
        </button>
        <nav aria-label="主要导航">
          {navigation.map((item) => (
            <button
              key={item.id}
              className={page === item.id ? 'active' : ''}
              onClick={() => navigate(item.id)}
            >
              <Icon name={item.icon} />
              <span>{item.name}</span>
              {item.id === 'tasks' &&
                data.tasks.filter((row) => ['open', 'in_progress', 'draft'].includes(row.status))
                  .length > 0 && (
                  <small>
                    {
                      data.tasks.filter((row) =>
                        ['open', 'in_progress', 'draft'].includes(row.status),
                      ).length
                    }
                  </small>
                )}
            </button>
          ))}
          <div className="nav-label">
            业务工具 <span>后续开放</span>
          </div>
          {future.map((item) => (
            <button
              key={item.id}
              className={`planned ${page === item.id ? 'active' : ''}`}
              onClick={() => navigate(item.id)}
            >
              <Icon name={item.icon} />
              <span>{item.name}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="learning-mini">
            <span className={`status-dot ${data.learningEnabled ? '' : 'muted'}`} />
            <span>{data.learningEnabled ? '在你的确认中，慢慢学习' : '自动学习已暂停'}</span>
          </div>
          <button
            className={`settings-link ${page === 'settings' ? 'active' : ''}`}
            onClick={() => navigate('settings')}
          >
            <Icon name="settings" />
            <span>工作台设置</span>
          </button>
          <div className="profile">
            <div>cc</div>
            <p>
              <strong>cc</strong>
              <span>专属运营空间</span>
            </p>
            <span className="profile-dot" />
          </div>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div>
            <button className="mobile-menu" aria-label="打开菜单" onClick={() => setMenuOpen(true)}>
              ☰
            </button>
            <span className="breadcrumb">
              我的空间 <span>/</span> <strong>{name}</strong>
            </span>
          </div>
          <div className="topbar-right">
            <span className="connection">
              <span className={`status-dot ${status?.live ? '' : 'muted'}`} />
              {modelLabel(status)}
            </span>
            <span className="private-label">专属工作台</span>
            <div className="avatar-small">cc</div>
          </div>
        </header>
        <main className={`main-content ${page === 'assistant' ? 'chat-main' : ''}`}>
          {error && (
            <div className="error-message global-error" role="alert">
              {error}
              <button aria-label="关闭提示" onClick={() => setError('')}>
                <Icon name="close" size={16} />
              </button>
            </div>
          )}
          {page === 'home' && (
            <Overview data={data} status={status} navigate={navigate} prompt={prompt} />
          )}{' '}
          {page === 'assistant' && (
            <Assistant
              data={data}
              status={status}
              initialPrompt={initialPrompt}
              refresh={refresh}
              reportError={setError}
            />
          )}{' '}
          {page === 'tasks' && <TasksPage data={data} mutate={mutate} busy={busy} />}{' '}
          {page === 'feedback' && <FeedbackPage data={data} mutate={mutate} busy={busy} />}{' '}
          {page === 'knowledge' && <KnowledgePage data={data} mutate={mutate} busy={busy} />}
          {future.some((item) => item.id === page) && (
            <>
              <div className="page-heading">
                <div>
                  <span className="eyebrow">COMING IN THE NEXT WAVES</span>
                  <h1>{name}</h1>
                  <p>将按计划接入运营流程。</p>
                </div>
                <Badge>规划中</Badge>
              </div>
              <section className="panel">
                <Empty
                  icon={future.find((item) => item.id === page)!.icon}
                  title="这个业务模块正在准备中"
                  text="当前可以先在任务清单中记录准备事项；这里暂不进行真实业务分析或外部操作。"
                />
              </section>
            </>
          )}
          {page === 'settings' && (
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
                  <button
                    className="text-button"
                    onClick={() =>
                      void api('logout', {}).then(() => {
                        setAuthenticated(false);
                        setData(empty);
                      })
                    }
                  >
                    退出登录
                  </button>
                </div>
              </section>
            </>
          )}
        </main>
        <footer className="workspace-footer">
          <span>cc 的运营工作台</span>
          <span>让工作有序，让经验留下。</span>
        </footer>
      </div>
      {notice && (
        <div className="toast" role="status">
          <Icon name="check" size={17} />
          {notice}
        </div>
      )}
    </div>
  );
}
