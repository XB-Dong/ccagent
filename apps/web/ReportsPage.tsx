import { useState } from 'react';
import type { ReportInput } from '../../packages/operations/reports.ts';
import type { Snapshot } from './api.ts';
import type { Mutate } from './TasksPage.tsx';
import { Badge, Empty } from './components.tsx';

const columns = {
  sales: ['date', 'listing', 'units'],
  ads: [
    'date',
    'listing',
    'campaign',
    'searchTerm',
    'impressions',
    'clicks',
    'spend',
    'orders',
    'revenue',
    'currency',
  ],
};
export function ReportsPage({
  data,
  mutate,
  busy,
}: {
  data: Snapshot;
  mutate: Mutate;
  busy: boolean;
}) {
  const [kind, setKind] = useState<'sales' | 'ads'>('sales');
  const [csv, setCSV] = useState('');
  const [mapping, setMapping] = useState('{}');
  const [store, setStore] = useState('');
  const [site, setSite] = useState('US');
  const [asOf, setAsOf] = useState('');
  const [preview, setPreview] = useState<{
    rows: Record<string, string | number>[];
    warnings: string[];
  }>();
  const [pending, setPending] = useState<ReportInput>();
  const [localError, setLocalError] = useState('');
  async function inspect() {
    setLocalError('');
    try {
      const input = { kind, csv, mapping: JSON.parse(mapping), store, site, asOf };
      const result = await mutate('report-preview', input);
      setPreview(result as typeof preview);
      setPending(input);
    } catch (error) {
      setLocalError(error instanceof Error ? error.message : '预览失败');
      setPreview(undefined);
      setPending(undefined);
    }
  }
  function sample() {
    const fields = columns[kind];
    setStore('合成示例店');
    setAsOf('2026-10-25');
    setCSV(
      kind === 'sales'
        ? 'date,listing,units\n2026-10-25,DEMO-A,5'
        : 'date,listing,campaign,searchTerm,impressions,clicks,spend,orders,revenue,currency\n2026-10-25,DEMO-A,合成广告,合成搜索词,1000,20,15,2,60,USD',
    );
    setMapping(JSON.stringify(Object.fromEntries(fields.map((f) => [f, f])), null, 2));
    setPreview(undefined);
    setPending(undefined);
  }
  return (
    <>
      <div className="page-heading">
        <div>
          <span className="eyebrow">KNOW YOUR INPUTS</span>
          <h1>数据报表</h1>
          <p>预览、核对列映射，再确认导入。当前请使用合成数据。</p>
        </div>
        <button onClick={sample}>填入合成示例</button>
      </div>
      <section className="panel form-grid">
        <label>
          报表类型
          <select
            value={kind}
            onChange={(e) => {
              setKind(e.target.value as 'sales' | 'ads');
              setPreview(undefined);
              setPending(undefined);
            }}
          >
            <option value="sales">日销量</option>
            <option value="ads">广告明细</option>
          </select>
        </label>
        <label>
          店铺
          <input value={store} onChange={(e) => setStore(e.target.value)} maxLength={100} />
        </label>
        <label>
          站点
          <input value={site} onChange={(e) => setSite(e.target.value)} maxLength={30} />
        </label>
        <label>
          数据截至日期
          <input type="date" value={asOf} onChange={(e) => setAsOf(e.target.value)} />
        </label>
        <label className="wide">
          选择 CSV
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              if (f.size > 100000) {
                setLocalError('文件超过100KB');
                return;
              }
              void f.text().then((text) => {
                setCSV(text);
                setPreview(undefined);
                setPending(undefined);
              });
            }}
          />
        </label>
        <label className="wide">
          CSV 内容
          <textarea
            rows={7}
            value={csv}
            onChange={(e) => {
              setCSV(e.target.value);
              setPreview(undefined);
              setPending(undefined);
            }}
            placeholder={columns[kind].join(',')}
          />
        </label>
        <label className="wide">
          列映射（规范名 → CSV标题）
          <textarea
            rows={5}
            value={mapping}
            onChange={(e) => {
              setMapping(e.target.value);
              setPreview(undefined);
              setPending(undefined);
            }}
          />
          <small>规范列：{columns[kind].join('、')}。空值、负数和重复记录不会被自动修补。</small>
        </label>
        <div className="form-actions wide">
          <button disabled={busy} className="primary" onClick={() => void inspect()}>
            检查并预览
          </button>
        </div>
      </section>
      {localError && (
        <p role="alert" className="error-message">
          {localError}
        </p>
      )}
      {preview && pending && (
        <section className="panel">
          <h2>预览 · {preview.rows.length} 行</h2>
          <p>
            {pending.store} / {pending.site} / 截至 {pending.asOf}
          </p>
          {preview.warnings.map((w) => (
            <p key={w}>{w}</p>
          ))}
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  {Object.keys(preview.rows[0]).map((k) => (
                    <th key={k}>{k}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.rows.slice(0, 6).map((r, i) => (
                  <tr key={i}>
                    {Object.values(r).map((v, j) => (
                      <td key={j}>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button
            className="primary"
            disabled={busy}
            onClick={() =>
              void mutate('report-import', pending)
                .then(() => {
                  setPreview(undefined);
                  setPending(undefined);
                })
                .catch(() => {})
            }
          >
            确认导入这份预览
          </button>
        </section>
      )}
      {!data.reports.length && (
        <section className="panel">
          <Empty
            icon="chart"
            title="每个结论都从数据开始"
            text="导入后的批次、日期和来源会保留；缺失日期不会视为零销量。"
          />
        </section>
      )}
      {data.reports.map((r) => (
        <section className="panel" key={r.id}>
          <Badge>{r.reportKind === 'sales' ? '销量' : '广告'}</Badge>
          <h3>
            {r.store} · {r.site}
          </h3>
          <p>
            截至 {r.asOf} · {r.rows.length} 行 · 批次 {r.id.slice(0, 8)}
          </p>
          <small>校验摘要 {r.contentHash.slice(0, 16)}</small>
        </section>
      ))}
    </>
  );
}
